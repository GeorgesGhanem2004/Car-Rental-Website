// frontend/js/bookings.js

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  const container = document.getElementById('bookingsContainer');
  let data;

  try {
    // Fetch all reservations for this user
    const res = await fetch('/api/reservations', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch bookings');

    if (data.length === 0) {
      container.innerHTML = '<p class="message">You have no past bookings.</p>';
      return;
    }

    // Build table with an extra "Action" column
    const table = document.createElement('table');
    table.id = 'bookingsTable';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Car</th>
          <th>Pickup</th>
          <th>Return</th>
          <th>Price</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(r => {
          const statusText = r.status.charAt(0).toUpperCase() + r.status.slice(1);
          const resumeBtn = r.status === 'saved'
            ? `<button class="resume-btn" data-id="${r._id}">Resume</button>`
            : '';
          return `
            <tr>
              <td>${r.car.brand} ${r.car.model}</td>
              <td>${new Date(r.pickupAt).toLocaleString()}</td>
              <td>${new Date(r.returnAt).toLocaleString()}</td>
              <td>$${r.totalPrice.toFixed(2)}</td>
              <td class="${statusText}">${statusText}</td>
              <td>${resumeBtn}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    `;

    // Render table into page
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'table-responsive';
    wrapper.appendChild(table);
    container.appendChild(wrapper);

    // Wire up "Resume" buttons
    table.querySelectorAll('.resume-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const reservationId = btn.dataset.id;
        const reservation   = data.find(r => r._id === reservationId);
        if (!reservation) return;

        // Build a single-entry cart from this saved reservation
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const cartKey = `cart_${user._id || 'guest'}`;
        const entry = {
          id:           reservation._id,
          car:          reservation.car._id,
          pickupBranch: reservation.pickupBranch,
          returnBranch: reservation.returnBranch,
          pickupAt:     reservation.pickupAt,
          returnAt:     reservation.returnAt,
          driver:       reservation.driver,
          services:     reservation.services,
          totalPrice:   reservation.totalPrice
        };
        localStorage.setItem(cartKey, JSON.stringify([entry]));

        // Redirect to checkout to resume
        window.location.href = 'checkout.html';
      });
    });

  } catch (err) {
    container.innerHTML = `<p class="message" style="color:red;">Error: ${err.message}</p>`;
    console.error('Error loading bookings:', err);
  }
});