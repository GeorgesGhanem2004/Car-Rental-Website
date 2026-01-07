/*  frontend/js/carGroup.browser.js  */
document.addEventListener('DOMContentLoaded', async () => {
    /* ---- 1) Which group? ------------------------------------------ */
    const groupName = new URLSearchParams(window.location.search).get('group') || 'SUV';
  
    /* ---- 2) Fetch specs + cars from backend ------------------------ */
    const res = await fetch(`/api/carGroups/${encodeURIComponent(groupName)}`);
    if (!res.ok) {
      alert('Car group not found');
      return;
    }
    const { specs, cars } = await res.json();
  
    /* ---- 3) Page title + heading ---------------------------------- */
    document.title = `Car Rental – ${groupName}`;
    document.querySelector('.title-container h1').textContent = groupName.toUpperCase();
  
    /* ---- 4) Fill the spec-table ----------------------------------- */
    const row = document.querySelector('.car-specs-table tbody tr');
    row.innerHTML = `
      <td>${specs.engineSize || '—'} cc</td>
      <td>${specs.numDoors}</td>
      <td>${specs.numPassengers}</td>
      <td>${specs.fuelType}</td>
      <td>${specs.gearbox}</td>
      <td>${specs.hasAC ? 'Yes' : 'No'}</td>
      <td>${specs.electricWindows ? 'Yes' : 'No'}</td>
    `;
  
    /* ---- 5) Build the car cards with auth checks ------------------ */
    const grid = document.querySelector('.cards-grid');
    grid.innerHTML = '';
  
    cars.forEach(car => {
      const src = `../assets/${encodeURI(car.imagePath)}`;
      
      grid.insertAdjacentHTML('beforeend', `
        <div class="card-container">
          <div class="card-img-container">
            <img src="${src}" alt="${car.brand} ${car.model}">
          </div>
          <div class="card-content-container">
            <p><strong>Brand:</strong> ${car.brand}</p>
            <p><strong>Model:</strong> ${car.model}</p>
            <p><strong>Daily fee:</strong> $${car.dailyRate}</p>
            <div class="rent-button">
              <a href="reservation.html?car=${car._id}" 
                 class="btn rent-btn" 
                 data-car-id="${car._id}">
                Rent
              </a>
            </div>
          </div>
        </div>
      `);
    });
  
    /* ---- 6) Rent Button Authentication Handling ------------------- */
    document.querySelectorAll('.rent-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Check authentication status
        if (!localStorage.getItem('authToken')) {
          e.preventDefault();
          
          // Store intended reservation URL
          const targetUrl = e.target.closest('a').href;
          localStorage.setItem('redirectUrl', targetUrl);
          
          // Trigger auth modal
          const authTrigger = document.getElementById('auth-trigger');
          if (authTrigger) authTrigger.click();
          
          // Optional: Switch to login tab if modal has tabs
          const loginTab = document.querySelector('[data-auth-type="login"]');
          if (loginTab) loginTab.click();
        }
      });
    });
  
    // Optional: Clear redirect URL if user navigates away
    window.addEventListener('beforeunload', () => {
      localStorage.removeItem('redirectUrl');
    });
  });