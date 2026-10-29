/**
 * GAMILITY - Core JavaScript Controller
 * Handles Navigation, Mobile Drawer, Live Filtering & UI Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Header Scroll Effect ---
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // --- Mobile Drawer Toggle ---
  const mobileToggle = document.getElementById('mobileNavToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');

  function openDrawer() {
    mobileToggle?.classList.add('open');
    mobileDrawer?.classList.add('open');
    drawerBackdrop?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileToggle?.classList.remove('open');
    mobileDrawer?.classList.remove('open');
    drawerBackdrop?.classList.remove('active');
    document.body.style.overflow = '';
  }

  mobileToggle?.addEventListener('click', () => {
    if (mobileDrawer?.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  drawerBackdrop?.addEventListener('click', closeDrawer);

  // Close drawer on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer?.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Close drawer when clicking any link inside it
  const drawerLinks = document.querySelectorAll('.drawer-link');
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // --- Dynamic Year in Footer ---
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --- Live Quick Search (Home page & Hubs) ---
  const searchInput = document.getElementById('heroSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const gameCards = document.querySelectorAll('.game-card');
      const toolCards = document.querySelectorAll('.tool-card');

      gameCards.forEach(card => {
        const title = card.querySelector('.game-title')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.game-desc')?.textContent.toLowerCase() || '';
        const badge = card.querySelector('.game-badge')?.textContent.toLowerCase() || '';
        const matches = title.includes(query) || desc.includes(query) || badge.includes(query);
        card.style.display = matches ? '' : 'none';
      });

      toolCards.forEach(card => {
        const title = card.querySelector('.tool-title')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.tool-desc')?.textContent.toLowerCase() || '';
        const tag = card.querySelector('.tool-tag')?.textContent.toLowerCase() || '';
        const matches = title.includes(query) || desc.includes(query) || tag.includes(query);
        card.style.display = matches ? '' : 'none';
      });
    });
  }

  // ==========================================================================
  // NEWSLETTER: GOOGLE SHEETS ASYNCHRONOUS INTEGRATION
  // ==========================================================================
  // Paste your Google Apps Script Web App URL here after deploying:
  const GOOGLE_SHEETS_NEWSLETTER_URL = 'https://script.google.com/macros/s/AKfycbwQr784YGlwTDAX9YAT7aL8K7JlodfgILyGQjNz-ghEM2NjQJxPRO5_EiXCdrcsBTtmQA/exec';

  const newsletterForm = document.getElementById('footerNewsletterForm');
  if (newsletterForm) {
    // Create inline feedback message container
    let feedbackEl = document.createElement('div');
    feedbackEl.className = 'newsletter-feedback-msg';
    feedbackEl.style.fontSize = '0.8rem';
    feedbackEl.style.marginTop = '0.5rem';
    feedbackEl.style.transition = 'all 0.3s ease';
    newsletterForm.parentNode?.insertBefore(feedbackEl, newsletterForm.nextSibling);

    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      const submitBtn = newsletterForm.querySelector('button[type="submit"]');
      const email = input?.value?.trim();

      if (!email) return;

      const originalBtnText = submitBtn ? submitBtn.textContent : 'Join';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '...';
      }

      feedbackEl.textContent = 'Subscribing...';
      feedbackEl.style.color = 'var(--text-muted)';

      if (GOOGLE_SHEETS_NEWSLETTER_URL) {
        try {
          // Send to Google Sheets Apps Script Web App
          const formData = new FormData();
          formData.append('email', email);
          formData.append('timestamp', new Date().toISOString());

          await fetch(GOOGLE_SHEETS_NEWSLETTER_URL, {
            method: 'POST',
            mode: 'no-cors', // Standard for Google Apps Script Web Apps
            body: formData
          });

          feedbackEl.textContent = '🎉 You are subscribed! Welcome to Gamility.';
          feedbackEl.style.color = 'var(--accent-emerald)';
          if (input) input.value = '';
        } catch (err) {
          console.error('Newsletter error:', err);
          feedbackEl.textContent = '⚠️ Unable to connect. Please try again later.';
          feedbackEl.style.color = '#f43f5e';
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        }
      } else {
        // Fallback demo mode if Google Sheets script URL is not yet pasted
        setTimeout(() => {
          feedbackEl.textContent = '🎉 Subscribed! (Paste your Google Sheet Web App URL in main.js to save live rows)';
          feedbackEl.style.color = 'var(--accent-emerald)';
          if (input) input.value = '';
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        }, 500);
      }
    });
  }

  // ==========================================================================
  // CONTACT FORM: FORMSUBMIT AJAX SUBMISSION
  // ==========================================================================
  const contactForm = document.getElementById('gamilityContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Send Message';

      let statusEl = document.getElementById('contactFormStatus');
      if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.id = 'contactFormStatus';
        statusEl.style.padding = '0.85rem 1rem';
        statusEl.style.borderRadius = 'var(--radius-md)';
        statusEl.style.fontSize = '0.9rem';
        statusEl.style.marginTop = '1rem';
        statusEl.style.display = 'none';
        contactForm.appendChild(statusEl);
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳</span> Sending message...';
      }

      try {
        const formData = new FormData(contactForm);
        const actionUrl = contactForm.getAttribute('action') || 'https://formsubmit.co/ajax/';

        const res = await fetch(actionUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          body: formData
        });

        if (res.ok) {
          statusEl.style.display = 'block';
          statusEl.style.background = 'rgba(16, 185, 129, 0.15)';
          statusEl.style.border = '1px solid rgba(16, 185, 129, 0.4)';
          statusEl.style.color = '#34d399';
          statusEl.innerHTML = '✅ <strong>Thank you!</strong> Your message has been sent successfully. We will get back to you shortly.';
          contactForm.reset();
        } else {
          throw new Error('Failed to send message.');
        }
      } catch (err) {
        console.error('Contact submit error:', err);
        statusEl.style.display = 'block';
        statusEl.style.background = 'rgba(244, 63, 94, 0.15)';
        statusEl.style.border = '1px solid rgba(244, 63, 94, 0.4)';
        statusEl.style.color = '#fda4af';
        statusEl.innerHTML = '⚠️ <strong>Oops!</strong> Unable to send message. Please check your connection or try again later.';
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  }

  // ==========================================================================
  // GAMES HUB: CATEGORY FILTERING & SEARCH
  // ==========================================================================
  const gameCategoryBtns = document.querySelectorAll('.game-filter-btn');
  const gamesGrid = document.getElementById('gamesGrid');
  const gameHubSearchInput = document.getElementById('gameHubSearchInput');
  const gamesCountEl = document.getElementById('visibleGamesCount');

  let activeCategory = 'all';
  let searchQuery = '';

  function filterGames() {
    if (!gamesGrid) return;
    const cards = gamesGrid.querySelectorAll('.game-card');
    let visibleCount = 0;

    cards.forEach(card => {
      const category = card.getAttribute('data-category') || '';
      const title = card.querySelector('.game-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.game-desc')?.textContent.toLowerCase() || '';
      const tags = card.querySelector('.game-card-tags')?.textContent.toLowerCase() || '';

      const matchesCat = (activeCategory === 'all') || (category === activeCategory);
      const matchesSearch = !searchQuery || title.includes(searchQuery) || desc.includes(searchQuery) || tags.includes(searchQuery);

      if (matchesCat && matchesSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (gamesCountEl) {
      gamesCountEl.textContent = visibleCount;
    }
  }

  if (gameCategoryBtns.length > 0) {
    gameCategoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        gameCategoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-category') || 'all';
        filterGames();
      });
    });
  }

  if (gameHubSearchInput) {
    gameHubSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterGames();
    });
  }

  // ==========================================================================
  // GAME PLAYER MODAL INTERACTION
  // ==========================================================================
  const gameModalBackdrop = document.getElementById('gameModalBackdrop');
  const gameModalCloseBtn = document.getElementById('gameModalCloseBtn');
  const modalGameTitle = document.getElementById('modalGameTitle');
  const modalScreenTitle = document.getElementById('modalScreenTitle');
  const modalControlsHelp = document.getElementById('modalControlsHelp');
  const modalExternalBtn = document.getElementById('modalExternalBtn');
  const gameScreenArea = document.querySelector('.game-screen-area');
  const originalScreenPlaceholder = gameScreenArea ? gameScreenArea.innerHTML : '';

  function openGameModal(gameTitle, gameCategory, controls, gameUrl) {
    if (!gameModalBackdrop) return;
    if (modalGameTitle) modalGameTitle.textContent = gameTitle;
    if (modalScreenTitle) modalScreenTitle.textContent = gameTitle;
    if (modalControlsHelp) modalControlsHelp.textContent = controls || 'Mouse / Touch / Keyboard';
    
    if (gameUrl) {
      if (modalExternalBtn) {
        modalExternalBtn.href = gameUrl;
        modalExternalBtn.target = '_blank';
        modalExternalBtn.textContent = 'Open Full Window ↗';
      }
      if (gameScreenArea) {
        gameScreenArea.classList.add('has-iframe');
        gameScreenArea.innerHTML = `<iframe src="${gameUrl}" title="${gameTitle}" allow="autoplay; fullscreen"></iframe>`;
      }
    } else {
      if (modalExternalBtn) {
        modalExternalBtn.href = `#play-${encodeURIComponent(gameTitle.toLowerCase().replace(/\s+/g, '-'))}`;
        modalExternalBtn.removeAttribute('target');
        modalExternalBtn.textContent = 'Full Window Mode ↗';
      }
      if (gameScreenArea) {
        gameScreenArea.classList.remove('has-iframe');
        gameScreenArea.innerHTML = originalScreenPlaceholder;
      }
    }

    gameModalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeGameModal() {
    if (!gameModalBackdrop) return;
    gameModalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    // Stop iframe running (canvas loop / audio) when closing modal
    if (gameScreenArea) {
      gameScreenArea.classList.remove('has-iframe');
      gameScreenArea.innerHTML = originalScreenPlaceholder;
    }
  }

  // Attach click listener to all "Play Now" trigger buttons
  document.addEventListener('click', (e) => {
    const playBtn = e.target.closest('.btn-play-trigger');
    if (playBtn) {
      e.preventDefault();
      const card = playBtn.closest('.game-card');
      const title = card?.querySelector('.game-title')?.textContent || 'Web Game';
      const cat = card?.getAttribute('data-category') || 'Arcade';
      const controls = card?.getAttribute('data-controls') || 'Mouse / Touch Controls';
      const gameUrl = card?.getAttribute('data-game-url') || playBtn.getAttribute('data-game-url') || '';
      openGameModal(title, cat, controls, gameUrl);
    }
  });

  gameModalCloseBtn?.addEventListener('click', closeGameModal);

  gameModalBackdrop?.addEventListener('click', (e) => {
    if (e.target === gameModalBackdrop) {
      closeGameModal();
    }
  });

  // ==========================================================================
  // UTILITY TOOLS HUB: CATEGORY FILTERING & SEARCH
  // ==========================================================================
  const toolCategoryBtns = document.querySelectorAll('.tool-filter-btn');
  const toolsGrid = document.getElementById('toolsGrid');
  const toolHubSearchInput = document.getElementById('toolHubSearchInput');
  const toolsCountEl = document.getElementById('visibleToolsCount');

  let activeToolCategory = 'all';
  let toolSearchQuery = '';

  function filterTools() {
    if (!toolsGrid) return;
    const cards = toolsGrid.querySelectorAll('.tool-card');
    let visibleCount = 0;

    cards.forEach(card => {
      const category = card.getAttribute('data-category') || '';
      const title = card.querySelector('.tool-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.tool-desc')?.textContent.toLowerCase() || '';
      const tags = card.querySelector('.tool-card-tags')?.textContent.toLowerCase() || '';

      const matchesCat = (activeToolCategory === 'all') || (category === activeToolCategory);
      const matchesSearch = !toolSearchQuery || title.includes(toolSearchQuery) || desc.includes(toolSearchQuery) || tags.includes(toolSearchQuery);

      if (matchesCat && matchesSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (toolsCountEl) {
      toolsCountEl.textContent = visibleCount;
    }
  }

  if (toolCategoryBtns.length > 0) {
    toolCategoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toolCategoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeToolCategory = btn.getAttribute('data-category') || 'all';
        filterTools();
      });
    });
  }

  if (toolHubSearchInput) {
    toolHubSearchInput.addEventListener('input', (e) => {
      toolSearchQuery = e.target.value.toLowerCase().trim();
      filterTools();
    });
  }

  // ==========================================================================
  // TOOL LAUNCHER MODAL INTERACTION
  // ==========================================================================
  const toolModalBackdrop = document.getElementById('toolModalBackdrop');
  const toolModalCloseBtn = document.getElementById('toolModalCloseBtn');
  const modalToolTitle = document.getElementById('modalToolTitle');
  const modalWorkspaceTitle = document.getElementById('modalWorkspaceTitle');
  const modalToolDesc = document.getElementById('modalToolDesc');
  const modalToolTag = document.getElementById('modalToolTag');

  function openToolModal(toolTitle, toolCategory, toolDesc) {
    if (!toolModalBackdrop) return;
    if (modalToolTitle) modalToolTitle.textContent = toolTitle;
    if (modalWorkspaceTitle) modalWorkspaceTitle.textContent = toolTitle;
    if (modalToolDesc) modalToolDesc.textContent = toolDesc;
    if (modalToolTag) modalToolTag.textContent = toolCategory.toUpperCase();

    toolModalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeToolModal() {
    if (!toolModalBackdrop) return;
    toolModalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    const toolBtn = e.target.closest('.btn-tool-trigger');
    if (toolBtn) {
      e.preventDefault();
      const card = toolBtn.closest('.tool-card');
      const title = card?.querySelector('.tool-title')?.textContent || 'Utility Tool';
      const cat = card?.getAttribute('data-category') || 'Utility';
      const desc = card?.querySelector('.tool-desc')?.textContent || 'Fast and secure browser utility.';
      openToolModal(title, cat, desc);
    }
  });

  toolModalCloseBtn?.addEventListener('click', closeToolModal);

  toolModalBackdrop?.addEventListener('click', (e) => {
    if (e.target === toolModalBackdrop) {
      closeToolModal();
    }
  });

  // ==========================================================================
  // FAQ ACCORDION INTERACTION (About page)
  // ==========================================================================
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item?.classList.contains('active');

      // Optionally close other items
      document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));

      if (!isOpen && item) {
        item.classList.add('active');
      }
    });
  });

  // ==========================================================================
  // PWA INSTALLATION CONTROLLER (Pin to Taskbar / Desktop & Add to Home Screen)
  // ==========================================================================
  let deferredInstallPrompt = null;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

  // Dynamic relative asset helper (root vs subfolders)
  function getRelativeRoot() {
    const p = window.location.pathname;
    if (p.includes('/tools/') || p.includes('/games/') || p.includes('/explorer/')) {
      return '../../';
    }
    return './';
  }

  // Toast Helper
  function showGamilityToast(msg, duration = 4000) {
    let container = document.getElementById('gamilityToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'gamilityToastContainer';
      container.className = 'gamility-toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'gamility-toast';
    toast.innerHTML = `<span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 350);
    }, duration);
  }

  // iOS Safari Guide Modal
  function createOrGetIosModal() {
    let modal = document.getElementById('gamilityIosModal');
    if (!modal) {
      const rootPath = getRelativeRoot();
      modal = document.createElement('div');
      modal.id = 'gamilityIosModal';
      modal.className = 'gamility-ios-modal-backdrop';
      modal.innerHTML = `
        <div class="gamility-ios-sheet">
          <div class="ios-sheet-header">
            <div class="ios-sheet-icon">
              <img src="${rootPath}assets/images/icon-192.png" alt="Gamility Icon">
            </div>
            <h3 class="ios-sheet-title">Add Gamility to Home Screen</h3>
            <p class="ios-sheet-subtitle">Get the app experience with instant 1-tap access</p>
          </div>
          <div class="ios-steps-list">
            <div class="ios-step-item">
              <div class="ios-step-num">1</div>
              <div class="ios-step-text">Tap the <span class="ios-step-badge">Share ⎋</span> button in Safari's bottom bar.</div>
            </div>
            <div class="ios-step-item">
              <div class="ios-step-num">2</div>
              <div class="ios-step-text">Scroll down and tap <span class="ios-step-badge">➕ Add to Home Screen</span>.</div>
            </div>
            <div class="ios-step-item">
              <div class="ios-step-num">3</div>
              <div class="ios-step-text">Tap <span class="ios-step-badge">Add</span> in the top right corner to finish!</div>
            </div>
          </div>
          <button type="button" class="btn-ios-done" id="gamilityIosDoneBtn">Got It!</button>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.id === 'gamilityIosDoneBtn') {
          modal.classList.remove('open');
        }
      });
    }
    return modal;
  }

  // Trigger Install Flow
  async function triggerInstallFlow() {
    if (deferredInstallPrompt) {
      try {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          showGamilityToast('🎉 Gamility installed! Pin to taskbar or desktop for instant access.');
        }
        deferredInstallPrompt = null;
        hideInstallPrompts();
      } catch (err) {
        console.warn('Install error:', err);
      }
    } else if (isIOS) {
      const modal = createOrGetIosModal();
      modal.classList.add('open');
    } else {
      // Fallback for browsers without beforeinstallprompt or desktop manual
      showGamilityToast('💡 Tip: Use your browser menu (⋮ or ⋯) to "Install Gamility" or "Add to Desktop".', 5000);
    }
  }

  // Update Buttons & Pill
  function showInstallPrompts() {
    if (isStandalone) return;

    const labelText = isMobile ? 'Add to Home' : 'Pin to Taskbar';
    const iconText = isMobile ? '📲' : '📌';
    const descText = isMobile ? 'Add to your phone home screen for 1-tap play' : 'Pin to Windows Taskbar or Desktop for 1-click access';

    // 1. Header Install Button
    let headerBtn = document.getElementById('pwaInstallHeaderBtn');
    if (!headerBtn) {
      const headerActions = document.querySelector('.header-actions');
      if (headerActions) {
        headerBtn = document.createElement('button');
        headerBtn.id = 'pwaInstallHeaderBtn';
        headerBtn.className = 'btn-install-header';
        headerBtn.setAttribute('title', isMobile ? 'Add to Home Screen' : 'Pin to Taskbar or Desktop');
        headerBtn.innerHTML = `<span class="install-btn-icon">${iconText}</span><span class="install-btn-label">${labelText}</span>`;
        // Insert before explore button or mobile toggle
        headerActions.insertBefore(headerBtn, headerActions.firstChild);
      }
    }
    if (headerBtn) {
      headerBtn.style.display = 'inline-flex';
      const labelEl = headerBtn.querySelector('.install-btn-label');
      if (labelEl) labelEl.textContent = labelText;
      headerBtn.onclick = triggerInstallFlow;
    }

    // 2. Mobile Drawer Install Button
    let drawerBtn = document.getElementById('pwaInstallDrawerBtn');
    if (!drawerBtn) {
      const drawerFooter = document.querySelector('.drawer-footer');
      if (drawerFooter) {
        drawerBtn = document.createElement('button');
        drawerBtn.id = 'pwaInstallDrawerBtn';
        drawerBtn.className = 'btn-install-drawer';
        drawerBtn.style.width = '100%';
        drawerBtn.style.marginBottom = '0.75rem';
        drawerBtn.innerHTML = `<span class="install-btn-icon">${iconText}</span><span class="install-btn-label">${labelText}</span>`;
        drawerFooter.insertBefore(drawerBtn, drawerFooter.firstChild);
      }
    }
    if (drawerBtn) {
      drawerBtn.style.display = 'inline-flex';
      const drawerLabelEl = drawerBtn.querySelector('.install-btn-label');
      if (drawerLabelEl) drawerLabelEl.textContent = labelText;
      drawerBtn.onclick = () => {
        if (typeof closeDrawer === 'function') closeDrawer();
        triggerInstallFlow();
      };
    }

    // 3. Floating Install Pill (if not dismissed within 7 days)
    const dismissedTime = localStorage.getItem('gamility_install_dismissed');
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (!dismissedTime || (now - parseInt(dismissedTime, 10)) > sevenDays) {
      let pill = document.getElementById('gamilityInstallPill');
      if (!pill) {
        const rootPath = getRelativeRoot();
        pill = document.createElement('div');
        pill.id = 'gamilityInstallPill';
        pill.className = 'gamility-install-pill';
        pill.innerHTML = `
          <div class="install-pill-icon-wrap">
            <img src="${rootPath}assets/images/icon-192.png" alt="Gamility Logo">
          </div>
          <div class="install-pill-content">
            <div class="install-pill-title">Gamility App <span>⚡</span></div>
            <div class="install-pill-desc">${descText}</div>
          </div>
          <div class="install-pill-actions">
            <button type="button" class="btn-pill-install" id="gamilityPillInstallBtn">Install</button>
            <button type="button" class="btn-pill-close" id="gamilityPillCloseBtn" title="Dismiss">✕</button>
          </div>
        `;
        document.body.appendChild(pill);

        document.getElementById('gamilityPillInstallBtn')?.addEventListener('click', triggerInstallFlow);
        document.getElementById('gamilityPillCloseBtn')?.addEventListener('click', () => {
          localStorage.setItem('gamility_install_dismissed', Date.now().toString());
          pill.classList.add('hiding');
          setTimeout(() => pill.remove(), 350);
        });
      }
    }
  }

  function hideInstallPrompts() {
    const headerBtn = document.getElementById('pwaInstallHeaderBtn');
    if (headerBtn) headerBtn.style.display = 'none';

    const drawerBtn = document.getElementById('pwaInstallDrawerBtn');
    if (drawerBtn) drawerBtn.style.display = 'none';

    const pill = document.getElementById('gamilityInstallPill');
    if (pill) {
      pill.classList.add('hiding');
      setTimeout(() => pill.remove(), 350);
    }
  }

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    showInstallPrompts();
  });

  // Listen for appinstalled event
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    hideInstallPrompts();
    showGamilityToast('🎉 Welcome to Gamility! Pin it to your taskbar or home screen for quick access.');
  });

  // Show prompts on iOS if uninstalled
  if (isIOS && !isStandalone) {
    showInstallPrompts();
  }

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${getRelativeRoot()}sw.js`;
      navigator.serviceWorker.register(swUrl)
        .then(reg => {
          reg.addEventListener('updatefound', () => {
            const installing = reg.installing;
            if (installing) {
              installing.addEventListener('statechange', () => {
                if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                  // SW installed and active
                }
              });
            }
          });
        })
        .catch(err => {
          // Silently handle if unsupported protocol
        });
    });
  }
});


