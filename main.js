document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("nav-open");
      menuBtn.classList.toggle("menu-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("nav-open"); menuBtn.classList.remove("menu-open");
      menuBtn.setAttribute("aria-expanded", "false");
    }));
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // إشعار صغير بدل نافذة مزعجة
  const toast = document.getElementById("toast");
  let toastTimer;
  function notify(message) {
    if (!toast) return;
    toast.textContent = message; toast.classList.add("toast-show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("toast-show"), 2600);
  }

  // سلة تجريبية تحفظ اختياراتك في المتصفح
  const CART_KEY = "luna_demo_cart";
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch (_) { cart = []; }
  const saveCart = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (_) { } };
  const count = () => cart.reduce((sum, item) => sum + item.qty, 0);
  const total = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  function refreshCart() {
    document.querySelectorAll(".bag-count").forEach(el => el.textContent = count());
    const items = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");
    if (totalEl) totalEl.textContent = "$" + total().toFixed(2).replace(/\.00$/, "");
    if (!items) return;
    if (!cart.length) {
      items.innerHTML = '<div class="empty-cart"><span>♡</span><b>حقيبتكِ تنتظر قطعتكِ الأولى</b><small>ابدئي باكتشاف القطع التي تحبينها.</small></div>';
      return;
    }
    items.innerHTML = cart.map(item => `<article class="cart-item"><div class="cart-item-art">☾</div><div class="cart-item-copy"><b>${escapeHTML(item.name)}</b><small>$${item.price} × ${item.qty}</small><div class="qty-controls"><button data-qty="-1" data-id="${item.id}" aria-label="تقليل الكمية">−</button><span>${item.qty}</span><button data-qty="1" data-id="${item.id}" aria-label="زيادة الكمية">+</button></div></div><button class="remove-item" data-remove="${item.id}" aria-label="حذف المنتج">×</button></article>`).join("");
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function addProduct(card) {
    const id = card.dataset.id;
    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, name: card.dataset.name, price: Number(card.dataset.price), qty: 1 });
    saveCart(); refreshCart(); notify("أُضيفت " + card.dataset.name + " إلى حقيبتكِ ♡");
  }
  document.querySelectorAll(".quick-add").forEach(btn => {
    btn.addEventListener("click", () => addProduct(btn.closest(".product-card")));
  });

  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("drawerOverlay");
  function openCart() {
    if (!drawer || !overlay) { window.location.href = "shop.html#products"; return; }
    drawer.classList.add("drawer-open"); overlay.classList.add("overlay-open");
    drawer.setAttribute("aria-hidden", "false"); document.body.classList.add("no-scroll");
    refreshCart();
  }
  function closeCart() {
    if (!drawer || !overlay) return;
    drawer.classList.remove("drawer-open"); overlay.classList.remove("overlay-open");
    drawer.setAttribute("aria-hidden", "true"); document.body.classList.remove("no-scroll");
  }
  document.querySelectorAll(".cart-open").forEach(btn => btn.addEventListener("click", openCart));
  const cartClose = document.querySelector(".cart-close");
  if (cartClose) cartClose.addEventListener("click", closeCart);
  if (overlay) overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeCart(); closeSearch(); } });
  const itemsBox = document.getElementById("cartItems");
  if (itemsBox) itemsBox.addEventListener("click", e => {
    const qtyBtn = e.target.closest("[data-qty]");
    const removeBtn = e.target.closest("[data-remove]");
    if (qtyBtn) {
      const item = cart.find(p => p.id === qtyBtn.dataset.id);
      if (item) item.qty += Number(qtyBtn.dataset.qty);
      cart = cart.filter(p => p.qty > 0); saveCart(); refreshCart();
    }
    if (removeBtn) {
      cart = cart.filter(p => p.id !== removeBtn.dataset.remove); saveCart(); refreshCart();
      notify("تم حذف القطعة من الحقيبة");
    }
  });
  const checkout = document.getElementById("checkoutBtn");
  if (checkout) checkout.addEventListener("click", () => {
    if (!cart.length) return notify("حقيبتكِ فارغة، اختاري قطعة أولًا ♡");
    notify("هذه واجهة تجريبية؛ اربطيها بنظام طلبات لإكمال الشراء.");
  });
  refreshCart();

  // فلترة منتجات المتجر
  const filterButtons = document.querySelectorAll(".filter-btn");
  const productCards = document.querySelectorAll(".shop-products .product-card");
  const noResults = document.getElementById("noResults");
  filterButtons.forEach(btn => btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.toggle("active", b === btn));
    let visible = 0;
    productCards.forEach(card => {
      const show = btn.dataset.filter === "all" || card.dataset.category === btn.dataset.filter;
      card.hidden = !show; if (show) visible++;
    });
    if (noResults) noResults.style.display = visible ? "none" : "block";
  }));

  // نافذة البحث
  const modal = document.getElementById("searchModal");
  function openSearch() {
    if (!modal) return;
    modal.classList.add("search-visible"); modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    const input = document.getElementById("searchInput"); if (input) setTimeout(() => input.focus(), 80);
  }
  function closeSearch() {
    if (!modal) return;
    modal.classList.remove("search-visible"); modal.setAttribute("aria-hidden", "true");
    if (!drawer || !drawer.classList.contains("drawer-open")) document.body.classList.remove("no-scroll");
  }
  document.querySelectorAll(".search-open").forEach(btn => btn.addEventListener("click", openSearch));
  const searchClose = document.querySelector(".search-close");
  if (searchClose) searchClose.addEventListener("click", closeSearch);
  if (modal) modal.addEventListener("click", e => { if (e.target === modal) closeSearch(); });
  const searchForm = document.getElementById("searchForm");
  if (searchForm) searchForm.addEventListener("submit", e => {
    e.preventDefault();
    const query = document.getElementById("searchInput").value.trim();
    if (!query) return;
    closeSearch();
    window.location.href = "shop.html?search=" + encodeURIComponent(query) + "#products";
  });
  const params = new URLSearchParams(window.location.search);
  const query = params.get("search");
  if (query && productCards.length) {
    let visible = 0;
    productCards.forEach(card => {
      const match = (card.dataset.name || "").includes(query) || card.textContent.includes(query);
      card.hidden = !match; if (match) visible++;
    });
    filterButtons.forEach(b => b.classList.remove("active"));
    if (noResults) noResults.style.display = visible ? "none" : "block";
    const heading = document.querySelector(".shop-toolbar h2");
    if (heading) heading.innerHTML = 'نتائج البحث عن <em>' + escapeHTML(query) + '</em>';
  }

  // نماذج واجهة تجريبية
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  if (contactForm && formStatus) contactForm.addEventListener("submit", e => {
    e.preventDefault();
    if (!contactForm.reportValidity()) return;
    formStatus.textContent = "شكرًا " + contactForm.elements.name.value.trim() + "، تم التحقق من رسالتكِ بنجاح. لنتيجة فعلية، اربطي النموذج بخادم أو خدمة بريد.";
    formStatus.classList.add("status-visible"); contactForm.reset();
  });
  const newsletter = document.getElementById("newsletterForm");
  const newsletterStatus = document.getElementById("newsletterStatus");
  if (newsletter && newsletterStatus) newsletter.addEventListener("submit", e => {
    e.preventDefault(); if (!newsletter.reportValidity()) return;
    newsletterStatus.textContent = "شكرًا لانضمامكِ! هذا نموذج تجريبي لا يحفظ البريد فعليًا.";
    newsletter.reset();
  });
});