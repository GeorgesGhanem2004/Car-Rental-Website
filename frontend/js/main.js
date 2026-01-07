// frontend/js/main.js

document.addEventListener('DOMContentLoaded', () => {
  // Modal elements
  const authModal   = document.getElementById('auth-modal');
  const openBtn     = document.getElementById('open-auth-modal') || document.getElementById('auth-trigger');
  const closeBtn    = document.getElementById('close-modal');

  // A) Open & close modal only if elements exist
  if (openBtn && authModal) {
    openBtn.addEventListener('click', () => authModal.style.display = 'block');
  }
  if (closeBtn && authModal) {
    closeBtn.addEventListener('click', () => authModal.style.display = 'none');
    window.addEventListener('click', e => {
      if (e.target === authModal) authModal.style.display = 'none';
    });
  }

  // B) Toggle between Sign Up / Log In views
  const signupFormContainer = document.getElementById('signup-form');
  const loginFormContainer  = document.getElementById('login-form');
  const showLogin           = document.getElementById('show-login');
  const showSignup          = document.getElementById('show-signup');

  if (showLogin && signupFormContainer && loginFormContainer) {
    showLogin.addEventListener('click', () => {
      signupFormContainer.style.display = 'none';
      loginFormContainer.style.display  = 'block';
    });
  }
  if (showSignup && signupFormContainer && loginFormContainer) {
    showSignup.addEventListener('click', () => {
      loginFormContainer.style.display  = 'none';
      signupFormContainer.style.display = 'block';
    });
  }

  // C) Sign Up handler
  if (signupFormContainer) {
    const form = signupFormContainer.querySelector('form');
    if (form) {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const name     = document.getElementById('signup-name').value.trim();
        const email    = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm  = document.getElementById('signup-confirm-password').value;

        if (password !== confirm) {
          alert('Passwords do not match');
          return;
        }

        try {
          const res = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || 'Sign up failed');

          localStorage.setItem('authToken', json.token);
          localStorage.setItem('user', JSON.stringify(json.user));
          authModal && (authModal.style.display = 'none');
          window.updateAuthState();

          const redirectUrl = localStorage.getItem('redirectUrl') || '/index.html';
          localStorage.removeItem('redirectUrl');
          window.location.href = redirectUrl;

        } catch (err) {
          alert('Error: ' + err.message);
        }
      });
    }
  }

  // D) Log In handler
  if (loginFormContainer) {
    const form = loginFormContainer.querySelector('form');
    if (form) {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const email    = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        try {
          const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || 'Login failed');

          localStorage.setItem('authToken', json.token);
          localStorage.setItem('user', JSON.stringify(json.user));
          authModal && (authModal.style.display = 'none');
          window.updateAuthState();

          const redirectUrl = localStorage.getItem('redirectUrl') || '/index.html';
          localStorage.removeItem('redirectUrl');
          window.location.href = redirectUrl;

        } catch (err) {
          alert('Error: ' + err.message);
        }
      });
    }
  }

});

// E) Update navbar avatar & name whenever auth state changes
window.updateAuthState = async function() {
  const token = localStorage.getItem('authToken');
  if (!token) return;
  try {
    const res = await fetch('/api/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const user = await res.json();
    // Update stored user
    localStorage.setItem('user', JSON.stringify(user));
    // Update all navbar profile pics and names
    document.querySelectorAll('.profile-pic').forEach(img => img.src = user.profilePicture || '/assets/default-profile.png');
    document.querySelectorAll('.profile-name').forEach(el => el.textContent = user.name);
  } catch (err) {
    console.error('Failed to update auth state:', err);
  }
};

// Run once on load to sync avatar
window.updateAuthState();
