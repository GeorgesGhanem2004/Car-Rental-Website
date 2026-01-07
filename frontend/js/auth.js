// frontend/js/auth.js

// Auth State Management
const updateAuthState = () => {
    const isLoggedIn = !!localStorage.getItem('authToken');
    
    // Toggle UI elements
    document.querySelectorAll('.auth-only').forEach(el => {
      el.style.display = isLoggedIn ? 'block' : 'none';
    });
    document.querySelectorAll('.public-only').forEach(el => {
      el.style.display = isLoggedIn ? 'none' : 'block';
    });
  
    // Update profile
    if(isLoggedIn) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const profilePic = document.querySelector('.profile-pic');
      if(profilePic) {
        profilePic.src = user?.avatar || '/assets/default-profile.png';
      }
      const profileName = document.querySelector('.profile-name');
      if(profileName) {
        profileName.textContent = user?.name || 'User';
      }
    }
    document.body.clientHeight;
  };
  
  // Logout Handler
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    updateAuthState();
    window.location.href = '/index.html';
  });
  
  // Mobile Menu Toggle
  document.querySelector('.hamburger')?.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('active');
  });

  // Add modal trigger handler
    document.getElementById('open-auth-modal')?.addEventListener('click', () => {
    document.getElementById('auth-modal').style.display = 'block';
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
  });
  
  // Initialize
  document.addEventListener('DOMContentLoaded', updateAuthState);
  
  // Make available globally
  window.updateAuthState = updateAuthState;