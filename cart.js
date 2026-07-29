/* ============================================
   PANIER – Le Sans Gluten de Christine
   - Stockage localStorage
   - Frais de port : 5€ sous 60€, gratuit dès 60€
   ============================================ */

const SHIPPING_THRESHOLD = 60;
const SHIPPING_COST = 5;
const CART_KEY = "lsgc_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
  }
  saveCart(cart);
  renderCart();
  openCart();
}

function removeFromCart(id) {
  let cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  renderCart();
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart(cart);
  renderCart();
}

function cartSubtotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartCount(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function shippingCost(subtotal) {
  return subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;
  const count = cartCount(getCart());
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}

function renderCart() {
  const list = document.getElementById("cart-items");
  const emptyMsg = document.getElementById("cart-empty");
  const summary = document.getElementById("cart-summary");
  const addressForm = document.getElementById("address-form");
  if (!list) return;

  const cart = getCart();
  list.innerHTML = "";

  if (cart.length === 0) {
    if (emptyMsg) emptyMsg.style.display = "block";
    if (summary) summary.style.display = "none";
    if (addressForm) addressForm.style.display = "none";
    return;
  }
  if (emptyMsg) emptyMsg.style.display = "none";
  if (summary) summary.style.display = "block";
  if (addressForm) {
    addressForm.style.display = "block";
    loadAddressForm();
  }

  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-row-img">
      <div class="cart-row-info">
        <div class="cart-row-name">${item.name}</div>
        <div class="cart-row-price">${item.price.toFixed(2)} €</div>
        <div class="cart-row-qty">
          <button onclick="changeQty(${item.id}, -1)" aria-label="Diminuer">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${item.id}, 1)" aria-label="Augmenter">+</button>
        </div>
      </div>
      <button class="cart-row-remove" onclick="removeFromCart(${item.id})" aria-label="Supprimer">✕</button>
    `;
    list.appendChild(row);
  });

  const subtotal = cartSubtotal(cart);
  const shipping = shippingCost(subtotal);
  const total = subtotal + shipping;

  document.getElementById("cart-subtotal").textContent = subtotal.toFixed(2) + " €";
  document.getElementById("cart-shipping").textContent = shipping === 0 ? "Gratuite" : shipping.toFixed(2) + " €";
  document.getElementById("cart-total").textContent = total.toFixed(2) + " €";

  const remaining = SHIPPING_THRESHOLD - subtotal;
  const notice = document.getElementById("cart-shipping-notice");
  if (notice) {
    if (remaining > 0) {
      notice.textContent = `Plus que ${remaining.toFixed(2)} € d'achat pour la livraison gratuite !`;
      notice.style.display = "block";
    } else {
      notice.textContent = "🎉 Livraison gratuite débloquée !";
      notice.style.display = "block";
    }
  }
}

function openCart() {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");
  if (drawer) drawer.classList.add("open");
  if (overlay) overlay.classList.add("open");
}

function closeCart() {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");
  if (drawer) drawer.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
}

const ADDRESS_KEY = "lsgc_address";

function getAddress() {
  try {
    return JSON.parse(localStorage.getItem(ADDRESS_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveAddressToStorage(address) {
  localStorage.setItem(ADDRESS_KEY, JSON.stringify(address));
}

function loadAddressForm() {
  const addr = getAddress();
  const nameEl = document.getElementById("addr-name");
  if (!nameEl) return;
  nameEl.value = addr.name || "";
  document.getElementById("addr-email").value = addr.email || "";
  document.getElementById("addr-street").value = addr.street || "";
  document.getElementById("addr-postal").value = addr.postal || "";
  document.getElementById("addr-city").value = addr.city || "";
  document.getElementById("addr-country").value = addr.country || "Belgique";
}

function readAddressForm() {
  return {
    name: document.getElementById("addr-name").value.trim(),
    email: document.getElementById("addr-email").value.trim(),
    street: document.getElementById("addr-street").value.trim(),
    postal: document.getElementById("addr-postal").value.trim(),
    city: document.getElementById("addr-city").value.trim(),
    country: document.getElementById("addr-country").value,
  };
}

function isAddressComplete(addr) {
  return addr.name && addr.email && addr.street && addr.postal && addr.city && addr.country;
}


function goToCheckout() {
  const cart = getCart();
  if (cart.length === 0) return;

  const address = readAddressForm();
  const errorBox = document.getElementById("address-error");

  if (!isAddressComplete(address)) {
    if (errorBox) errorBox.style.display = "block";
    document.getElementById("address-form").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (errorBox) errorBox.style.display = "none";
  saveAddressToStorage(address);

  // ⚠️ Intégration Mollie à venir : nécessite une fonction serverless
  // pour créer la session de paiement de façon sécurisée (clé API secrète
  // côté serveur, jamais exposée côté client).
  const subtotal = cartSubtotal(cart);
  const total = subtotal + shippingCost(subtotal);
  alert(
    "Commande prête (paiement Mollie à venir) :\n\n" +
    cartCount(cart) + " article(s) — Total : " + total.toFixed(2) + " €\n\n" +
    "Livraison à :\n" + address.name + "\n" + address.street + "\n" +
    address.postal + " " + address.city + ", " + address.country
  );
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderCart();
});
