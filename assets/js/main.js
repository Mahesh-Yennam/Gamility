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
});


