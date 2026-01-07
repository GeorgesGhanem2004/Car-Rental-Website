// frontend/js/adminCars.js

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#carsTable tbody');
  const token = localStorage.getItem('authToken');

  // Load and render all cars
  async function loadCars() {
    const res = await fetch('/api/admin/cars', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      console.error('Failed to load cars', await res.json());
      return;
    }
    const cars = await res.json();
    console.log('CARS:', cars);

    tbody.innerHTML = cars.map(c => `
      <tr data-id="${c._id}">
        <td>${c.group}</td>
        <td>${c.brand}</td>
        <td>${c.model}</td>
        <td>${c.year}</td>
        <td>${c.dailyRate}</td>
        <td>${c.imagePath}</td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </td>
      </tr>
    `).join('');
    attachListeners();
  }

  // Wire up Edit/Delete actions
  function attachListeners() {
    // Delete
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        const tr = e.target.closest('tr');
        if (!confirm('Delete this car?')) return;
        const res = await fetch(`/api/admin/cars/${tr.dataset.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) tr.remove();
        else console.error('Failed to delete', await res.json());
      });
    });

    // Edit
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        const tr = e.target.closest('tr');
        const id = tr.dataset.id;

        // Current values
        const current = {
          group:     tr.children[0].textContent,
          brand:     tr.children[1].textContent,
          model:     tr.children[2].textContent,
          year:      tr.children[3].textContent,
          dailyRate: tr.children[4].textContent,
          imagePath: tr.children[5].textContent
        };

        // Prompts
        const group     = prompt('Group:',        current.group)      || current.group;
        const brand     = prompt('Brand:',        current.brand)      || current.brand;
        const model     = prompt('Model:',        current.model)      || current.model;
        const yearInput = prompt('Year:',         current.year)       || current.year;
        const dailyRateInput = prompt('Daily rate:', current.dailyRate) || current.dailyRate;
        const imagePath = prompt('Image path:',   current.imagePath)  || current.imagePath;

        const year      = Number(yearInput);
        const dailyRate = Number(dailyRateInput);

        const res = await fetch(`/api/admin/cars/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ group, brand, model, year, dailyRate, imagePath })
        });
        if (res.ok) loadCars();
        else console.error('Update failed', await res.json());
      });
    });
  }

  // Add New Car
  document.getElementById('addCarBtn').addEventListener('click', () => {
    const group     = prompt('Group:');
    const brand     = prompt('Brand:');
    const model     = prompt('Model:');
    const yearInput = prompt('Year:');
    const dailyRateInput = prompt('Daily rate:');
    const imagePath = prompt('Image path:');

    if (!group || !brand || !model || !yearInput || !dailyRateInput || !imagePath) return;

    const year      = Number(yearInput);
    const dailyRate = Number(dailyRateInput);

    fetch('/api/admin/cars', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ group, brand, model, year, dailyRate, imagePath })
    })
    .then(async res => {
      if (res.ok) loadCars();
      else console.error('Create failed', await res.json());
    });
  });

  // Initial load
  loadCars();
});