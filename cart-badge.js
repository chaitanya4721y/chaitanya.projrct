// cart-badge.js
(function(){
    function getCart() {
      try { return JSON.parse(localStorage.getItem('cart')) || []; }
      catch(e) { return []; }
    }
  
    function getCartCount() {
      const cart = getCart();
      return cart.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
    }
  
    function updateCartBadge() {
      const el = document.getElementById('cart-count');
      if (!el) return;
      const count = getCartCount();
      el.textContent = count;
      // optional: show/hide if zero
      el.style.display = count ? '' : 'none';
    }
  
    // update on load
    document.addEventListener('DOMContentLoaded', updateCartBadge);
  
    // when cart in other tab changes
    window.addEventListener('storage', (e) => {
      if (e.key === 'cart') updateCartBadge();
    });
  
    // allow other scripts to call it immediately after they change localStorage
    window.updateCartBadge = updateCartBadge;
  })();
  