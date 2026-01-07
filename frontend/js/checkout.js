// frontend/js/checkout.js

document.addEventListener('DOMContentLoaded', async () => {
    const summaryEl   = document.getElementById('summary-card');
    const form        = document.getElementById('checkout-form');
    const couponBtn   = document.getElementById('apply-coupon');
    const saveBtn     = document.getElementById('save-transaction');
    const quoteBtn    = document.getElementById('request-quotation');
    const cancelBtn   = document.getElementById('cancel-transaction');
  
    // load current user and their cart
    const token   = localStorage.getItem('authToken');
    const user    = JSON.parse(localStorage.getItem('user') || '{}');
    const cartKey = `cart_${user._id || 'guest'}`;
    const cart    = JSON.parse(localStorage.getItem(cartKey) || '[]');
  
    let totalAll = 0;
  
    // Render rental summary
    if (!cart.length) {
      summaryEl.innerHTML = '<p>Your cart is empty.</p>';
    } else {
      let html = '<h3>Your Rental</h3>';
      for (const item of cart) {
        const resCar = await fetch(`/api/cars/${item.car}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const car    = await resCar.json();
        const name   = `${car.brand} ${car.model}`;
        const group  = car.group;
        const pickup = new Date(item.pickupAt).toLocaleString();
        const drop   = new Date(item.returnAt).toLocaleString();
        const price  = item.totalPrice || 0;
        totalAll    += price;
  
        html += `
          <p><strong>Car:</strong> ${group} — ${name}</p>
          <p><strong>Pickup:</strong> ${item.pickupBranch} · ${pickup}</p>
          <p><strong>Drop-off:</strong> ${item.returnBranch} · ${drop}</p>
          <p class="rate-line"><strong>Price:</strong> $${price.toFixed(2)}</p>
        `;
      }
      html += `<p class="rate-line"><strong>Total:</strong> <strong class="total-amount">$${totalAll.toFixed(2)}</strong></p>`;
      summaryEl.innerHTML = html;
    }
  
    // Prefill personal info
    if (user.name)  document.getElementById('full-name').value = user.name;
    if (user.email) document.getElementById('email').value     = user.email;
  
    // Coupon logic (local UI only)
    couponBtn.addEventListener('click', async () => {
      const code = document.getElementById('coupon-code').value.trim().toUpperCase();
      try {
        const res = await fetch(`/api/coupons/${code}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const { discount } = await res.json();
        const newTotal = (totalAll * (1 - discount)).toFixed(2);
        document.querySelector('.total-amount').textContent = '$' + newTotal;
        alert(`Coupon “${code}” applied: ${discount * 100}% off`);
      } catch (err) {
        alert('Coupon error: ' + err.message);
      }
    });
  
    // Form submission → checkout
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const fullName      = document.getElementById('full-name').value;
      const email         = document.getElementById('email').value;
      const phone         = document.getElementById('phone').value;
      const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
      const reservationIds = cart.map(i => i.id);
  
      // capture coupon code if entered
      const couponInput = document.getElementById('coupon-code').value.trim().toUpperCase();
  
      // Card payment: defer to payment.html
      if (paymentMethod === 'card') {
        localStorage.setItem(
          `pendingPayment_${user._id || 'guest'}`,
          JSON.stringify({
            reservationIds,
            personalInfo: { fullName, email, phone },
            ...(couponInput && { couponCode: couponInput })
          })
        );
        window.location.href = 'payment.html';
        return;
      }
  
      // Pay-at-location: call API immediately
      try {
        const payload = {
          reservationIds,
          paymentMethod,
          personalInfo: { fullName, email, phone },
          ...(couponInput && { couponCode: couponInput })
        };
  
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Checkout failed');
  
        alert(json.message || 'Booking confirmed. Please pay at location.');
  
        // clear just this user’s cart
        localStorage.removeItem(cartKey);
        document.getElementById('cart-count').textContent = '0';
  
        // go to bookings (will now fetch discounted prices)
        window.location.href = 'booking.html';
      } catch (err) {
        alert('Error: ' + err.message);
      }
    });
  
    // Save transaction
    saveBtn.addEventListener('click', async () => {
      const reservationIds = cart.map(i => i.id);
      try {
        const res = await fetch('/api/checkout/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reservationIds })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Save failed');
        alert(json.message || 'Transaction saved.');
      } catch (err) {
        alert('Error: ' + err.message);
      }
    });
  
    // Request quotation
    quoteBtn.addEventListener('click', async () => {
      const reservationIds = cart.map(i => i.id);
      try {
        const res = await fetch('/api/checkout/quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reservationIds })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Quotation failed');
        alert(json.message || 'Quotation requested.');
      } catch (err) {
        alert('Error: ' + err.message);
      }
    });
  
    // Cancel transaction
    cancelBtn.addEventListener('click', async () => {
      if (!confirm('Cancel this transaction?')) return;
      const reservationIds = cart.map(i => i.id);
      try {
        const res = await fetch('/api/checkout/cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reservationIds })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Cancellation failed');
        alert(json.message || 'Transaction cancelled.');
        window.location.href = 'index.html';
      } catch (err) {
        alert('Error: ' + err.message);
      }
    });
  });