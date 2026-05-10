/* ===== PRODUCT DATA ===== */
const products = [
  { id:1, name:"Scarlet Evening Dress", category:"Dresses", price:189, oldPrice:249, image:"images/dress-red.png", badge:"sale", desc:"A stunning red cocktail dress perfect for evening events. Made with premium silk blend fabric." },
  { id:2, name:"Noir Elegance Gown", category:"Dresses", price:229, oldPrice:null, image:"images/dress-black.png", badge:"new", desc:"Timeless black evening gown with sophisticated draping and premium finish." },
  { id:3, name:"Azure Bloom Dress", category:"Dresses", price:159, oldPrice:199, image:"images/dress-blue.png", badge:"sale", desc:"Elegant blue floral dress ideal for summer brunches and garden parties." },
  { id:4, name:"Classic White Tee", category:"T-Shirts", price:49, oldPrice:null, image:"images/tshirt-white.png", badge:"new", desc:"Premium organic cotton white t-shirt. The essential wardrobe staple." },
  { id:5, name:"Urban Black Tee", category:"T-Shirts", price:59, oldPrice:79, image:"images/tshirt-black.png", badge:"sale", desc:"Bold graphic black tee with urban streetwear aesthetics." },
  { id:6, name:"Navy Polo Classic", category:"T-Shirts", price:69, oldPrice:null, image:"images/tshirt-navy.png", badge:"new", desc:"Premium navy polo t-shirt. Smart casual perfection." }
];

let cart = [];

/* ===== LOADER ===== */
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").classList.add("hidden");
    animateStats();
  }, 2200);
});

/* ===== NAVBAR ===== */
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 60);
  // Active nav link
  const sections = document.querySelectorAll("section[id]");
  let current = "";
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 200) current = s.id;
  });
  document.querySelectorAll(".nav-link").forEach(l => {
    l.classList.toggle("active", l.getAttribute("href") === "#" + current);
  });
});

// Mobile menu
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("active");
  navLinks.classList.toggle("active");
});
navLinks.querySelectorAll(".nav-link").forEach(l => {
  l.addEventListener("click", () => {
    menuToggle.classList.remove("active");
    navLinks.classList.remove("active");
  });
});

/* ===== RENDER PRODUCTS ===== */
function renderProducts() {
  const dresses = products.filter(p => p.category === "Dresses");
  const tshirts = products.filter(p => p.category === "T-Shirts");
  document.getElementById("dresses-grid").innerHTML = dresses.map(productCardHTML).join("");
  document.getElementById("tshirts-grid").innerHTML = tshirts.map(productCardHTML).join("");
  observeCards();
  attachProductEvents();
}

function productCardHTML(p) {
  const badgeClass = p.badge === "sale" ? "badge-sale" : "badge-new";
  const badgeText = p.badge === "sale" ? "SALE" : "NEW";
  const oldPriceHTML = p.oldPrice ? `<span class="price-old">$${p.oldPrice}</span>` : "";
  return `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="product-badge ${badgeClass}">${badgeText}</span>
        <div class="product-actions">
          <button class="btn-add-cart" data-id="${p.id}">Add to Bag</button>
          <button class="btn-quick-view" data-id="${p.id}">Quick View</button>
        </div>
      </div>
      <div class="product-info">
        <span class="product-category">${p.category}</span>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-price">
          <span class="price-current">$${p.price}</span>
          ${oldPriceHTML}
        </div>
      </div>
    </div>`;
}

/* ===== INTERSECTION OBSERVER FOR CARD ANIMATIONS ===== */
function observeCards() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add("visible"), i * 120);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".product-card").forEach(c => obs.observe(c));
}

/* ===== PRODUCT EVENTS ===== */
function attachProductEvents() {
  document.querySelectorAll(".btn-add-cart").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(parseInt(btn.dataset.id));
    });
  });
  document.querySelectorAll(".btn-quick-view").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openQuickView(parseInt(btn.dataset.id));
    });
  });
}

/* ===== CART ===== */
function addToCart(id) {
  const existing = cart.find(i => i.id === id);
  if (existing) { existing.qty++; }
  else { const p = products.find(pr => pr.id === id); cart.push({ ...p, qty: 1 }); }
  updateCart();
  showToast("Added to bag!");
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(id);
    else updateCart();
  }
}

