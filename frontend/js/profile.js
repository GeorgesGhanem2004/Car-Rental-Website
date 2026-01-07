document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return; // not logged in
  
    try {
      const res = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load profile.');
  
      const user = await res.json();
      const maxPoints = 5000;
      const pts = user.points || 0;
      const pct = Math.min((pts / maxPoints) * 100, 100);
  
      // Populate credentials
      document.getElementById('profile-fullname').textContent = user.name;
      document.getElementById('profile-email').textContent    = user.email;
  
      // Populate points
      document.getElementById('total-points').textContent     = pts;
      document.getElementById('points-fill').style.width      = pct + '%';
      document.getElementById('points-remaining').textContent =
        pts >= maxPoints
          ? `You’ve reached the maximum of ${maxPoints} points!`
          : `You have ${maxPoints - pts} points remaining.`;
  
    } catch (err) {
      console.error(err);
    }
  });