// frontend/js/cart.js

// Use per-user cart storage key
function getUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user._id || 'guest';
    } catch {
      return 'guest';
    }
  }
  function cartKey() {
    return `cart_${getUserId()}`;
  }
  
  // Retrieve cart for current user
  function getCart() {
    return JSON.parse(localStorage.getItem(cartKey()) || '[]');
  }
  // Save cart for current user
  function setCart(cart) {
    localStorage.setItem(cartKey(), JSON.stringify(cart));
  }
  
  // Update the badge count
  function updateCartCount() {
    const span = document.getElementById('cart-count');
    if (span) span.textContent = getCart().length;
  }
  
  // Render items on cart page
  async function renderCartItems() {
    const items = getCart();
    const tbody = document.getElementById('cart-body');
    tbody.innerHTML = '';
  
    // empty state
    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="12" style="text-align:center; padding:1rem; color:#fff;">
            Your cart is empty.
          </td>
        </tr>
      `;
      document.getElementById('cart-total').textContent = '$0.00';
      return;
    }
  
    let total = 0;
    const token = localStorage.getItem('authToken');
  
    for (const item of items) {
      const res = await fetch(`/api/cars/${item.car}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const carData = await res.json(); // { brand, model, group, ... }
  
      // build display values
      const carName   = `${carData.brand} ${carData.model}`;
      const group     = carData.group;
      const pickupStr = new Date(item.pickupAt).toLocaleString();
      const returnStr = new Date(item.returnAt).toLocaleString();
  
      const driverName = item.driver?.name    ?? item.driverName;
      const driverAge  = item.driver?.age     ?? item.driverAge;
      const driverStr  = `${driverName} (${driverAge})`;
  
      const extrasArr = item.services
        ? Object.entries(item.services)
                .filter(([k, v]) => v && ['chauffeur','babySeat','gps'].includes(k))
                .map(([k]) => k)
        : item.extras || [];
      const extras = extrasArr.length ? extrasArr.join(', ') : '—';
  
      const insurance = item.services?.insurance   ?? item.insuranceOption;
      const fuel      = item.services?.fuel        ?? item.fuelOption;
      const price     = item.totalPrice ?? 0;
      total += price;
  
      // create row
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${carName}</td>
        <td>${group}</td>
        <td>${item.pickupBranch}</td>
        <td>${item.returnBranch}</td>
        <td>${pickupStr}</td>
        <td>${returnStr}</td>
        <td>${driverStr}</td>
        <td>${extras}</td>
        <td>${insurance}</td>
        <td>${fuel}</td>
        <td>$${price.toFixed(2)}</td>
        <td><button class="remove-btn" data-id="${item.id}">Remove</button></td>
      `;
      tbody.appendChild(tr);
    }
  
    // update total
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
  
    // remove handlers
    tbody.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const newCart = getCart().filter(i => i.id !== btn.dataset.id);
        setCart(newCart);
        updateCartCount();
        renderCartItems();
      });
    });
  }
  
  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    // Cart icon navigates to cart.html
    document.getElementById('cart-btn').addEventListener('click', () => {
      window.location.href = 'cart.html';
    });
  
    updateCartCount();
  
    // If on cart page, render items and wire checkout button
    if (document.getElementById('cart-body')) {
      renderCartItems();
      document.getElementById('checkout-btn').addEventListener('click', () => {
        window.location.href = 'checkout.html';
      });
    }
  });