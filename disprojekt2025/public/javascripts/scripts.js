const getUsers = async () => {
  try {
    const response = await fetch("/users",{ credentials: 'include' });
    const data = await response.json();
    console.log(response);
    console.log(data);
    alert(JSON.stringify(data));
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

const getUser = async (username) => {
  try {
    const response = await fetch(`/users/${username}`,{ credentials: 'include' });
    const data = await response.json();
    console.log(response);
    console.log(data);
    alert(JSON.stringify(data));
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}

// Vis brugernavn på forsiden når siden loader
const displayCurrentUser = async () => {
  const el = document.getElementById('brugernavnDisplay');
  if (!el) console.error('Element med id "brugernavnDisplay" ikke fundet');
  try {
    // Request current user from server (session-based)
    const response = await fetch('/auth/me', { credentials: 'include' });
    if (response.ok) {
      const data = await response.json();
      el.textContent = (data.user && data.user.username) || 'Bruger';
    } else {
      el.textContent = 'Ikke logget ind';
    }
  } catch (error) {
    console.error('Error fetching current user:', error);
    el.textContent = 'Fejl';
  }
};


const createUser = () => {
  const form = document.getElementById("opretkonto");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("brugernavn").value;
      const password = document.getElementById("adgangskode").value;
      const email = document.getElementById("email").value;

      fetch("/users/create", { credentials: 'include' },{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      })
        .then(res => res.json())
        .then(data => {
          alert(JSON.stringify(data));
          // Optional: Redirect to login after successful creation
          window.location.href = 'login.html';
        })
        .catch(err => console.error(err));
    });
  }
};

// Initialiser createUser når siden loader
document.addEventListener('DOMContentLoaded', function() {
  createUser();
  setupLoginForm();
  displayCurrentUser();
});

const setCookie = async () => {
  try {
    const response = await fetch("/cookie/set",{ credentials: 'include' });
    const data = await response.json();
    console.log(response);
    console.log(data);
    alert(data.message);
  } catch (error) {
    console.error('Error setting cookie:', error);
  }
}

const getCookie = async () => {
  try {
    const response = await fetch("/cookie/get",{ credentials: 'include' });
    const data = await response.json();
    console.log(response);
    console.log(data);
    alert(data.message);
  } catch (error) {
    console.error('Error getting cookie:', error);
  }
}

// Login form håndtering
const setupLoginForm = () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const loginData = {
        brugernavn: formData.get('brugernavn'),
        adgangskode: formData.get('adgangskode')
      };

      try {
        const response = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Login lykkedes, redirect til forside
          window.location.href = 'forside.html';
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

// Logout funktion
const logout = async () => {
  try {
    const response = await fetch('/auth/logout',{ credentials: 'include' }, {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(data.message);
      window.location.href = 'index.html';
    } else {
      alert('Logout fejlede!');
    }
  } catch (error) {
    console.error('Logout error:', error);
    alert('Der skete en fejl under logout!');
  }
}
