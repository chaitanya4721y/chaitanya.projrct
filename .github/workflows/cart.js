// ===================== Supabase Client =====================
const SUPABASE_URL = "https://xzkiphnprdjxcxkmocvf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6a2lwaG5wcmRqeGN4a21vY3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxOTc3NDIsImV4cCI6MjA2OTc3Mzc0Mn0.IIB9czzGljZTEs1N9TAkAoWnI0dAq2tLpQQPsZplSyc";
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===================== Helpers =====================
function escapeHtml(s = "") {
  return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

// Use getUser to read the current logged-in user (Supabase v2)
async function getCurrentUser() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user || null;
  } catch (err) {
    console.error("getCurrentUser error", err);
    return null;
  }
}

// ===================== Load Cart Items =====================
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItemsContainer = document.getElementById("cart-items");
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    const checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) checkoutBtn.disabled = true;
    updateSummary();
    return;
  }

  cart.forEach((item, index) => {
    const productElem = document.createElement("div");
    productElem.classList.add("cart-item");
    productElem.innerHTML = `
      <img src="${escapeHtml(item.img||'')}" alt="${escapeHtml(item.name||'')}" class="cart-img">
      <div class="cart-details">
        <h3>${escapeHtml(item.name||'Unnamed product')}</h3>
        <p class="price">${escapeHtml(item.price || '$0.00')}</p>
        <div class="quantity-controls">
          <button class="qty-btn decrease">-</button>
          <span class="qty">${item.quantity || 1}</span>
          <button class="qty-btn increase">+</button>
        </div>
        <button class="remove-btn">Remove</button>
      </div>
    `;
    cartItemsContainer.appendChild(productElem);

    // Decrease
    productElem.querySelector(".decrease").addEventListener("click", () => {
      const cartNow = JSON.parse(localStorage.getItem("cart")) || [];
      if (!cartNow[index]) return;
      if (cartNow[index].quantity > 1) cartNow[index].quantity--;
      else cartNow.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cartNow));
      loadCart();
      updateSummary();
    });

    // Increase
    productElem.querySelector(".increase").addEventListener("click", () => {
      const cartNow = JSON.parse(localStorage.getItem("cart")) || [];
      if (!cartNow[index]) return;
      cartNow[index].quantity = (cartNow[index].quantity || 1) + 1;
      localStorage.setItem("cart", JSON.stringify(cartNow));
      loadCart();
      updateSummary();
    });

    // Remove
    productElem.querySelector(".remove-btn").addEventListener("click", () => {
      const cartNow = JSON.parse(localStorage.getItem("cart")) || [];
      cartNow.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cartNow));
      loadCart();
      updateSummary();
    });
  });

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) checkoutBtn.disabled = false;
  updateSummary();
}

