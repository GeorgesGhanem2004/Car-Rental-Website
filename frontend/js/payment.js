// frontend/js/payment.js

document.addEventListener('DOMContentLoaded', async () => {
    // 1) Update the cart badge
    const badge = document.getElementById('cart-count');
    const user  = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id || 'guest';
    const cartKey = `cart_${userId}`;
    const cart    = JSON.parse(localStorage.getItem(cartKey) || '[]');
    if (badge) badge.textContent = cart.length;
  
    // 2) Load the pending payment info (including couponCode if any)
    const data = JSON.parse(localStorage.getItem(`pendingPayment_${userId}`) || 'null');
    if (!data) {
      alert('No payment in progress.');
      return window.location.href = 'checkout.html';
    }
  
    const summaryEl = document.getElementById('payment-summary');
    const form      = document.getElementById('payment-form');
    const token     = localStorage.getItem('authToken');
  
    // 3) Compute raw total from cart entries matching reservationIds
    let rawTotal = 0;
    data.reservationIds.forEach(resId => {
      const item = cart.find(i => i.id === resId);
      if (item && typeof item.totalPrice === 'number') {
        rawTotal += item.totalPrice;
      }
    });
  
    // 4) If a coupon was redeemed, fetch its discount and compute final total
    let discountFraction = 0;
    let finalTotal = rawTotal;
    if (data.couponCode) {
      try {
        const r = await fetch(`/api/coupons/${data.couponCode}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (r.ok) {
          const { discount } = await r.json();
          discountFraction = discount;                 // e.g. 0.25
          finalTotal = rawTotal * (1 - discountFraction);
        }
      } catch (err) {
        console.error('Failed to load coupon on payment page:', err);
      }
    }
  
    // 5) Render the payment summary, showing discount if applied
    summaryEl.innerHTML = `
      <h3>Amount Due</h3>
      <p><strong>${data.reservationIds.length} item(s)</strong></p>
      <p><strong>Subtotal:</strong> $${rawTotal.toFixed(2)}</p>
      ${data.couponCode && discountFraction
        ? `<p><strong>Discount (${(discountFraction * 100).toFixed(0)}%):</strong> -$${(rawTotal * discountFraction).toFixed(2)}</p>`
        : ''}
      <p><strong>Total:</strong> <span class="total-amount">$${finalTotal.toFixed(2)}</span></p>
      ${data.couponCode
        ? `<p><em>Applied code: ${data.couponCode}</em></p>`
        : ''}
    `;
  
    // 6) Handle the “Pay Now” submission, including couponCode in the payload
    form.addEventListener('submit', async e => {
      e.preventDefault();
      form.querySelector('button').disabled = true;
  
      try {
        const payload = {
          reservationIds: data.reservationIds,
          paymentMethod: 'card',
          personalInfo:   data.personalInfo,
          ...(data.couponCode && { couponCode: data.couponCode })
        };
  
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Payment failed');
  
        // 7) On success, clean up and redirect
        const goToBookings = confirm(
          'Payment successful! OK to view bookings, Cancel to return home.'
        );
        localStorage.removeItem(`pendingPayment_${userId}`);
        localStorage.removeItem(cartKey);
        if (badge) badge.textContent = '0';
  
        if (goToBookings) window.location.href = 'bookings.html';
        else              window.location.href = 'index.html';
  
      } catch (err) {
        alert('Error: ' + err.message);
        form.querySelector('button').disabled = false;
      }
    });
  });