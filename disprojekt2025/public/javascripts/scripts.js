// Login form håndtering - RETTET
const setupLoginForm = () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const loginData = {
        username: formData.get('brugernavn'),    // 🟢 Ret til "username"
        password: formData.get('adgangskode')    // 🟢 Ret til "password"
      };

      try {
        const response = await fetch('/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',  // 🟢 Vigtigt for cookies/session
          body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (data.success) {  // 🟢 Tjek data.success i stedet for response.ok
          // Login lykkedes, redirect til forside
          window.location.href = '/forside';
        } else {
          // Login fejlede, vis fejl
          alert(data.message || 'Login fejlede!');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Der skete en fejl under login!');
      }
    });
  }
}

// Opret bruger - RETTET
const createUser = () => {
  const form = document.getElementById("opretkonto");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("brugernavn").value;
      const password = document.getElementById("adgangskode").value;
      const email = document.getElementById("email").value;

      try {
        const response = await fetch("/auth/create", {  // 🟢 Brug /auth/create i stedet for /users/create
          method: "POST",
          headers: { 
            "Content-Type": "application/json" 
          },
          credentials: 'include',  // 🟢 Vigtigt for cookies
          body: JSON.stringify({ username, password, email }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          alert('Bruger oprettet succesfuldt!');
          window.location.href = 'login.html';
        } else {
          alert(data.message || 'Kunne ikke oprette bruger');
        }
      } catch (error) {
        console.error('Error creating user:', error);
        alert('Der skete en fejl under oprettelse af bruger');
      }
    });
  }
};