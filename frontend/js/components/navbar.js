// frontend/js/components/navbar.js
class Navbar {
    constructor() {
      this.render();
      this.addEventListeners();
    }
  
    render() {
      document.body.insertAdjacentHTML('afterbegin', `
        <nav class="navbar">
          <div class="nav-container">
            <a href="index.html" class="nav-brand">Car Rental</a>
            
            <div class="nav-links">
              <a href="index.html" class="nav-link public-only">Home</a>
              <a href="carGroups.html" class="nav-link public-only">Cars</a>
              <a href="reviews.html" class="nav-link auth-only">Reviews</a>
            </div>
  
            <div class="nav-right">
              <button class="nav-button public-only" data-auth="signup">Join Us</button>
              
              <div class="auth-only profile-menu">
                <div class="profile-icon">
                  <img src="./assets/default-profile.png" alt="Profile">
                  <span class="profile-name"></span>
                </div>
                <div class="profile-dropdown">
                  <a href="profile.html">Profile</a>
                  <a href="bookings.html">Bookings</a>
                  <button id="logout-btn">Log Out</button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      `);
    }
  
    addEventListeners() {
      // Profile dropdown
      document.addEventListener('click', (e) => {
        const profileIcon = e.target.closest('.profile-icon');
        const dropdown = document.querySelector('.profile-dropdown');
        
        if (profileIcon) {
          dropdown.classList.toggle('show');
        } else if (!e.target.closest('.profile-dropdown')) {
          dropdown.classList.remove('show');
        }
      });
  
      // Logout handler
      document.getElementById('logout-btn')?.addEventListener('click', () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('currentUser');
        this.updateAuthState();
      });
    }
  
    updateAuthState() {
      const isLoggedIn = !!localStorage.getItem('jwtToken');
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
      // Toggle elements
      document.querySelectorAll('.auth-only').forEach(el => {
        el.style.display = isLoggedIn ? 'flex' : 'none';
      });
      document.querySelectorAll('.public-only').forEach(el => {
        el.style.display = isLoggedIn ? 'none' : 'flex';
      });
  
      // Update profile
      if (isLoggedIn) {
        document.querySelector('.profile-name').textContent = user.name || 'User';
      }
    }
  
    handleAuthCheck(event) {
      if (!localStorage.getItem('jwtToken')) {
        event.preventDefault();
        localStorage.setItem('redirectUrl', event.target.href);
        document.querySelector('[data-auth="login"]').click();
      }
    }
  }