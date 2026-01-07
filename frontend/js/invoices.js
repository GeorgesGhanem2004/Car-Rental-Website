// frontend/js/invoices.js

document.addEventListener('DOMContentLoaded', async () => {
    const tbody       = document.getElementById('booking-history-body');
    const token       = localStorage.getItem('authToken');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
    try {
      const res = await fetch('/api/invoices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const invoices = await res.json();
      if (!res.ok) throw new Error(invoices.error || 'Failed to load invoices');
  
      invoices.forEach(inv => {
        inv.reservations.forEach(r => {
          // gather extras
          const extrasList = [];
          if (r.services.chauffeur) extrasList.push('Chauffeur');
          if (r.services.babySeat)  extrasList.push('Baby Seat');
          if (r.services.gps)       extrasList.push('GPS');
          const extras = extrasList.length ? extrasList.join(', ') : '–';
  
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${currentUser.name}</td>
            <td>${r.pickupBranch}</td>
            <td>${r.returnBranch}</td>
            <td>${r.driver.name}</td>
            <td>${r.driver.age}</td>
            <td>${new Date(r.pickupAt).toLocaleString()}</td>
            <td>${new Date(r.returnAt).toLocaleString()}</td>
            <td>${extras}</td>
            <td>${r.services.insurance}</td>
            <td>${r.services.fuel}</td>
            <td>$${r.totalPrice.toFixed(2)}</td>
            <td>${r.status}</td>
          `;
          tbody.appendChild(tr);
        });
      });
    } catch (err) {
      console.error(err);
      tbody.innerHTML = `
        <tr>
          <td colspan="12" style="color:red; text-align:center;">
            Error loading invoices.
          </td>
        </tr>`;
    }
  });