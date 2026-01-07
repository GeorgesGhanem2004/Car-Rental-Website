// frontend/js/homepage.js
// Dynamic homepage behavior: reviews, featured cars, statistics

document.addEventListener('DOMContentLoaded', () => {
  // ── Load and render random reviews ─────────────────
  (async function loadReviews() {
    try {
      const res = await fetch('/api/reviews?random=3');
      const reviews = await res.json();
      const wrapper = document.querySelector('.reviews-cards-wrapper');
      wrapper.innerHTML = reviews.map(r => `
        <div class="review-card">
          <div class="review-header">
            <img
              src="${r.user.profilePicture || '/assets/default-profile.png'}"
              alt="${r.user.name}"
              class="reviewer-img"
            >
            <div class="reviewer-info">
              <h3 class="reviewer-name">${r.user.name}</h3>
              <span class="review-date">${new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div class="review-body">
            <p class="review-comment">${r.comment}</p>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  })();

  // ── Load and display featured cars images ──────────
  const groups = {
    'Convertible': [
      '2019-mazda-mx-5-miata-convertible-sports-car.jpg',
      '2022-Porsche-718-Boxster-PVOTY22-18.jpg.avif',
      'bl79098.jpg'
    ],
    'EV': [
      '2025-tesla-model-s-1-672d42e172407.jpg.avif',
      'a9b25a99-74ae-4ce8-bf98-d20fd9b2b927_Front-moving.jpg',
      'discover-3.jpg'
    ],
    'Hybrid': [
      '2021-honda-insight-02-1634321384.jpg',
      '2025_toyota_prius_4dr-hatchback_limited_fq_oem_1_1600.jpg.avif',
      'Hyundai_Ioniq_5_AWD_Techniq-Paket_-_f_31122024.jpg'
    ],
    'Luxury Sedan': [
      '2025_mercedes-benz_s-class_sedan_amg-s_63-e-performance_fq_oem_1_1600.jpg.avif',
      '2025-Audi-A8.jpeg',
      'd183acf5d6da4d75bd417e2eddf8fd73.jpg'
    ],
    'Minivan': [
      'fca73ca58bc70e9be213920d58f3f2bf.jpg',
      'Honda-Odyssey-Exterior-2409.webp'
    ],
    'SUV': [
      '2025-ford-explorer-f34.jpg.avif',
      '2025-toyota-highlander-102-66e97932a6f77.jpg.avif',
      'BMW-X5-Electronic-Throttle-Drive-DME.jpg'
    ]
  };
  const rand = arr => arr[Math.floor(Math.random() * arr.length)];
  const imgs = Array.from(document.querySelectorAll('.featured-card img'));
  if (imgs.length) {
    const availableGroups = Object.keys(groups);
    const chosen = [];
    while (chosen.length < imgs.length && availableGroups.length) {
      chosen.push(availableGroups.splice(Math.floor(Math.random() * availableGroups.length), 1)[0]);
    }
    imgs.forEach((imgEl, i) => {
      const grp = chosen[i], files = groups[grp].slice();
      (function tryNext() {
        if (!files.length) return;
        const file = rand(files);
        files.splice(files.indexOf(file), 1);
        imgEl.onerror = tryNext;
        imgEl.src = `../assets/${grp}/${file}`;
        imgEl.alt = `${grp} car`;
      })();
    });
  }

  // ── Load statistics: popular car & average rate ─────
  (async function loadStats() {
    const token = localStorage.getItem('authToken');
    try {
      // Popular car
      const popRes = await fetch('/api/stats/popular-car', { headers: { 'Authorization': `Bearer ${token}` } });
      if (popRes.ok) {
        const popular = await popRes.json();
        document.getElementById('popular-car-name').textContent =
          `${popular.brand} ${popular.model}`;
        document.getElementById('popular-car-bookings').textContent =
          `Bookings: ${popular.bookings}`;
        // fetch imagePath
        const carRes = await fetch(`/api/cars/${popular.carId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (carRes.ok) {
          const car = await carRes.json();
          const img = document.getElementById('popular-car-image');
          img.src = '/assets/' + car.imagePath;
          img.alt = `${car.brand} ${car.model}`;
        }
      }
      // Average daily rate
      const avgRes = await fetch('/api/stats/average-rate', { headers: { 'Authorization': `Bearer ${token}` } });
      if (avgRes.ok) {
        const { averageDailyRate } = await avgRes.json();
        document.getElementById('avg-fee-amount').textContent =
          `$${averageDailyRate.toFixed(2)} / day`;
      }
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  })();
});