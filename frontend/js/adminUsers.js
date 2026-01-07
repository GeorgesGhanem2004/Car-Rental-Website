// Fetch and render all users, then wire up update/delete actions
document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('#usersTable tbody');
    const token = localStorage.getItem('authToken'); // adjust if you store JWT elsewhere
  
    async function loadUsers() {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const users = await res.json();
      tbody.innerHTML = users.map(u => `
        <tr data-id="${u._id}">
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>
            <select class="role-select">
              <option value="false" ${u.isAdmin ? '' : 'selected'}>User</option>
              <option value="true" ${u.isAdmin ? 'selected' : ''}>Admin</option>
            </select>
          </td>
          <td><button class="delete-btn">Delete</button></td>
        </tr>
      `).join('');
      attachListeners();
    }
  
    function attachListeners() {
      // Role changes
      document.querySelectorAll('.role-select').forEach(sel => {
        sel.addEventListener('change', async e => {
          const id = e.target.closest('tr').dataset.id;
          await fetch(`/api/admin/users/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isAdmin: e.target.value === 'true' })
          });
        });
      });
  
      // Deletions
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async e => {
          const tr = e.target.closest('tr');
          const id = tr.dataset.id;
          if (confirm('Delete this user?')) {
            await fetch(`/api/admin/users/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            tr.remove();
          }
        });
      });
    }
  
    loadUsers();
  });