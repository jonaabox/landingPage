/**
 * Estudio Jurídico Cristal Samaniego — Main JavaScript
 * Features: Navbar scroll, mobile menu, smooth scroll, counter animation,
 *           scroll reveal, contact form validation, chat widget, back-to-top.
 */

'use strict';

/* ──────────────────────────────────────────────────────────
   UTILITY: DOM helpers
────────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ──────────────────────────────────────────────────────────
   1. NAVBAR — Scroll behaviour + active link
────────────────────────────────────────────────────────── */
function initNavbar() {
  const header   = $('.site-header');
  const navLinks = $$('.nav-link');
  const sections = $$('main section[id]');

  // Sticky scroll style
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);

    // Highlight active section link
    const scrollMid = window.scrollY + window.innerHeight / 2;
    sections.forEach(section => {
      const link = navLinks.find(l => l.getAttribute('href') === `#${section.id}`);
      if (!link) return;
      const { top, bottom } = section.getBoundingClientRect();
      const absTop    = top + window.scrollY;
      const absBottom = bottom + window.scrollY;
      link.classList.toggle('active', scrollMid >= absTop && scrollMid < absBottom);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ──────────────────────────────────────────────────────────
   2. MOBILE MENU
────────────────────────────────────────────────────────── */
function initMobileMenu() {
  const toggle     = $('#\\30 ') || $('.nav-toggle');  // fallback
  const btn        = $('[aria-controls="mobile-menu"]');
  const mobileMenu = $('#mobile-menu');
  const mobileLinks = $$('.mobile-nav-link, .btn-mobile-cta');

  if (!btn || !mobileMenu) return;

  const openMenu = () => {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Close on link click
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on outside click
  document.addEventListener('click', e => {
    if (mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !btn.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
  });
}

/* ──────────────────────────────────────────────────────────
   3. SMOOTH SCROLL (for older browsers — CSS handles modern ones)
────────────────────────────────────────────────────────── */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = $(targetId);
      if (!target) return;
      e.preventDefault();
      const navbarHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'),
        10
      ) || 72;
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });
}

