/* ============================================
   FUNN — Main JavaScript
   Scroll animations, nav behavior, form
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- NAV SCROLL BEHAVIOR ---
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  const handleScroll = () => {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
    lastScroll = scrollY;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // --- MOBILE NAV TOGGLE ---
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('nav__links--open');
    navToggle.classList.toggle('nav__toggle--active');
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('nav__links--open');
      navToggle.classList.remove('nav__toggle--active');
    });
  });

  // --- SCROLL REVEAL ANIMATIONS ---
  const revealElements = () => {
    // Single elements
    const singles = document.querySelectorAll('.section__header, .pipeline__step, .cta-block, .contact-info, .contact-form, .testimonial');
    singles.forEach(el => {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
      }
    });

    // Staggered groups
    const groups = document.querySelectorAll('.services-grid, .metrics-grid, .hero__stats');
    groups.forEach(el => {
      if (!el.classList.contains('reveal-stagger')) {
        el.classList.add('reveal-stagger');
      }
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

  // --- HERO ANIMATION (fade in on load) ---
  const heroContent = document.querySelector('.hero__content');
  const heroStats = document.querySelector('.hero__stats');

  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(30px)';
    heroContent.style.transition = 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
      });
    });
  }

  if (heroStats) {
    heroStats.style.opacity = '0';
    heroStats.style.transform = 'translateY(20px)';
    heroStats.style.transition = 'opacity 0.8s ease 0.6s, transform 0.8s ease 0.6s';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        heroStats.style.opacity = '1';
        heroStats.style.transform = 'translateY(0)';
      });
    });
  }

  // --- SMOOTH SCROLL FOR ANCHOR LINKS ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
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

  // --- CONTACT FORM ---
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';

      // Simulate submission (replace with actual endpoint)
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

  // --- COUNTER ANIMATION FOR METRICS ---
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
          
          // Extract numeric value
          let numStr = finalText.replace(/[^0-9.]/g, '');
          const targetNum = parseFloat(numStr);
          
          if (isNaN(targetNum)) return;
          
          const duration = 1200;
          const startTime = performance.now();
          const isDecimal = numStr.includes('.');
          
          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Easing
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * targetNum;
            
            let display = isDecimal ? current.toFixed(1) : Math.floor(current).toString();
            if (hasPlus) display = '+' + display;
            if (hasMinus) display = '-' + display;
            if (hasPercent) display += '%';
            if (hasX) display += 'x';
            
            // Handle special cases like "24/7" or "45+"
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