function updateCart() {
  const countEl = document.getElementById("cart-count");
  const itemsEl = document.getElementById("cart-items");
  const footerEl = document.getElementById("cart-footer");
  const totalEl = document.getElementById("cart-total-price");
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  countEl.textContent = count;
  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><p>Your bag is empty</p></div>`;
    footerEl.style.display = "none";
  } else {
    itemsEl.innerHTML = cart.map(i => `
      <div class="cart-item">
        <div class="cart-item-img"><img src="${i.image}" alt="${i.name}"></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${i.name}</div>
          <div class="cart-item-price">$${i.price}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="changeQty(${i.id},-1)">−</button>
            <span>${i.qty}</span>
            <button class="qty-btn" onclick="changeQty(${i.id},1)">+</button>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart(${i.id})">Remove</button>
        </div>
      </div>`).join("");
    footerEl.style.display = "block";
    totalEl.textContent = "$" + total.toFixed(2);
  }
}

// Cart toggle
const cartToggle = document.getElementById("cart-toggle");
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const cartClose = document.getElementById("cart-close");
function openCart() { cartSidebar.classList.add("active"); cartOverlay.classList.add("active"); }
function closeCart() { cartSidebar.classList.remove("active"); cartOverlay.classList.remove("active"); }
cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

/* ===== SEARCH ===== */
const searchToggle = document.getElementById("search-toggle");
const searchOverlay = document.getElementById("search-overlay");
const searchClose = document.getElementById("search-close");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

searchToggle.addEventListener("click", () => { searchOverlay.classList.add("active"); searchInput.focus(); });
searchClose.addEventListener("click", () => { searchOverlay.classList.remove("active"); searchInput.value = ""; searchResults.innerHTML = ""; });
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase().trim();
  if (q.length < 2) { searchResults.innerHTML = ""; return; }
  const results = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  searchResults.innerHTML = results.length ? results.map(p => `
    <div class="search-result-item" onclick="openQuickView(${p.id}); document.getElementById('search-close').click();">
      <strong>${p.name}</strong> — <span style="color:var(--accent)">$${p.price}</span>
    </div>`).join("") : `<p style="color:var(--text3)">No results found</p>`;
});

/* ===== QUICK VIEW MODAL ===== */
const modalOverlay = document.getElementById("quick-view-overlay");
const modalClose = document.getElementById("modal-close");
let currentModalId = null;

function openQuickView(id) {
  const p = products.find(pr => pr.id === id);
  if (!p) return;
  currentModalId = id;
  document.getElementById("modal-img").src = p.image;
  document.getElementById("modal-img").alt = p.name;
  document.getElementById("modal-category").textContent = p.category;
  document.getElementById("modal-name").textContent = p.name;
  document.getElementById("modal-price").textContent = "$" + p.price;
  document.getElementById("modal-desc").textContent = p.desc;
  modalOverlay.classList.add("active");
}

modalClose.addEventListener("click", () => modalOverlay.classList.remove("active"));
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove("active"); });
document.getElementById("modal-add-cart").addEventListener("click", () => {
  if (currentModalId) { addToCart(currentModalId); modalOverlay.classList.remove("active"); }
});

// Size buttons
document.querySelectorAll(".size-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

/* ===== TOAST ===== */
function showToast(msg) {
  const toast = document.getElementById("toast");
  document.getElementById("toast-message").textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

/* ===== STATS COUNTER ===== */
function animateStats() {
  document.querySelectorAll(".stat-number").forEach(el => {
    const target = parseFloat(el.dataset.count);
    const isDecimal = target % 1 !== 0;
    let current = 0;
    const step = target / 60;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(interval); }
      el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
    }, 25);
  });
}

/* ===== NEWSLETTER ===== */
document.getElementById("newsletter-form").addEventListener("submit", (e) => {
  e.preventDefault();
  showToast("Thanks for subscribing! 🎉");
  document.getElementById("email-input").value = "";
});

/* ===== CHECKOUT ===== */
document.getElementById("btn-checkout").addEventListener("click", () => {
  showToast("Checkout coming soon! 🛒");
});

/* ===== THREE.JS 3D ANIMATIONS ===== */
let bgScene, bgCamera, bgRenderer;
let showcaseScene, showcaseCamera, showcaseRenderer, showcaseMesh;
let aboutScene, aboutCamera, aboutRenderer;
let contactScene, contactCamera, contactRenderer;

function initBackground3D() {
  const canvas = document.getElementById("three-canvas");
  bgScene = new THREE.Scene();
  bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  bgCamera.position.z = 30;
  bgRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  bgRenderer.setSize(window.innerWidth, window.innerHeight);
  bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Floating particles
  const particleGeo = new THREE.BufferGeometry();
  const count = 300;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 80;
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0xc9a44c, size: 0.08, transparent: true, opacity: 0.5 });
  bgScene.add(new THREE.Points(particleGeo, particleMat));

  // Floating geometric shapes
  const shapes = [];
  const geos = [
    new THREE.TorusGeometry(1, 0.3, 16, 40),
    new THREE.OctahedronGeometry(0.8),
    new THREE.IcosahedronGeometry(0.7),
    new THREE.TorusKnotGeometry(0.6, 0.2, 64, 16),
    new THREE.DodecahedronGeometry(0.7)
  ];
  for (let i = 0; i < 8; i++) {
    const geo = geos[i % geos.length];
    const mat = new THREE.MeshStandardMaterial({
      color: 0xc9a44c, wireframe: true, transparent: true, opacity: 0.15
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20);
    mesh.userData = { speedX: (Math.random() - 0.5) * 0.01, speedY: (Math.random() - 0.5) * 0.01, speedZ: (Math.random() - 0.5) * 0.005 };
    bgScene.add(mesh);
    shapes.push(mesh);
  }

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  bgScene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xc9a44c, 1, 100);
  pointLight.position.set(10, 10, 10);
  bgScene.add(pointLight);

  function animateBG() {
    requestAnimationFrame(animateBG);
    shapes.forEach(s => {
      s.rotation.x += s.userData.speedX;
      s.rotation.y += s.userData.speedY;
      s.position.y += Math.sin(Date.now() * 0.001 + s.position.x) * 0.003;
    });
    // Rotate particles slowly
    bgScene.children[0].rotation.y += 0.0003;
    bgRenderer.render(bgScene, bgCamera);
  }
  animateBG();
}

function initShowcase3D() {
  const canvas = document.getElementById("showcase-canvas");
  const wrapper = canvas.parentElement;
  showcaseScene = new THREE.Scene();
  showcaseCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  showcaseCamera.position.z = 4;
  showcaseRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  showcaseRenderer.setSize(wrapper.clientWidth, wrapper.clientWidth);
  showcaseRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Dress-form shape (mannequin-like)
  const group = new THREE.Group();

  // Torso
  const torsoGeo = new THREE.CylinderGeometry(0.4, 0.6, 1.8, 32);
  const torsoMat = new THREE.MeshPhysicalMaterial({ color: 0xc9a44c, metalness: 0.6, roughness: 0.2, transparent: true, opacity: 0.8 });
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  group.add(torso);

  // Skirt (cone)
  const skirtGeo = new THREE.ConeGeometry(1.2, 1.6, 32, 1, true);
  const skirtMat = new THREE.MeshPhysicalMaterial({ color: 0xe8c86e, metalness: 0.4, roughness: 0.3, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
  const skirt = new THREE.Mesh(skirtGeo, skirtMat);
  skirt.position.y = -1.6;
  group.add(skirt);

  // Head
  const headGeo = new THREE.SphereGeometry(0.3, 32, 32);
  const headMat = new THREE.MeshPhysicalMaterial({ color: 0xc9a44c, metalness: 0.5, roughness: 0.3 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.2;
  group.add(head);

  // Wireframe overlay
  const wireGeo = new THREE.TorusKnotGeometry(1.5, 0.3, 100, 16);
  const wireMat = new THREE.MeshStandardMaterial({ color: 0xc9a44c, wireframe: true, transparent: true, opacity: 0.08 });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  group.add(wire);

  group.position.y = 0.3;
  showcaseScene.add(group);
  showcaseMesh = group;

  const ambLight = new THREE.AmbientLight(0xffffff, 0.4);
  showcaseScene.add(ambLight);
  const dirLight = new THREE.DirectionalLight(0xc9a44c, 1.2);
  dirLight.position.set(3, 5, 4);
  showcaseScene.add(dirLight);
  const rimLight = new THREE.PointLight(0xe8c86e, 0.8, 20);
  rimLight.position.set(-3, 2, -3);
  showcaseScene.add(rimLight);

  function animateShowcase() {
    requestAnimationFrame(animateShowcase);
    group.rotation.y += 0.008;
    wire.rotation.x += 0.003;
    wire.rotation.z += 0.002;
    showcaseRenderer.render(showcaseScene, showcaseCamera);
  }
  animateShowcase();

  document.getElementById("rotate-model").addEventListener("click", () => {
    const start = group.rotation.y;
    const end = start + Math.PI * 2;
    const duration = 1500;
    const startTime = Date.now();
    function spinAnim() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      group.rotation.y = start + (end - start) * eased;
      if (progress < 1) requestAnimationFrame(spinAnim);
    }
    spinAnim();
  });
}

function initAbout3D() {
  const canvas = document.getElementById("about-canvas");
  const wrapper = canvas.parentElement;
  aboutScene = new THREE.Scene();
  aboutCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  aboutCamera.position.z = 5;
  aboutRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  aboutRenderer.setSize(wrapper.clientWidth, wrapper.clientWidth);
  aboutRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Cloth-like wave animation with plane geometry
  const planeGeo = new THREE.PlaneGeometry(5, 5, 40, 40);
  const planeMat = new THREE.MeshPhysicalMaterial({ color: 0xc9a44c, metalness: 0.3, roughness: 0.5, side: THREE.DoubleSide, wireframe: false, transparent: true, opacity: 0.6 });
  const planeMesh = new THREE.Mesh(planeGeo, planeMat);
  aboutScene.add(planeMesh);

  // Wireframe overlay
  const wireframeMat = new THREE.MeshBasicMaterial({ color: 0xe8c86e, wireframe: true, transparent: true, opacity: 0.15 });
  const wireframeMesh = new THREE.Mesh(planeGeo, wireframeMat);
  aboutScene.add(wireframeMesh);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(2, 3, 4);
  aboutScene.add(light);
  aboutScene.add(new THREE.AmbientLight(0xc9a44c, 0.4));

  function animateAbout() {
    requestAnimationFrame(animateAbout);
    const positions = planeGeo.attributes.position;
    const time = Date.now() * 0.001;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      positions.setZ(i, Math.sin(x * 1.5 + time) * 0.3 + Math.cos(y * 1.5 + time * 0.7) * 0.3);
    }
    positions.needsUpdate = true;
    planeGeo.computeVertexNormals();
    planeMesh.rotation.x = -0.3;
    planeMesh.rotation.z = time * 0.05;
    wireframeMesh.rotation.x = planeMesh.rotation.x;
    wireframeMesh.rotation.z = planeMesh.rotation.z;
    aboutRenderer.render(aboutScene, aboutCamera);
  }
  animateAbout();
}

function initContact3D() {
  const canvas = document.getElementById("contact-canvas");
  contactScene = new THREE.Scene();
  contactCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  contactCamera.position.z = 4;
  contactRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  contactRenderer.setSize(400, 400);
  contactRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Envelope / gift box shape
  const boxGeo = new THREE.BoxGeometry(1.5, 1, 1.5);
  const boxMat = new THREE.MeshPhysicalMaterial({ color: 0xc9a44c, metalness: 0.5, roughness: 0.3, transparent: true, opacity: 0.7 });
  const box = new THREE.Mesh(boxGeo, boxMat);
  contactScene.add(box);

  // Ribbon
  const ribbonGeo = new THREE.TorusGeometry(0.9, 0.05, 8, 50);
  const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xf0d98c });
  const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbon.position.y = 0.5;
  contactScene.add(ribbon);

  // Stars
  for (let i = 0; i < 30; i++) {
    const starGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xe8c86e });
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.set((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 3);
    star.userData.speed = Math.random() * 0.02;
    contactScene.add(star);
  }

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(2, 3, 4);
  contactScene.add(light);
  contactScene.add(new THREE.AmbientLight(0xffffff, 0.3));

  function animateContact() {
    requestAnimationFrame(animateContact);
    box.rotation.y += 0.008;
    box.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
    ribbon.rotation.x += 0.01;
    ribbon.rotation.z += 0.005;
    contactScene.children.forEach(c => {
      if (c.userData.speed) {
        c.position.y += Math.sin(Date.now() * 0.002 + c.position.x) * 0.002;
      }
    });
    contactRenderer.render(contactScene, contactCamera);
  }
  animateContact();
}

/* ===== RESIZE ===== */
window.addEventListener("resize", () => {
  if (bgRenderer) {
    bgCamera.aspect = window.innerWidth / window.innerHeight;
    bgCamera.updateProjectionMatrix();
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
  }
});

/* ===== INIT ===== */
renderProducts();

try { initBackground3D(); } catch(e) { console.warn("BG 3D error:", e); }
try { initShowcase3D(); } catch(e) { console.warn("Showcase 3D error:", e); }
try { initAbout3D(); } catch(e) { console.warn("About 3D error:", e); }
try { initContact3D(); } catch(e) { console.warn("Contact 3D error:", e); }