/* ──────────────────────────────────────────────────────────
   4. COUNTER ANIMATION (Hero Stats)
────────────────────────────────────────────────────────── */
function animateCounter(el, target, duration = 2000) {
  const start     = performance.now();
  const startVal  = 0;

  const update = (time) => {
    const elapsed  = time - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(startVal + (target - startVal) * eased);
    if (progress < 1) requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
}

function initCounters() {
  const counters = $$('[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      animateCounter(el, target);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ──────────────────────────────────────────────────────────
   5. SCROLL REVEAL
────────────────────────────────────────────────────────── */
function initScrollReveal() {
  // Add .reveal to key elements programmatically
  const targets = [
    { sel: '.service-card',       delayBase: 0, step: 1 },
    { sel: '.testimonial-card',   delayBase: 0, step: 1 },
    { sel: '.contact-item',       delayBase: 0, step: 1 },
    { sel: '.value-item',         delayBase: 0, step: 1 },
    { sel: '.section-header',     delayBase: 0, step: 0 },
    { sel: '.about-visual',       delayBase: 0, step: 0 },
    { sel: '.about-content',      delayBase: 0, step: 0 },
  ];

  targets.forEach(({ sel, step }) => {
    $$(sel).forEach((el, i) => {
      el.classList.add('reveal');
      if (step > 0 && i < 6) {
        el.classList.add(`reveal-delay-${(i % 5) + 1}`);
      }
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────────────────────
   6. CONTACT FORM VALIDATION
────────────────────────────────────────────────────────── */
function initContactForm() {
  const form      = $('#contactForm');
  if (!form) return;

  const submitBtn = $('#submitBtn');
  const success   = $('#formSuccess');

  // Validation rules
  const rules = {
    firstName : { required: true, min: 2,   label: 'El nombre debe tener al menos 2 caracteres.' },
    lastName  : { required: true, min: 2,   label: 'El apellido debe tener al menos 2 caracteres.' },
    email     : { required: true, email: true, label: 'Ingrese un correo electrónico válido.' },
    area      : { required: true,            label: 'Por favor seleccione un área legal.' },
    message   : { required: true, min: 20,  label: 'Describa su caso (mínimo 20 caracteres).' },
    privacy   : { checkbox: true,            label: 'Debe aceptar la política de privacidad.' },
  };

  const showError = (field, msg) => {
    const input = form.elements[field];
    const error = $(`#${field}Error`);
    if (input) input.classList.add('error');
    if (error) error.textContent = msg;
  };

  const clearError = (field) => {
    const input = form.elements[field];
    const error = $(`#${field}Error`);
    if (input) { input.classList.remove('error'); input.classList.add('valid'); }
    if (error) error.textContent = '';
  };

  const validateField = (field, value) => {
    const rule = rules[field];
    if (!rule) return true;

    if (rule.checkbox) {
      const checked = form.elements[field]?.checked;
      if (!checked) { showError(field, rule.label); return false; }
      clearError(field); return true;
    }
    if (rule.required && !value.trim()) {
      showError(field, `Este campo es obligatorio.`); return false;
    }
    if (rule.min && value.trim().length < rule.min) {
      showError(field, rule.label); return false;
    }
    if (rule.email) {
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(value.trim())) { showError(field, rule.label); return false; }
    }
    clearError(field);
    return true;
  };

  // Live validation on blur
  Object.keys(rules).forEach(field => {
    const input = form.elements[field];
    if (!input) return;
    const event = input.type === 'checkbox' ? 'change' : 'blur';
    input.addEventListener(event, () => {
      validateField(field, input.type === 'checkbox' ? '' : input.value);
    });
    // Clear error on input
    if (input.type !== 'checkbox') {
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          validateField(field, input.value);
        }
      });
    }
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    Object.keys(rules).forEach(field => {
      const input = form.elements[field];
      if (!input) return;
      const value = input.type === 'checkbox' ? '' : input.value;
      if (!validateField(field, value)) isValid = false;
    });

    if (!isValid) {
      // Focus first error
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    // Simulate async submission
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    submitBtn.disabled = true;
    btnText.style.display    = 'none';
    btnLoading.style.display = 'inline';

    await new Promise(r => setTimeout(r, 1500)); // Simulated delay

    // Show success
    form.reset();
    $$('.form-input').forEach(inp => inp.classList.remove('valid', 'error'));
    success.style.display = 'flex';
    submitBtn.disabled = false;
    btnText.style.display    = 'inline';
    btnLoading.style.display = 'none';

    // Scroll success into view
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto-hide after 6s
    setTimeout(() => { success.style.display = 'none'; }, 6000);
  });
}

/* ──────────────────────────────────────────────────────────
   7. CHAT WIDGET
────────────────────────────────────────────────────────── */
function initChat() {
  const toggle      = $('#chatToggle');
  const panel       = $('#chatPanel');
  const chatForm    = $('#chatForm');
  const chatInput   = $('#chatInput');
  const chatBody    = $('#chatBody');
  const suggestions = $$('.chat-suggestion');

  if (!toggle || !panel) return;

  const openIcon  = toggle.querySelector('.chat-icon--open');
  const closeIcon = toggle.querySelector('.chat-icon--close');
  const label     = toggle.querySelector('.chat-label');

  let isOpen = false;

  // Auto-responses (simulated)
  const autoResponses = {
    'derecho civil':       'Entendemos. Los casos civiles requieren análisis detallado de documentación. ¿Podría contarnos más sobre su situación? O si prefiere, complete el formulario de contacto para una consulta formal.',
    'derecho corporativo': 'El derecho corporativo es una de nuestras áreas principales. Desde constitución de sociedades hasta contratos complejos. ¿Qué tipo de asesoría necesita?',
    'litigios':            'Los litigios complejos requieren una estrategia sólida desde el inicio. Cuéntenos brevemente los hechos y le daremos una primera orientación.',
    'default':             '¡Gracias por su mensaje! Un miembro del estudio se comunicará con usted en breve. Para una atención más rápida, complete el formulario de contacto.',
  };

  const appendMessage = (text, type = 'received') => {
    const msg = document.createElement('div');
    msg.className = `chat-message chat-message--${type}`;
    const time = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    msg.innerHTML = `<p>${text}</p><time class="chat-time" datetime="${new Date().toISOString()}">${time}</time>`;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  const getAutoResponse = (msg) => {
    const lower = msg.toLowerCase();
    for (const [key, response] of Object.entries(autoResponses)) {
      if (key !== 'default' && lower.includes(key)) return response;
    }
    return autoResponses.default;
  };

  const openPanel = () => {
    isOpen = true;
    panel.classList.add('open');
    panel.removeAttribute('aria-hidden');
    toggle.setAttribute('aria-expanded', 'true');
    openIcon.style.display  = 'none';
    closeIcon.style.display = 'block';
    if (label) label.textContent = 'Cerrar';
    setTimeout(() => chatInput?.focus(), 100);
  };

  const closePanel = () => {
    isOpen = false;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    openIcon.style.display  = 'block';
    closeIcon.style.display = 'none';
    if (label) label.textContent = '¿Consulta rápida?';
  };

  toggle.addEventListener('click', () => isOpen ? closePanel() : openPanel());

  // Suggestion buttons
  suggestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const message = btn.dataset.message;
      appendMessage(message, 'sent');
      btn.parentElement.style.display = 'none'; // hide suggestions after use
      setTimeout(() => {
        appendMessage(getAutoResponse(message), 'received');
      }, 800);
    });
  });

  // Chat form submit
  chatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    appendMessage(text, 'sent');
    chatInput.value = '';
    // Hide suggestions after first message
    const sugg = $('.chat-suggestions');
    if (sugg) sugg.style.display = 'none';
    setTimeout(() => {
      appendMessage(getAutoResponse(text), 'received');
    }, 1000);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });
}

/* ──────────────────────────────────────────────────────────
   8. BACK TO TOP BUTTON
────────────────────────────────────────────────────────── */
function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  const onScroll = () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ──────────────────────────────────────────────────────────
   9. CURRENT YEAR (Footer copyright)
────────────────────────────────────────────────────────── */
function initYear() {
  const el = $('#currentYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ──────────────────────────────────────────────────────────
   10. INITIALISE ALL
────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initCounters();
  initScrollReveal();
  initContactForm();
  initChat();
  initBackToTop();
  initYear();
});
