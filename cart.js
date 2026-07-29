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
  if (!list) return;

  const cart = getCart();
  list.innerHTML = "";

  if (cart.length === 0) {
    if (emptyMsg) emptyMsg.style.display = "block";
    if (summary) summary.style.display = "none";
    return;
  }
  if (emptyMsg) emptyMsg.style.display = "none";
  if (summary) summary.style.display = "block";

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

function goToCheckout() {
  const cart = getCart();
  if (cart.length === 0) return;
  // ⚠️ Intégration Mollie à venir : nécessite une fonction serverless
  // pour créer la session de paiement de façon sécurisée (clé API secrète
  // côté serveur, jamais exposée côté client).
  alert("Le paiement en ligne (Mollie) sera activé dès réception de la clé API de Christine. Panier prêt : " + cartCount(cart) + " article(s), total " + (cartSubtotal(cart) + shippingCost(cartSubtotal(cart))).toFixed(2) + " €.");
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderCart();
});
