const WHATSAPP_NUMBER = '528331230833';

const products = [
  {
    id: 1,
    name: 'Camarón Cocido Grande',
    size: '500 g',
    price: 195,
    category: 'camaron',
    image: 'assets/camaron-grande.jpg',
    badge: 'Más vendido'
  },
  {
    id: 2,
    name: 'Camarón Cocido Mediano',
    size: '500 g',
    price: 170,
    category: 'camaron',
    image: 'assets/camaron-mediano.jpg',
    badge: ''
  },
  {
    id: 3,
    name: 'Ceviche de Camarón',
    size: '500 g',
    price: 165,
    category: 'preparados',
    image: 'assets/ceviche-camaron.jpg',
    badge: ''
  },
  {
    id: 4,
    name: 'Cóctel de Camarón con Pulpo',
    size: '500 g',
    price: 185,
    category: 'preparados',
    image: 'assets/coctel-camaron.jpg',
    badge: 'Especial'
  },
  {
    id: 5,
    name: 'Camarón Cocido Jumbo',
    size: '500 g',
    price: 220,
    category: 'especiales',
    image: 'assets/camaron-cocido.jpg',
    badge: ''
  },
  {
    id: 6,
    name: 'Combo Jaibo Familiar',
    size: '1 kg surtido',
    price: 390,
    category: 'combos',
    image: 'assets/hero-product.jpg',
    badge: 'Combo'
  }
];

let selectedCategory = 'todos';
let searchTerm = '';
let cart = [];

const productGrid = document.querySelector('#productGrid');
const searchInput = document.querySelector('#searchInput');
const categoryBar = document.querySelector('#categoryBar');
const cartCount = document.querySelector('#cartCount');
const cartItems = document.querySelector('#cartItems');
const cartTotal = document.querySelector('#cartTotal');
const sendOrder = document.querySelector('#sendOrder');
const viewAll = document.querySelector('#viewAll');
const mainNavbar = document.querySelector('#mainNavbar');
const cartOffcanvasElement = document.querySelector('#cartOffcanvas');

const currency = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN'
});

function getCartOffcanvas() {
  if (!window.bootstrap || !cartOffcanvasElement) return null;
  return bootstrap.Offcanvas.getOrCreateInstance(cartOffcanvasElement);
}

function productWhatsAppUrl(product) {
  const text = `Hola JAIBO 8-33, quiero pedir: ${product.name} (${product.size}) - ${currency.format(product.price)}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function orderWhatsAppUrl() {
  if (!cart.length) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola JAIBO 8-33, quiero hacer un pedido.')}`;
  }

  const detail = cart
    .map(item => `• ${item.quantity} x ${item.name} ${item.size} - ${currency.format(item.price * item.quantity)}`)
    .join('\n');
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const text = `Hola JAIBO 8-33, quiero hacer este pedido:\n${detail}\n\nTotal estimado: ${currency.format(total)}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function renderProducts() {
  const filtered = products.filter(product => {
    const matchCategory = selectedCategory === 'todos' || product.category === selectedCategory;
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (!filtered.length) {
    productGrid.innerHTML = `
      <div class="col-12">
        <div class="empty-cart">No encontré productos con esa búsqueda.</div>
      </div>`;
    return;
  }

  productGrid.innerHTML = filtered.map(product => `
    <div class="col-12 col-sm-6 col-lg-4">
      <article class="product-card">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        <img class="product-img" src="${product.image}" alt="${product.name}">
        <div class="product-body">
          <h4 class="product-title">${product.name}</h4>
          <p class="product-meta">${product.size}</p>
          <strong class="product-price">${currency.format(product.price)}</strong>
          <div class="product-actions">
            <button class="btn-whatsapp" type="button" data-whatsapp="${product.id}">☏ Pedir por WhatsApp</button>
            <button class="btn-add" type="button" data-add="${product.id}" aria-label="Agregar ${product.name} al carrito">+</button>
          </div>
        </div>
      </article>
    </div>
  `).join('');
}

function addToCart(productId) {
  const product = products.find(item => item.id === Number(productId));
  if (!product) return;

  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCart();
  const cartOffcanvas = getCartOffcanvas();
  if (cartOffcanvas) cartOffcanvas.show();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== Number(productId));
  updateCart();
}

function updateCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  cartCount.textContent = count;
  cartTotal.textContent = currency.format(total);
  sendOrder.href = orderWhatsAppUrl();

  if (!cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío. Agrega productos para armar tu pedido.</p>';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h4>${item.name}</h4>
        <small>${item.quantity} x ${item.size} · ${currency.format(item.price)}</small>
      </div>
      <button type="button" data-remove="${item.id}" aria-label="Quitar ${item.name}">×</button>
    </div>
  `).join('');
}

productGrid.addEventListener('click', event => {
  const addButton = event.target.closest('[data-add]');
  const whatsappButton = event.target.closest('[data-whatsapp]');

  if (addButton) {
    addToCart(addButton.dataset.add);
    return;
  }

  if (whatsappButton) {
    const product = products.find(item => item.id === Number(whatsappButton.dataset.whatsapp));
    if (product) window.open(productWhatsAppUrl(product), '_blank', 'noopener');
  }
});

categoryBar.addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;

  selectedCategory = button.dataset.category;
  document.querySelectorAll('.category-pill').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  renderProducts();
});

searchInput.addEventListener('input', event => {
  searchTerm = event.target.value.trim();
  renderProducts();
});

viewAll.addEventListener('click', event => {
  event.preventDefault();
  selectedCategory = 'todos';
  searchTerm = '';
  searchInput.value = '';
  document.querySelectorAll('.category-pill').forEach(item => item.classList.remove('active'));
  document.querySelector('[data-category="todos"]').classList.add('active');
  renderProducts();
});

cartItems.addEventListener('click', event => {
  const removeButton = event.target.closest('[data-remove]');
  if (removeButton) removeFromCart(removeButton.dataset.remove);
});

mainNavbar.addEventListener('click', event => {
  if (!event.target.matches('a')) return;
  const collapseInstance = bootstrap.Collapse.getInstance(mainNavbar);
  if (collapseInstance) collapseInstance.hide();
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

renderProducts();
updateCart();
