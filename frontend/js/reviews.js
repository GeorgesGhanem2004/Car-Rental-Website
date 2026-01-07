// frontend/js/reviews.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const form  = document.querySelector('.review-form');
  
    // 1) Inject "All Reviews" section after the form
    const reviewsSection = document.createElement('section');
    reviewsSection.id = 'all-reviews';
    reviewsSection.innerHTML = `
      <h2 class="section-header" style="margin-top:2rem; text-align:center; color:#e53935;">
        All Reviews
      </h2>
      <div id="reviews-list" style="max-width:800px; margin:1rem auto;"></div>
    `;
    form.parentNode.insertBefore(reviewsSection, form.nextSibling);
  
    // 2) Function to load and render reviews
    async function loadReviews() {
      const list = document.getElementById('reviews-list');
      list.innerHTML = '<p style="text-align:center;">Loading reviews…</p>';
      try {
        const res = await fetch('/api/reviews');
        const reviews = await res.json();
        if (!res.ok) throw new Error(reviews.error || 'Failed to load reviews');
        if (reviews.length === 0) {
          list.innerHTML = '<p style="text-align:center;">No reviews yet.</p>';
          return;
        }
        list.innerHTML = ''; // clear loading text
        reviews.forEach(r => {
          const card = document.createElement('div');
          card.className = 'review-card';
          card.style.background = '#222';
          card.style.padding = '1rem';
          card.style.borderRadius = '8px';
          card.style.marginBottom = '1rem';
          card.innerHTML = `
            <div class="review-header" style="display:flex; align-items:center; gap:.5rem;">
              <div class="reviewer-info">
                <h3 class="reviewer-name" style="margin:0; color:#e53935;">
                  ${r.user.name}
                </h3>
                <span class="review-date" style="font-size:.9rem; color:#ccc;">
                  ${new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div class="review-body" style="margin-top:.5rem;">
              <h4 style="margin:0 0 .5rem;">${r.title}</h4>
              <div class="star-rating-display" style="color:#ffc107; font-size:1.2rem; margin-bottom:.5rem;">
                ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
              </div>
              <p style="margin:0; color:#eee;">${r.comment}</p>
            </div>
          `;
          list.appendChild(card);
        });
      } catch (err) {
        list.innerHTML = `<p style="color:red; text-align:center;">Error: ${err.message}</p>`;
        console.error('Error loading reviews:', err);
      }
    }
  
    // Immediately load existing reviews
    loadReviews();
  
    // 3) Form submission logic (unchanged functionality)
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const title   = document.getElementById('review-title').value.trim();
      const rating  = Number(document.querySelector('input[name="rating"]:checked')?.value);
      const comment = document.getElementById('comment').value.trim();
      if (!token) {
        alert('Please log in to submit a review.');
        return window.location.href = 'index.html';
      }
      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title, rating, comment })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to submit review.');
        alert('Review submitted. Thank you!');
        form.reset();
        // reload the reviews list
        loadReviews();
      } catch (err) {
        alert('Error: ' + err.message);
        console.error('Error submitting review:', err);
      }
    });
  });