// ===================== Update Summary Box =====================
function updateSummary() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const summaryItems = document.getElementById("summary-items");
  const totalItemsElem = document.getElementById("summary-total-items");
  const subtotalElem = document.getElementById("summary-subtotal");
  const totalElem = document.getElementById("summary-total");
  const shippingElem = document.getElementById("summary-shipping");

  if (!summaryItems || !totalItemsElem || !subtotalElem || !totalElem || !shippingElem) return;

  summaryItems.innerHTML = "";

  if (cart.length === 0) {
    summaryItems.innerHTML = "<p>Your cart is empty.</p>";
    totalItemsElem.textContent = "0";
    subtotalElem.textContent = "$0.00";
    shippingElem.textContent = "$0.00";
    totalElem.textContent = "$0.00";
    return;
  }

  let subtotal = 0;
  let totalItems = 0;

  cart.forEach(item => {
    const qty = Number(item.quantity || 1);
    const price = parseFloat(String(item.price || "0").replace(/[^0-9.\-]+/g, "")) || 0;
    const itemSubtotal = (price * qty);

    const itemDiv = document.createElement("div");
    itemDiv.classList.add("summary-item");
    itemDiv.innerHTML = `
      <img src="${escapeHtml(item.img || '')}" alt="${escapeHtml(item.name || '')}">
      <div class="summary-details">
        <h4>${escapeHtml(item.name || 'Unnamed')}</h4>
        <p>$${price.toFixed(2)} x ${qty} = <strong>$${itemSubtotal.toFixed(2)}</strong></p>
      </div>
    `;
    summaryItems.appendChild(itemDiv);

    subtotal += itemSubtotal;
    totalItems += qty;
  });

  const shipping = subtotal >= 50 ? 0 : 5;
  totalItemsElem.textContent = totalItems;
  subtotalElem.textContent = `$${subtotal.toFixed(2)}`;
  shippingElem.textContent = shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`;
  totalElem.textContent = `$${(subtotal + shipping).toFixed(2)}`;
}

// ===================== Checkout Button wiring (will open overlay) =====================
async function handleCheckoutClick() {
  const user = await getCurrentUser();
  if (!user) {
    // include redirect so login can send back
    const currentPage = encodeURIComponent(window.location.href);
    window.location.href = `login.html?redirect=${currentPage}`;
    return;
  }
  showOrderForm(user);
}

// ===================== Show Checkout Form (production-grade overlay) =====================
async function showOrderForm(user) {
  // remove existing overlay if any
  const existing = document.querySelector(".checkout-overlay");
  if (existing) existing.remove();

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  // totals calculator
  function calcTotals(items, promo = null) {
    let subtotal = 0, qty = 0;
    items.forEach(it => {
      const price = parseFloat(String(it.price || 0).replace(/[^0-9.\-]+/g, '')) || 0;
      const q = Number(it.quantity || 1) || 1;
      subtotal += price * q;
      qty += q;
    });
    let shipping = subtotal >= 50 ? 0 : 5;
    let discount = 0;
    if (promo && promo.type === 'percent') discount = subtotal * (promo.value / 100);
    if (promo && promo.type === 'fixed') discount = Math.min(promo.value, subtotal);
    const total = Math.max(0, subtotal + shipping - discount);
    return { subtotal, shipping, discount, total, qty };
  }

  // build overlay DOM
  const overlay = document.createElement("div");
  overlay.className = "checkout-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  overlay.innerHTML = `
    <div class="checkout-panel" role="document">
      <div class="checkout-header">
        <div class="checkout-title">Checkout — Review & Pay</div>
        <button class="checkout-close" aria-label="Close checkout overlay">&times;</button>
      </div>

      <div class="checkout-left">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div class="section-title">Shipping address</div>
          <div class="small-muted">Signed in as <strong>${escapeHtml(user.email)}</strong></div>
        </div>

        <form class="checkout-form" id="checkout-form" novalidate>
          <div class="form-group" style="grid-column:1 / -1">
            <label for="co_fullname">Full name</label>
            <input id="co_fullname" name="fullName" required placeholder="John Doe" value="${escapeHtml(user.user_metadata?.full_name||'')}" />
          </div>

          <div class="form-group">
            <label for="co_phone">Phone</label>
            <input id="co_phone" name="phone" required placeholder="+91 9XXXXXXXXX" />
          </div>

          <div class="form-group">
            <label for="co_email">Email</label>
            <input id="co_email" name="email" type="email" required value="${escapeHtml(user.email)}" />
          </div>

          <div class="form-group" style="grid-column:1 / -1">
            <label for="co_address">Address</label>
            <textarea id="co_address" name="address" required placeholder="House / Street / City / ZIP"></textarea>
          </div>

          <div class="form-group">
            <label for="co_city">City</label>
            <input id="co_city" name="city" placeholder="City" />
          </div>

          <div class="form-group">
            <label for="co_zip">ZIP / PIN</label>
            <input id="co_zip" name="zip" placeholder="Postal code" />
          </div>

          <div class="form-group" style="grid-column:1 / -1">
            <label>Shipping method</label>
            <div class="field-inline">
              <label><input type="radio" name="shipping" value="standard" checked/> Standard (2–5 days)</label>
              <label style="margin-left:12px"><input type="radio" name="shipping" value="express" /> Express (1–2 days +$7)</label>
            </div>
          </div>

          <div class="coupon-row">
            <input id="co_coupon" placeholder="Promo code (e.g. SAVE10)" />
            <button type="button" class="apply-coupon" id="apply-coupon">Apply</button>
            <div id="coupon-feedback" class="muted" style="margin-left:8px"></div>
          </div>

          <div class="checkout-actions">
            <div style="flex:1">
              <div class="small-muted">Secure checkout — your payment is encrypted</div>
            </div>
            <div style="flex-basis:320px; text-align:right">
              <div class="small-muted">Order subtotal</div>
              <div id="co_subtotal" style="font-weight:800;font-size:18px;margin-top:6px">$0.00</div>
            </div>
          </div>

          <button type="submit" class="place-order-btn" id="place-order-btn" disabled>Place order • Pay</button>
        </form>
      </div>

      <aside class="checkout-right" aria-label="Order summary">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-weight:800;font-size:16px">Order summary</div>
          <div class="muted" id="co_items_count">0 items</div>
        </div>
        <div id="co_items_list" style="display:flex;flex-direction:column;gap:10px;margin-top:12px"></div>

        <div style="margin-top:12px" class="summary-block">
          <div style="color:#666">Subtotal</div><div id="co_sub_val" class="review-sub">$0.00</div>
        </div>
        <div class="summary-row">
          <div style="color:#666">Shipping</div><div id="co_ship">$0.00</div>
        </div>
        <div class="summary-row">
          <div style="color:#666">Discount</div><div id="co_discount">-$0.00</div>
        </div>

        <div class="summary-total">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-weight:800">Total</div>
            <div id="co_total" style="font-size:20px;font-weight:900">$0.00</div>
          </div>
        </div>

        <div style="margin-top:8px">
          <div class="small-muted">Have a question? <a href="mailto:ahinavechaitanya6@gmail.com">ahinavechaitanya6@gmail.com</a></div>
        </div>

      </aside>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.classList.add("no-scroll");

  // Focus trap and key handling
  const focusableSelector = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';
  const focusables = Array.from(overlay.querySelectorAll(focusableSelector));
  const firstFocusable = focusables[0];
  const lastFocusable = focusables[focusables.length - 1];
  if (firstFocusable) firstFocusable.focus();

  function trapFocus(e) {
    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) { e.preventDefault(); lastFocusable.focus(); }
      } else {
        if (document.activeElement === lastFocusable) { e.preventDefault(); firstFocusable.focus(); }
      }
    } else if (e.key === "Escape") {
      closeOverlay();
    }
  }
  overlay.addEventListener("keydown", trapFocus);

  function closeOverlay() {
    overlay.removeEventListener("keydown", trapFocus);
    overlay.remove();
    document.body.classList.remove("no-scroll");
  }

  overlay.querySelector(".checkout-close").addEventListener("click", closeOverlay);
  overlay.addEventListener("click", (ev) => { if (ev.target === overlay) closeOverlay(); });

  // Render items into order review
  const itemsList = overlay.querySelector("#co_items_list");
  function renderItems() {
    itemsList.innerHTML = "";
    cart.forEach((it) => {
      const price = parseFloat(String(it.price || 0).replace(/[^0-9.\-]+/g, "")) || 0;
      const qty = Number(it.quantity || 1) || 1;
      const subtotal = (price * qty).toFixed(2);
      const itemEl = document.createElement("div");
      itemEl.className = "review-item";
      itemEl.innerHTML = `
        <img src="${escapeHtml(it.img || '')}" alt="${escapeHtml(it.name || '')}"/>
        <div class="review-details">
          <div class="name">${escapeHtml(it.name || '')}</div>
          <div class="meta">${qty} × $${price.toFixed(2)}</div>
        </div>
        <div class="review-sub">$${subtotal}</div>
      `;
      itemsList.appendChild(itemEl);
    });
  }

  let appliedPromo = null;
  function refreshTotals(shippingMethod = "standard") {
    const { subtotal, shipping, discount, total, qty } = calcTotals(cart, appliedPromo);
    let ship = shipping;
    if (shippingMethod === "express") ship += 7;
    const totalWithShip = Math.max(0, subtotal + ship - discount);

    overlay.querySelector("#co_items_count").textContent = `${qty} items`;
    overlay.querySelector("#co_sub_val").textContent = `$${subtotal.toFixed(2)}`;
    overlay.querySelector("#co_subtotal").textContent = `$${subtotal.toFixed(2)}`;
    overlay.querySelector("#co_ship").textContent = ship === 0 ? "Free" : `$${ship.toFixed(2)}`;
    overlay.querySelector("#co_discount").textContent = discount === 0 ? "-$0.00" : `-$${Number(discount).toFixed(2)}`;
    overlay.querySelector("#co_total").textContent = `$${totalWithShip.toFixed(2)}`;

    const placeBtn = overlay.querySelector("#place-order-btn");
    const addressVal = overlay.querySelector("#co_address").value.trim();
    const phoneVal = overlay.querySelector("#co_phone").value.trim();
    if (addressVal.length >= 5 && phoneVal.length >= 6 && cart.length > 0) placeBtn.disabled = false;
    else placeBtn.disabled = true;
  }

  renderItems();
  refreshTotals();

  // form listeners
  const form = overlay.querySelector("#checkout-form");
  form.shipping?.forEach?.((r) => r.addEventListener("change", () => refreshTotals(form.shipping.value)));

  overlay.querySelector("#apply-coupon").addEventListener("click", () => {
    const code = overlay.querySelector("#co_coupon").value.trim().toUpperCase();
    const feedback = overlay.querySelector("#coupon-feedback");
    if (!code) { feedback.textContent = "Enter a code"; return; }

    if (code === "SAVE10") {
      appliedPromo = { code, type: "percent", value: 10 };
      feedback.textContent = "Applied: 10% off";
      if (!overlay.querySelector(".promo-badge")) {
        const badge = document.createElement("div"); badge.className = "promo-badge"; badge.textContent = "SAVE10";
        overlay.querySelector(".checkout-right").insertBefore(badge, overlay.querySelector(".checkout-right").firstChild);
      }
    } else if (code === "FIX5") {
      appliedPromo = { code, type: "fixed", value: 5 };
      feedback.textContent = "Applied: $5 off";
      if (!overlay.querySelector(".promo-badge")) {
        const badge = document.createElement("div"); badge.className = "promo-badge"; badge.textContent = "FIX5";
        overlay.querySelector(".checkout-right").insertBefore(badge, overlay.querySelector(".checkout-right").firstChild);
      }
    } else {
      appliedPromo = null;
      feedback.textContent = "Invalid code";
    }
    refreshTotals(form.shipping.value);
  });

  ["#co_address", "#co_phone", "#co_fullname"].forEach(sel => {
    const el = overlay.querySelector(sel);
    if (el) el.addEventListener("input", () => refreshTotals(form.shipping.value));
  });

  // submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const placeBtn = overlay.querySelector("#place-order-btn");
    placeBtn.disabled = true;
    placeBtn.textContent = "Placing order…";

    const payload = {
      user_id: user.id,
      customer_name: overlay.querySelector("#co_fullname").value.trim(),
      customer_email: overlay.querySelector("#co_email").value.trim(),
      phone: overlay.querySelector("#co_phone").value.trim(),
      address: overlay.querySelector("#co_address").value.trim(),
      city: overlay.querySelector("#co_city").value.trim(),
      zip: overlay.querySelector("#co_zip").value.trim(),
      shipping_method: form.shipping.value,
      promo: appliedPromo ? appliedPromo.code : null,
      items: cart,
      totals: (() => {
        const { subtotal, shipping, discount } = calcTotals(cart, appliedPromo);
        const ship = form.shipping.value === "express" ? shipping + 7 : shipping;
        return { subtotal, shipping: ship, discount, total: Math.max(0, subtotal + ship - discount) };
      })()
    };

    try {
      const { error } = await supabaseClient.from("orders").insert([payload]);
      if (error) throw error;

      // success UI
      const panel = overlay.querySelector(".checkout-panel");
      panel.innerHTML = `
        <div class="co-success">
          <div class="tick">✓</div>
          <h3>Order placed!</h3>
          <p>Thank you — we’ve emailed an order confirmation to <strong>${escapeHtml(payload.customer_email)}</strong>.</p>
          <div style="margin-top:8px;color:#555">Order total: <strong>$${payload.totals.total.toFixed(2)}</strong></div>
          <button id="continue-btn" style="margin-top:18px;padding:12px 18px;border-radius:10px;background:var(--accent);color:#fff;border:none;font-weight:700;cursor:pointer">Continue shopping</button>
        </div>
      `;
      document.getElementById("continue-btn").addEventListener("click", () => {
        localStorage.removeItem("cart");
        closeOverlay();
        window.location.href = "index.html";
      });
    } catch (err) {
      console.error(err);
      alert("Error placing order: " + (err.message || "Unknown error"));
      placeBtn.disabled = false;
      placeBtn.textContent = "Place order • Pay";
    }
  });

  // expose refreshTotals to external callers (if needed)
  overlay.refreshTotals = refreshTotals;

  return overlay;
}

// ===================== Initialize =====================
document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  updateSummary();

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) checkoutBtn.removeEventListener && checkoutBtn.addEventListener("click", handleCheckoutClick);
});
