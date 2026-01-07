// frontend/js/adminCarGroups.js

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#groupsTable tbody');
  const token = localStorage.getItem('authToken');
  let groupsCache = [];

  // Load and render all car groups
  async function loadGroups() {
    const res = await fetch('/api/admin/groups', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      console.error('Failed to load car groups', await res.json());
      return;
    }
    groupsCache = await res.json();
    console.log('CAR GROUPS:', groupsCache);

    tbody.innerHTML = groupsCache.map(g => `
      <tr data-id="${g._id}">
        <td>${g.name}</td>
        <td>${g.description || ''}</td>
        <td>
          Engine Size: ${g.engineSize}<br>
          Doors: ${g.numDoors}<br>
          Passengers: ${g.numPassengers}<br>
          Fuel Type: ${g.fuelType}<br>
          Gearbox: ${g.gearbox}<br>
          AC: ${g.hasAC ? 'Yes' : 'No'}<br>
          Electric Windows: ${g.electricWindows ? 'Yes' : 'No'}
        </td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </td>
      </tr>
    `).join('');
    attachListeners();
  }

  // Attach handlers for Edit/Delete/Create
  function attachListeners() {
    // Delete handlers
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        const tr = e.target.closest('tr');
        if (!confirm('Delete this group?')) return;
        const res = await fetch(`/api/admin/groups/${tr.dataset.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) tr.remove();
        else console.error('Delete failed', await res.json());
      });
    });

    // Edit handlers
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        const tr = e.target.closest('tr');
        const id = tr.dataset.id;
        const g = groupsCache.find(x => x._id === id);

        // Prompt with existing defaults; null -> keep old
        let name            = prompt('Name:', g.name);
        if (name === null) name = g.name;

        let description     = prompt('Description:', g.description || '');
        if (description === null) description = g.description;

        let engineSizeInput = prompt('Engine Size (cc):', g.engineSize);
        const engineSize    = engineSizeInput === null ? g.engineSize : Number(engineSizeInput);

        let numDoorsInput   = prompt('Number of Doors:', g.numDoors);
        const numDoors      = numDoorsInput   === null ? g.numDoors   : Number(numDoorsInput);

        let numPassengersInput = prompt('Number of Passengers:', g.numPassengers);
        const numPassengers   = numPassengersInput === null ? g.numPassengers : Number(numPassengersInput);

        let fuelType        = prompt('Fuel Type:', g.fuelType);
        if (fuelType === null) fuelType = g.fuelType;

        let gearbox         = prompt('Gearbox:', g.gearbox);
        if (gearbox === null) gearbox = g.gearbox;

        let hasACInput      = prompt('Has AC? (true/false):', g.hasAC);
        const hasAC         = hasACInput      === null ? g.hasAC : hasACInput.toLowerCase() === 'true';

        let electricWindowsInput = prompt('Electric Windows? (true/false):', g.electricWindows);
        const electricWindows    = electricWindowsInput === null ? g.electricWindows : electricWindowsInput.toLowerCase() === 'true';

        const res = await fetch(`/api/admin/groups/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name, description, engineSize, numDoors, numPassengers, fuelType, gearbox, hasAC, electricWindows })
        });
        if (res.ok) loadGroups();
        else console.error('Update failed', await res.json());
      });
    });

    // Create new group
    document.getElementById('addGroupBtn').addEventListener('click', async () => {
      let name             = prompt('Group name:');
      if (name === null) return;

      let description      = prompt('Description (optional):', '');
      if (description === null) description = '';

      let engineSizeInput  = prompt('Engine Size (cc):');
      if (engineSizeInput === null) return;
      const engineSize     = Number(engineSizeInput);

      let numDoorsInput    = prompt('Number of Doors:');
      if (numDoorsInput === null) return;
      const numDoors       = Number(numDoorsInput);

      let numPassengersInput = prompt('Number of Passengers:');
      if (numPassengersInput === null) return;
      const numPassengers    = Number(numPassengersInput);

      let fuelType         = prompt('Fuel Type:');
      if (fuelType === null) return;

      let gearbox          = prompt('Gearbox:');
      if (gearbox === null) return;

      let hasACInput       = prompt('Has AC? (true/false):');
      if (hasACInput === null) return;
      const hasAC          = hasACInput.toLowerCase() === 'true';

      let electricWindowsInput = prompt('Electric Windows? (true/false):');
      if (electricWindowsInput === null) return;
      const electricWindows    = electricWindowsInput.toLowerCase() === 'true';

      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, engineSize, numDoors, numPassengers, fuelType, gearbox, hasAC, electricWindows })
      });
      if (res.ok) loadGroups();
      else console.error('Create failed', await res.json());
    });
  }

  // Initial load
  loadGroups();
});
