/* ============================================
   FUNN — Main JavaScript
   Parallax, horizontal scroll, animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- UTILITY: check if mobile / reduced motion ---
  const isMobile = () => window.innerWidth <= 1024;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- NAV SCROLL BEHAVIOR ---
  const nav = document.getElementById('nav');

  // --- MOBILE NAV TOGGLE ---
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('nav__links--open');
    navToggle.classList.toggle('nav__toggle--active');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('nav__links--open');
      navToggle.classList.remove('nav__toggle--active');
    });
  });

  // =========================================================
  //  HERO — LINE-BY-LINE TEXT REVEAL
  // =========================================================
  const heroTitleLines = document.querySelectorAll('.hero__title-line');
  const heroContent = document.querySelector('.hero__content');
  const heroStats = document.querySelector('.hero__stats');
  const heroLabel = document.querySelector('.hero__label');
  const heroSub = document.querySelector('.hero__sub');
  const heroActions = document.querySelector('.hero__actions');

  // Set initial hidden states
  const fadeTargets = [heroLabel, heroSub, heroActions, heroStats].filter(Boolean);
  fadeTargets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'none';
  });

  heroTitleLines.forEach(line => {
    line.style.clipPath = 'inset(0 0 100% 0)';
    line.style.transform = 'translateY(40px)';
    line.style.transition = 'none';
  });

  // Animate in sequence after a brief delay
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // 1) Title lines reveal with stagger
      heroTitleLines.forEach((line, i) => {
        line.style.transition = `clip-path 0.7s cubic-bezier(0.65,0,0.35,1) ${i * 0.12 + 0.15}s, transform 0.7s cubic-bezier(0.65,0,0.35,1) ${i * 0.12 + 0.15}s`;
        line.style.clipPath = 'inset(0 0 0% 0)';
        line.style.transform = 'translateY(0)';
      });

      // 2) Label, subtitle, actions fade in after title
      const baseDelay = heroTitleLines.length * 0.12 + 0.3;
      [heroLabel, heroSub, heroActions].filter(Boolean).forEach((el, i) => {
        const d = baseDelay + i * 0.12;
        el.style.transition = `opacity 0.6s ease ${d}s, transform 0.6s ease ${d}s`;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });

      // 3) Stats fade
      if (heroStats) {
        const statsDelay = baseDelay + 0.5;
        heroStats.style.transition = `opacity 0.7s ease ${statsDelay}s, transform 0.7s ease ${statsDelay}s`;
        heroStats.style.opacity = '1';
        heroStats.style.transform = 'translateY(0)';
      }
    });
  });

  // =========================================================
  //  HERO — PARALLAX ON SCROLL
  // =========================================================
  const parallaxBg = document.querySelector('.hero__parallax-bg');
  const parallaxEls = document.querySelectorAll('[data-parallax-speed]');
  const hero = document.getElementById('hero');
  let heroReady = false;

  // Allow parallax only after intro animation completes
  setTimeout(() => { heroReady = true; }, 1500);

  const updateParallax = () => {
    if (!heroReady || isMobile() || prefersReducedMotion) return;
    const scrollY = window.scrollY;
    const heroH = hero ? hero.offsetHeight : 900;

    // Only apply while hero is in view
    if (scrollY > heroH + 200) return;

    parallaxEls.forEach(el => {
      if (el === parallaxBg) return; // handled separately
      const speed = parseFloat(el.dataset.parallaxSpeed) || 0;
      const yOffset = -(scrollY * speed);
      el.style.transform = `translate3d(0, ${yOffset}px, 0)`;
    });

    // BG orb moves slower + slight scale pulse
    if (parallaxBg) {
      const bgSpeed = parseFloat(parallaxBg.dataset.parallaxSpeed) || 0.15;
      const bgY = -(scrollY * bgSpeed);
      const scale = 1 + scrollY * 0.0003;
      parallaxBg.style.transform = `translate3d(0, ${bgY}px, 0) scale(${scale})`;
    }
  };

  // =========================================================
  //  HORIZONTAL SCROLL — SERVICIOS
  // =========================================================
  const hscroll = document.querySelector('.hscroll');
  const hscrollSticky = document.querySelector('.hscroll__sticky');
  const hscrollTrack = document.querySelector('.hscroll__track');

  const updateHorizontalScroll = () => {
    if (!hscroll || !hscrollTrack || !hscrollSticky || isMobile()) return;

    const rect = hscroll.getBoundingClientRect();
    const scrollHeight = hscroll.offsetHeight - window.innerHeight;

    // How far we've scrolled through the hscroll section (0 → 1)
    const rawProgress = -rect.top / scrollHeight;
    const progress = Math.max(0, Math.min(1, rawProgress));

    // Total track width minus one viewport width = max translate distance
    const trackWidth = hscrollTrack.scrollWidth;
    const viewportWidth = window.innerWidth;
    const maxTranslate = trackWidth - viewportWidth + 96; // 96 = padding

    const translateX = -(progress * maxTranslate);
    hscrollTrack.style.transform = `translate3d(${translateX}px, 0, 0)`;

    // Update progress bar (::before pseudo-element width via CSS custom property)
    const barMaxWidth = viewportWidth - 96; // match left/right padding
    hscrollSticky.style.setProperty('--hscroll-progress', `${progress * barMaxWidth}px`);
  };

  // =========================================================
  //  UNIFIED SCROLL HANDLER (rAF throttled)
  // =========================================================
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;

      // Nav
      if (scrollY > 60) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }

      // Parallax
      updateParallax();

      // Horizontal scroll
      updateHorizontalScroll();

      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    // Recalc on resize
    updateHorizontalScroll();
  });

  // =========================================================
  //  SCROLL REVEAL ANIMATIONS
  // =========================================================
  const revealElements = () => {
    const singles = document.querySelectorAll('.section__header, .pipeline__step, .cta-block, .contact-info, .contact-form, .testimonial');
    singles.forEach(el => {
      if (!el.classList.contains('reveal')) el.classList.add('reveal');
    });

    const groups = document.querySelectorAll('.metrics-grid, .hero__stats');
    groups.forEach(el => {
      if (!el.classList.contains('reveal-stagger')) el.classList.add('reveal-stagger');
    });
  };

  revealElements();

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains('reveal')) {
          entry.target.classList.add('reveal--visible');
        }
        if (entry.target.classList.contains('reveal-stagger')) {
          entry.target.classList.add('reveal-stagger--visible');
        }
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
    revealObserver.observe(el);
  });

  // =========================================================
  //  SMOOTH SCROLL FOR ANCHOR LINKS
  // =========================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const navHeight = nav.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // =========================================================
  //  CONTACT FORM
  // =========================================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';

      setTimeout(() => {
        submitBtn.textContent = '✓ Consulta enviada';
        submitBtn.style.background = '#16a34a';
        submitBtn.style.opacity = '1';

        setTimeout(() => {
          contactForm.reset();
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = '';
        }, 3000);
      }, 1500);
    });
  }

  // =========================================================
  //  COUNTER ANIMATION FOR METRICS
  // =========================================================
  const animateCounters = () => {
    const counters = document.querySelectorAll('.metric-card__value, .stat__number');

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          const finalText = entry.target.textContent;
          const hasPlus = finalText.startsWith('+');
          const hasMinus = finalText.startsWith('-');
          const hasPercent = finalText.includes('%');
          const hasX = finalText.includes('x');

          let numStr = finalText.replace(/[^0-9.]/g, '');
          const targetNum = parseFloat(numStr);
          if (isNaN(targetNum)) return;

          const duration = 1200;
          const startTime = performance.now();
          const isDecimal = numStr.includes('.');

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * targetNum;

            let display = isDecimal ? current.toFixed(1) : Math.floor(current).toString();
            if (hasPlus) display = '+' + display;
            if (hasMinus) display = '-' + display;
            if (hasPercent) display += '%';
            if (hasX) display += 'x';

            if (finalText.includes('/')) {
              entry.target.textContent = finalText;
              return;
            }

            entry.target.textContent = display;

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              entry.target.textContent = finalText;
            }
          };

          requestAnimationFrame(animate);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  };

  animateCounters();

});
