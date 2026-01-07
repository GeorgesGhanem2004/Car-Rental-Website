// frontend/js/reservation.js

document.addEventListener('DOMContentLoaded', () => {
    // Count badge per user
    const countSpan = document.getElementById('cart-count');
    if (countSpan) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const key = `cart_${user._id || 'guest'}`;
      const initialCart = JSON.parse(localStorage.getItem(key) || '[]');
      countSpan.textContent = initialCart.length;
    }
  
    // Pre-fill carId
    const params = new URLSearchParams(window.location.search);
    const carId = params.get('car');
    if (carId) document.getElementById('carId').value = carId;
  
    const form = document.getElementById('reserveForm');
    const msgDiv = document.createElement('p');
    form.appendChild(msgDiv);
  
    form.addEventListener('submit', async e => {
      e.preventDefault();
  
      const token = localStorage.getItem('authToken');
      if (!token) {
        msgDiv.style.color = '#c62828';
        msgDiv.textContent = 'Please log in first.';
        return;
      }
  
      // Build payload
      const extras = Array.from(form.querySelectorAll('input[name="addons"]:checked'))
                          .map(cb => cb.value);
  
      const payload = {
        car: document.getElementById('carId').value,
        pickupBranch: document.getElementById('pickupLocation').value,
        returnBranch: document.getElementById('dropLocation').value,
        pickupAt: document.getElementById('pickupDate').value,
        returnAt: document.getElementById('dropDate').value,
        driverName: document.getElementById('driverName').value,
        driverAge: Number(document.getElementById('driverAge').value),
        extras,
        insuranceOption: form.querySelector('input[name="insurance"]:checked')?.value || 'none',
        fuelOption: form.querySelector('input[name="fuel"]:checked')?.value || 'none'
      };
  
      try {
        msgDiv.style.color = '#333';
        msgDiv.textContent = 'Submitting your reservation...';
  
        const res = await fetch('/api/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
  
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Reservation failed');
  
        // grab the full saved reservation
        const reservation = json.reservation || json;
  
        msgDiv.style.color = '#2e7d32';
        msgDiv.textContent = `Success! Booking # ${reservation._id}`;
  
        // Add to per-user cart
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const key = `cart_${user._id || 'guest'}`;
        const cart = JSON.parse(localStorage.getItem(key) || '[]');
  
        cart.push({
          id: reservation._id,
          car: reservation.car,
          pickupBranch: reservation.pickupBranch,
          returnBranch: reservation.returnBranch,
          pickupAt: reservation.pickupAt,
          returnAt: reservation.returnAt,
          driver: reservation.driver,        // nested {name, age}
          services: reservation.services,    // nested {chauffeur, babySeat, gps, insurance, fuel}
          totalPrice: reservation.totalPrice // real price
        });
        localStorage.setItem(key, JSON.stringify(cart));
  
        if (countSpan) countSpan.textContent = cart.length;
      } catch (err) {
        msgDiv.style.color = '#c62828';
        msgDiv.textContent = err.message;
        console.error(err);
      }
    });
  });