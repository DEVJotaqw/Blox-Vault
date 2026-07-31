/* ==========================================================================
   BloxVault - Interactive Application Script
   Handles Cart, Calculator, Checkout Modal, Animations, and Live Events
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- DATA SOURCES ---
  const packagesData = [
    {
      id: 'pkg-400',
      robux: 400,
      bonus: 0,
      price: 19.90,
      oldPrice: 32.00,
      badge: 'Iniciante',
      popular: false,
      unitPrice: 'R$ 0,049 por Robux'
    },
    {
      id: 'pkg-800',
      robux: 800,
      bonus: 50,
      price: 37.90,
      oldPrice: 59.90,
      badge: 'POPULAR',
      popular: true,
      unitPrice: 'R$ 0,047 por Robux'
    },
    {
      id: 'pkg-1700',
      robux: 1700,
      bonus: 150,
      price: 74.90,
      oldPrice: 119.90,
      badge: 'MAIS VENDIDO 🔥',
      popular: false,
      unitPrice: 'R$ 0,044 por Robux'
    },
    {
      id: 'pkg-4500',
      robux: 4500,
      bonus: 450,
      price: 189.90,
      oldPrice: 299.90,
      badge: 'MELHOR CUSTO 💎',
      popular: false,
      unitPrice: 'R$ 0,042 por Robux'
    },
    {
      id: 'pkg-10000',
      robux: 10000,
      bonus: 1200,
      price: 399.90,
      oldPrice: 650.00,
      badge: '30% OFF',
      popular: false,
      unitPrice: 'R$ 0,039 por Robux'
    },
    {
      id: 'pkg-22500',
      robux: 22500,
      bonus: 3000,
      price: 849.90,
      oldPrice: 1399.00,
      badge: 'MAX DISCOUNT 🚀',
      popular: false,
      unitPrice: 'R$ 0,037 por Robux'
    }
  ];

  // --- GATEWAY CONFIGURATION ---
  // Substitua com suas credenciais do Mercado Pago ou Asaas para receber vendas reais na sua conta:
  const GATEWAY_CONFIG = {
    provider: 'mercadopago', // Opções: 'mercadopago' | 'asaas' | 'demo'
    mercadoPagoPublicKey: 'APP_USR-YOUR-PUBLIC-KEY-HERE', // Chave Pública do Mercado Pago
    asaasApiKey: '$aact_YOUR_ASAAS_API_KEY_HERE', // Chave API do Asaas
    sandbox: true // Defina como false para ambiente de produção
  };

  const livePurchasesData = [
    { name: 'Lucas_Gamer99', amount: '1.700 Robux', time: 'há 1 min' },
    { name: 'SofiaPlay_RB', amount: '4.500 Robux', time: 'há 3 min' },
    { name: 'Matheus_Vip', amount: '800 Robux', time: 'há 5 min' },
    { name: 'GabrielX_PRO', amount: '10.000 Robux', time: 'há 8 min' },
    { name: 'Ana_Blox', amount: '400 Robux', time: 'há 12 min' },
    { name: 'Kael_Roblox', amount: '22.500 Robux', time: 'há 15 min' }
  ];

  const reviewsData = [
    {
      author: 'Matheus Santos',
      avatar: 'MS',
      stars: 5,
      text: 'Comprei 1.700 Robux e chegou em menos de 5 minutos! Fiquei com medo por ser a primeira vez, mas o suporte foi super atencioso. Recomendo muito!',
      date: 'Ontem',
      category: '5star'
    },
    {
      author: 'Beatriz Lima',
      avatar: 'BL',
      stars: 5,
      text: 'Preço incrivelmente mais barato que na loja do Roblox. Consegui comprar a gamepass que eu queria no Bloxburg!',
      date: 'Há 2 dias',
      category: '5star'
    },
    {
      author: 'Pedro Henrique',
      avatar: 'PH',
      stars: 5,
      text: 'Muito bom! Não pediram minha senha em nenhum momento. Paguei no PIX e recebi na hora. Nota 10/10.',
      date: 'Há 3 dias',
      category: '5star'
    },
    {
      author: 'Gabriel Miller',
      avatar: 'GM',
      stars: 5,
      text: 'Já é a 3ª vez que compro na BloxVault. Loja de extrema confiança!',
      date: 'Há 5 dias',
      category: 'recent'
    }
  ];

  // --- STATE ---
  let cart = [];
  let activeSelectedItem = null;
  let pixTimerInterval = null;

  // --- DOM ELEMENTS ---
  const packagesGrid = document.getElementById('packages-grid');
  const tickerWrapper = document.getElementById('ticker-wrapper');
  const reviewsGrid = document.getElementById('reviews-grid');
  const cartCountEl = document.getElementById('cart-count');
  const cartItemsCountEl = document.getElementById('cart-items-count');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartItemsList = document.getElementById('cart-items-list');
  const emptyCartView = document.getElementById('empty-cart-view');
  const cartDrawerFooter = document.getElementById('cart-drawer-footer');
  const cartTotalPriceEl = document.getElementById('cart-total-price');
  const btnCartCheckout = document.getElementById('btn-cart-checkout');

  // Checkout Modal Elements
  const checkoutModal = document.getElementById('checkout-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const robloxUsernameInput = document.getElementById('roblox-username-input');
  const btnVerifyUser = document.getElementById('btn-verify-user');
  const userPreviewCard = document.getElementById('user-preview-card');
  const previewDisplayName = document.getElementById('preview-display-name');
  const userAvatarInitials = document.getElementById('user-avatar-initials');
  const btnGoStep2 = document.getElementById('btn-go-step-2');
  const btnGoStep3 = document.getElementById('btn-go-step-3');
  const btnBackStep1 = document.getElementById('btn-back-step-1');
  const btnSimulatePaid = document.getElementById('btn-simulate-paid');
  const btnFinishOrder = document.getElementById('btn-finish-order');
  const btnCopyPix = document.getElementById('btn-copy-pix');
  const pixCopyInput = document.getElementById('pix-copy-input');

  // Calculator Elements
  const calcRobuxInput = document.getElementById('calc-robux-input');
  const calcRange = document.getElementById('calc-range');
  const calcOfficialPrice = document.getElementById('calc-official-price');
  const calcFinalPrice = document.getElementById('calc-final-price');
  const calcEconomy = document.getElementById('calc-economy');
  const calcBuyRobuxText = document.getElementById('calc-buy-robux-text');
  const calcBuyPriceText = document.getElementById('calc-buy-price-text');
  const btnBuyCustom = document.getElementById('btn-buy-custom');

  // Track Order Elements
  const trackModal = document.getElementById('track-modal');
  const btnOpenTrack = document.getElementById('btn-open-track');
  const trackModalClose = document.getElementById('track-modal-close');
  const btnDoTrack = document.getElementById('btn-do-track');
  const trackResultBox = document.getElementById('track-result-box');

  // --- INITIALIZATION ---
  initPackages();
  initTicker();
  initReviews();
  initCalculator();
  initFAQ();

  // --- RENDER PACKAGES ---
  function initPackages() {
    if (!packagesGrid) return;
    packagesGrid.innerHTML = packagesData.map(pkg => `
      <div class="package-card ${pkg.popular ? 'popular' : ''}">
        ${pkg.badge ? `<div class="card-badge">${pkg.badge}</div>` : ''}
        
        <div>
          <div class="pkg-icon-wrapper">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" fill="rgba(255, 215, 0, 0.2)"/>
              <rect x="9" y="9" width="6" height="6" transform="rotate(45 12 12)" fill="#FFD700"/>
            </svg>
          </div>
          <h3 class="pkg-title">${pkg.robux.toLocaleString('pt-BR')} <span>Robux</span></h3>
          ${pkg.bonus > 0 ? `<div class="pkg-bonus">+${pkg.bonus} Robux de Bônus</div>` : ''}
          
          <div class="pkg-price-box">
            <div class="pkg-old-price">R$ ${pkg.oldPrice.toFixed(2).replace('.', ',')}</div>
            <div class="pkg-current-price">R$ ${pkg.price.toFixed(2).replace('.', ',')}</div>
            <div class="pkg-unit-price">${pkg.unitPrice}</div>
          </div>

          <ul class="pkg-features">
            <li><span>✓</span> Entrega sem necessidade de senha</li>
            <li><span>✓</span> Ativação Automática 24/7</li>
            <li><span>✓</span> Suporte VIP Pós-venda</li>
          </ul>
        </div>

        <button class="btn btn-primary btn-block btn-buy-package" data-id="${pkg.id}">
          Comprar Agora
        </button>
      </div>
    `).join('');

    // Attach Event Listeners to Package Buy Buttons
    document.querySelectorAll('.btn-buy-package').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const selected = packagesData.find(p => p.id === id);
        if (selected) {
          openCheckoutForItem({
            title: `${selected.robux.toLocaleString('pt-BR')} Robux`,
            price: selected.price,
            bonus: selected.bonus > 0 ? `+${selected.bonus} Robux Grátis` : 'Nenhum'
          });
        }
      });
    });
  }

  // --- RENDER LIVE TICKER ---
  function initTicker() {
    if (!tickerWrapper) return;
    const itemsHTML = livePurchasesData.map(item => `
      <div class="ticker-item">
        <span>⚡ <strong>@${item.name}</strong> comprou <strong>${item.amount}</strong></span>
        <span class="time">${item.time}</span>
      </div>
    `).join('');

    // Duplicate ticker list to create seamless loop
    tickerWrapper.innerHTML = itemsHTML + itemsHTML + itemsHTML;
  }

  // --- RENDER REVIEWS ---
  function initReviews() {
    if (!reviewsGrid) return;
    renderReviews('all');

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const filter = e.currentTarget.getAttribute('data-filter');
        renderReviews(filter);
      });
    });
  }

  function renderReviews(filter) {
    let filtered = reviewsData;
    if (filter === '5star') {
      filtered = reviewsData.filter(r => r.stars === 5);
    } else if (filter === 'recent') {
      filtered = reviewsData.filter(r => r.category === 'recent');
    }

    reviewsGrid.innerHTML = filtered.map(r => `
      <div class="review-card">
        <div class="review-author-info">
          <div class="author-avatar">${r.avatar}</div>
          <div class="author-details">
            <h4>${r.author}</h4>
            <span class="verified-tag">✓ Compra Verificada</span>
          </div>
        </div>
        <div class="stars">★★★★★</div>
        <p class="review-text">"${r.text}"</p>
        <span class="review-date">${r.date}</span>
      </div>
    `).join('');
  }

  // --- DYNAMIC CALCULATOR ---
  function initCalculator() {
    if (!calcRobuxInput || !calcRange) return;

    function updateCalcValues(val) {
      val = Math.max(100, Math.min(50000, parseInt(val) || 100));
      calcRobuxInput.value = val;
      calcRange.value = val;

      // Rate: official ~ R$ 0.062 per Robux, BloxVault ~ R$ 0.039 per Robux
      const officialPrice = val * 0.062;
      const finalPrice = val * 0.039;
      const economy = officialPrice - finalPrice;
      const discountPercent = Math.round((economy / officialPrice) * 100);

      calcOfficialPrice.textContent = `R$ ${officialPrice.toFixed(2).replace('.', ',')}`;
      calcFinalPrice.textContent = `R$ ${finalPrice.toFixed(2).replace('.', ',')}`;
      calcEconomy.textContent = `R$ ${economy.toFixed(2).replace('.', ',')} (${discountPercent}% OFF)`;

      calcBuyRobuxText.textContent = val.toLocaleString('pt-BR');
      calcBuyPriceText.textContent = `R$ ${finalPrice.toFixed(2).replace('.', ',')}`;
    }

    calcRange.addEventListener('input', (e) => updateCalcValues(e.target.value));
    calcRobuxInput.addEventListener('input', (e) => updateCalcValues(e.target.value));

    if (btnBuyCustom) {
      btnBuyCustom.addEventListener('click', () => {
        const val = parseInt(calcRobuxInput.value) || 2500;
        const finalPrice = val * 0.039;
        openCheckoutForItem({
          title: `${val.toLocaleString('pt-BR')} Robux (Personalizado)`,
          price: finalPrice,
          bonus: 'Desconto Progressivo'
        });
      });
    }

    updateCalcValues(2500);
  }

  // --- FAQ ACCORDION ---
  function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const isActive = item.classList.contains('active');
        
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  // --- CHECKOUT MODAL FLOW ---
  function openCheckoutForItem(item) {
    activeSelectedItem = item;

    // Update Summary in modal
    document.getElementById('summary-item-name').textContent = item.title;
    document.getElementById('summary-item-price').textContent = `R$ ${item.price.toFixed(2).replace('.', ',')}`;
    document.getElementById('summary-item-bonus').textContent = item.bonus;
    document.getElementById('summary-item-total').textContent = `R$ ${item.price.toFixed(2).replace('.', ',')}`;

    // Reset Steps
    goToStep(1);
    checkoutModal.classList.add('active');
  }

  function goToStep(stepNum) {
    document.querySelectorAll('.modal-step-content').forEach(s => s.classList.remove('active'));
    document.getElementById(`step-${stepNum}-content`).classList.add('active');

    // Update Dots
    for (let i = 1; i <= 3; i++) {
      const dot = document.getElementById(`dot-step-${i}`);
      const line = document.getElementById(`line-step-${i}`);

      if (dot) {
        if (i <= stepNum) dot.classList.add('active');
        else dot.classList.remove('active');
      }
      if (line) {
        if (i < stepNum) line.classList.add('active');
        else line.classList.remove('active');
      }
    }

    // Modal Title Updates
    const modalTitle = document.getElementById('modal-title');
    if (stepNum === 1) modalTitle.textContent = 'Identifique sua conta Roblox';
    if (stepNum === 2) modalTitle.textContent = 'Escolha a forma de pagamento';
    if (stepNum === 3) {
      modalTitle.textContent = 'Pagamento via PIX';
      startPixTimer();
    }
    if (stepNum === 4) modalTitle.textContent = 'Status de Entrega do Pedido';
  }

  // User Verification Simulation
  btnVerifyUser.addEventListener('click', () => {
    const username = robloxUsernameInput.value.trim();
    if (!username) {
      showToast('Por favor, digite seu Nickname do Roblox.', 'warning');
      return;
    }

    // Simulate avatar search loading
    btnVerifyUser.textContent = 'Buscando...';
    btnVerifyUser.disabled = true;

    setTimeout(() => {
      btnVerifyUser.textContent = 'Buscar Perfil';
      btnVerifyUser.disabled = false;

      previewDisplayName.textContent = `@${username}`;
      userAvatarInitials.textContent = username.substring(0, 2).toUpperCase();
      userPreviewCard.classList.remove('hidden');
      btnGoStep2.disabled = false;

      showToast(`Conta @${username} localizada no Roblox!`, 'success');
    }, 800);
  });

  // Modal Step Navigation Events
  btnGoStep2.addEventListener('click', () => goToStep(2));
  btnBackStep1.addEventListener('click', () => goToStep(1));
  btnGoStep3.addEventListener('click', () => goToStep(3));

  modalCloseBtn.addEventListener('click', () => {
    checkoutModal.classList.remove('active');
    clearInterval(pixTimerInterval);
  });

  // PIX Timer
  function startPixTimer() {
    clearInterval(pixTimerInterval);
    let secondsLeft = 15 * 60; // 15 mins
    const timerDisplay = document.getElementById('pix-timer');

    pixTimerInterval = setInterval(() => {
      secondsLeft--;
      const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
      const s = (secondsLeft % 60).toString().padStart(2, '0');
      if (timerDisplay) timerDisplay.textContent = `${m}:${s}`;

      if (secondsLeft <= 0) {
        clearInterval(pixTimerInterval);
      }
    }, 1000);
  }

  // Copy PIX Code
  btnCopyPix.addEventListener('click', () => {
    pixCopyInput.select();
    navigator.clipboard.writeText(pixCopyInput.value);
    showToast('Código PIX Copia e Cola copiado com sucesso!', 'success');
  });

  // Simulate Payment Paid
  btnSimulatePaid.addEventListener('click', () => {
    const username = robloxUsernameInput.value.trim() || 'PlayerRoblox';
    document.getElementById('success-username').textContent = `@${username}`;
    document.getElementById('order-tracking-id').textContent = `BV-${Math.floor(100000 + Math.random() * 900000)}`;
    
    goToStep(4);
    clearInterval(pixTimerInterval);

    // Simulate animated timeline progress
    setTimeout(() => {
      const step2 = document.getElementById('status-step-2');
      step2.className = 'timeline-step completed';
      step2.querySelector('.dot').textContent = '✓';

      const step3 = document.getElementById('status-step-3');
      step3.className = 'timeline-step active';
      step3.querySelector('.dot').className = 'dot spinner-dot';

      setTimeout(() => {
        step3.className = 'timeline-step completed';
        step3.querySelector('.dot').textContent = '✓';
        step3.querySelector('.dot').classList.remove('spinner-dot');

        showToast('🎉 Robux enviados com sucesso para sua conta!', 'success');
      }, 2000);
    }, 2000);
  });

  btnFinishOrder.addEventListener('click', () => {
    checkoutModal.classList.remove('active');
    showToast('Obrigado por comprar na BloxVault!', 'success');
  });

  // --- CART DRAWER LOGIC ---
  cartToggleBtn.addEventListener('click', () => cartDrawer.classList.add('active'));
  cartCloseBtn.addEventListener('click', () => cartDrawer.classList.remove('active'));

  // --- TRACK ORDER MODAL ---
  btnOpenTrack.addEventListener('click', () => trackModal.classList.add('active'));
  trackModalClose.addEventListener('click', () => trackModal.classList.remove('active'));

  btnDoTrack.addEventListener('click', () => {
    const val = document.getElementById('track-input').value.trim();
    if (!val) {
      showToast('Digite o código do pedido ou nickname.', 'warning');
      return;
    }
    trackResultBox.classList.remove('hidden');
  });

  // --- TOAST SYSTEM ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : 'ℹ'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

});
