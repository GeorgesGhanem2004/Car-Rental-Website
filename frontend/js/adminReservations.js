// frontend/js/adminReservations.js

document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('#reservationsTable tbody');
    const token = localStorage.getItem('authToken');
  
    // Fetch and render all reservations
    async function loadReservations() {
      const res = await fetch('/api/admin/reservations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        console.error('Failed to load reservations', await res.json());
        return;
      }
  
      const list = await res.json();
      console.log('RESERVATIONS:', list);
  
      tbody.innerHTML = list.map(r => `
        <tr data-id="${r._id}">
          <td>
            ${
              r.user
                ? `${r.user.name} (${r.user.email})`
                : `${r.driverName} (age ${r.driverAge})`
            }
          </td>
          <td>
            ${
              r.car
                ? `${r.car.brand} ${r.car.model}`
                : 'N/A'
            }
          </td>
          <td>${new Date(r.pickupAt).toLocaleString()}</td>
          <td>${new Date(r.returnAt).toLocaleString()}</td>
          <td>
            <select class="status-select">
              ${['saved','completed','cancelled','quoted'].map(s => `
                <option value="${s}" ${r.status === s ? 'selected' : ''}>${s}</option>
              `).join('')}
            </select>
          </td>
          <td><button class="save-btn">Save</button></td>
        </tr>
      `).join('');
  
      attachListeners();
    }
  
    // Wire up status‑change buttons
    function attachListeners() {
      document.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', async e => {
          const tr = e.target.closest('tr');
          const id = tr.dataset.id;
          const status = tr.querySelector('.status-select').value;
          const res = await fetch(`/api/admin/reservations/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
          });
          if (!res.ok) {
            console.error('Failed to update reservation', await res.json());
          }
        });
      });
    }
  
    loadReservations();
  });