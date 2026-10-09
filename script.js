/* ============================================================
   StockAR · M-Code Systems
   script.js — animaciones e interacciones
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 1. NAVBAR STICKY + DETECCIÓN DE DIRECCIÓN ---------- */
  const navbar = document.getElementById('navbar');
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateNavbar() {
    const currentScrollY = window.scrollY;

    // Fondo con blur al scrollear
    if (currentScrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Ocultar al bajar, mostrar al subir (solo si pasó el hero)
    if (currentScrollY > 300) {
      if (currentScrollY > lastScrollY && !navbar.classList.contains('hide')) {
        navbar.classList.add('hide');
      } else if (currentScrollY < lastScrollY) {
        navbar.classList.remove('hide');
      }
    } else {
      navbar.classList.remove('hide');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  /* ---------- 2. SCROLL REVEAL (IntersectionObserver) ---------- */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: mostrar todo si no hay IntersectionObserver
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ---------- 3. SMOOTH SCROLL PARA LINKS INTERNOS ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = navbar.offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Cerrar menú mobile si está abierto
      closeMobileMenu();
    });
  });

  /* ---------- 4. MENÚ MOBILE ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const mobilePanel = document.getElementById('mobilePanel');
  const mobileOverlay = document.getElementById('mobileOverlay');

  function openMobileMenu() {
    mobilePanel.classList.add('open');
    mobileOverlay.classList.add('open');
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    mobilePanel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobilePanel.classList.remove('open');
    mobileOverlay.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobilePanel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      if (mobilePanel.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }

  // Cerrar con Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobilePanel.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  /* ---------- 5. ACORDEÓN FAQ (uno solo abierto) ---------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    const button = item.querySelector('.faq-pregunta');
    const respuesta = item.querySelector('.faq-respuesta');

    button.addEventListener('click', function () {
      const isOpen = item.classList.contains('open');

      // Cerrar todos
      faqItems.forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.faq-pregunta').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-respuesta').style.maxHeight = null;
      });

      // Si estaba cerrado, abrirlo
      if (!isOpen) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
        respuesta.style.maxHeight = respuesta.scrollHeight + 'px';
      }
    });
  });

  // Recalcular altura al redimensionar (por si cambia el ancho)
  let resizeTimeout;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      const openItem = document.querySelector('.faq-item.open .faq-respuesta');
      if (openItem) {
        openItem.style.maxHeight = openItem.scrollHeight + 'px';
      }
    }, 150);
  });

  /* ---------- 6. PARALLAX SUTIL EN EL HERO MOCKUP ---------- */
  const heroMockup = document.getElementById('heroMockup');
  const heroFrame = heroMockup ? heroMockup.querySelector('.mockup-frame') : null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroMockup && heroFrame && !prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let rafId = null;

    function animateParallax() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      heroFrame.style.transform = 'translate(' + currentX.toFixed(2) + 'px, ' + currentY.toFixed(2) + 'px)';

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        rafId = requestAnimationFrame(animateParallax);
      } else {
        rafId = null;
      }
    }

    heroMockup.addEventListener('mousemove', function (e) {
      const rect = heroMockup.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Máximo 3px de desplazamiento
      targetX = ((e.clientX - centerX) / rect.width) * 6;
      targetY = ((e.clientY - centerY) / rect.height) * 6;

      targetX = Math.max(-3, Math.min(3, targetX));
      targetY = Math.max(-3, Math.min(3, targetY));

      if (!rafId) {
        rafId = requestAnimationFrame(animateParallax);
      }
    });

    heroMockup.addEventListener('mouseleave', function () {
      targetX = 0;
      targetY = 0;
      if (!rafId) {
        rafId = requestAnimationFrame(animateParallax);
      }
    });
  }

  /* ---------- 7. CURSOR CUSTOM ---------- */
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (cursorDot && cursorRing && canHover && !prefersReducedMotion) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let cursorRaf = null;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursorDot.style.transform = 'translate(' + mouseX + 'px, ' + mouseY + 'px) translate(-50%, -50%)';

      if (!cursorRaf) {
        cursorRaf = requestAnimationFrame(animateCursor);
      }
    });

    function animateCursor() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.transform = 'translate(' + ringX + 'px, ' + ringY + 'px) translate(-50%, -50%)';

      if (Math.abs(mouseX - ringX) > 0.1 || Math.abs(mouseY - ringY) > 0.1) {
        cursorRaf = requestAnimationFrame(animateCursor);
      } else {
        cursorRaf = null;
      }
    }

    // Agrandar al pasar por elementos interactivos
    const interactiveSelectors = 'a, button, .btn, .funcion-card, .precio-card, .faq-pregunta, .cliente-logo';
    document.querySelectorAll(interactiveSelectors).forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursorRing.classList.add('hover');
      });
      el.addEventListener('mouseleave', function () {
        cursorRing.classList.remove('hover');
      });
    });

    // Ocultar al salir de la ventana
    document.addEventListener('mouseleave', function () {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    });
  } else if (cursorDot && cursorRing) {
    cursorDot.style.display = 'none';
    cursorRing.style.display = 'none';
  }

  /* ---------- 8. DUPLICAR LOGOS DEL MARQUEE PARA LOOP INFINITO ---------- */
  const marqueeTrack = document.getElementById('marqueeTrack');
  if (marqueeTrack) {
    // Duplicamos el contenido para que el loop sea continuo
    const originalContent = marqueeTrack.innerHTML;
    marqueeTrack.innerHTML = originalContent + originalContent;
  }

  /* ---------- 9. AÑO DINÁMICO EN EL FOOTER (opcional) ---------- */
  const yearSpans = document.querySelectorAll('[data-year]');
  yearSpans.forEach(function (span) {
    span.textContent = new Date().getFullYear();
  });

})();