// Vis brugernavn på forsiden KUN hvis element findes
const displayCurrentUser = async () => {
  const el = document.getElementById('brugernavnDisplay');
  if (!el) {
    // 🟢 Normalt - element findes kun på forside.html, ikke på login.html
    return;
  }
  
  try {
    const response = await fetch('/auth/me', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        el.textContent = data.user.username;
      } else {
        el.textContent = 'Ikke logget ind';
      }
    } else {
      el.textContent = 'Ikke logget ind';
    }
  } catch (error) {
    console.error('Error fetching current user:', error);
    if (el) el.textContent = 'Fejl';
  }
};

// Login form håndtering - FORBEDRET
const setupLoginForm = () => {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) {
    console.log('Login form ikke fundet - sandsynligvis ikke på login siden');
    return;
  }

  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const loginData = {
      username: document.getElementById('brugernavn')?.value,  // 🟢 Brug ?. for safety
      password: document.getElementById('adgangskode')?.value
    };

    console.log('Login forsøg med:', loginData);  // 🟢 Debug log

    // Valider input
    if (!loginData.username || !loginData.password) {
      alert('Udfyld både brugernavn og adgangskode!');
      return;
    }

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // 🟢 Vigtigt for session cookies
        body: JSON.stringify(loginData)
      });
      
      const data = await response.json();
      console.log('Login response:', data);  // 🟢 Debug log
      
      if (data.success) {
        // Login lykkedes
        alert('Login succesfuld! Velkommen ' + data.user.username);
        window.location.href = '/forside';  // 🟢 Redirect til forside
      } else {
        // Login fejlede
        alert('Login fejlede: ' + (data.message || 'Ukendt fejl'));
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Netværksfejl: Kunne ikke forbinde til serveren');
    }
  });
}

// Initialiser KUN de funktioner der findes på den aktuelle side
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initialiserer scripts for aktuel side');
  
  // Kør kun createUser hvis vi er på opret konto siden
  if (document.getElementById('opretkonto')) {
    createUser();
  }
  
  // Kør kun login hvis vi er på login siden  
  if (document.getElementById('loginForm')) {
    setupLoginForm();
  }
  
  // Prøv altid at hente current user (funktionen håndterer selv hvis element ikke findes)
  displayCurrentUser();
});