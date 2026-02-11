/* ============================================
   FUNN — Clientes Scrollytelling JS
   Scroll-driven animations, reveals, counters
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- UTILITIES ---
    const isMobile = () => window.innerWidth <= 768;

    // --- INTRO ANIMATION ---
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.classList.add('cn-loaded');
        });
    });

    // --- NAV SCROLL ---
    const nav = document.getElementById('cnNav');

    // --- GLOBAL PROGRESS BAR ---
    const progressFill = document.querySelector('.cn-global-progress__fill');

    // --- DOT NAVIGATION ---
    const dots = document.querySelectorAll('.cn-dot');
    const scenes = document.querySelectorAll('.cn-scene');

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const target = document.getElementById(dot.dataset.target);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- MANIFESTO LINE REVEALS ---
    const manifestoLines = document.querySelectorAll('.cn-manifesto__line[data-reveal]');

    // --- COMMON TITLE REVEALS ---
    const commonSpans = document.querySelectorAll('.cn-common__title span[data-reveal]');

    // --- STAT ITEMS ---
    const statItems = document.querySelectorAll('.cn-stat-item[data-reveal]');

    // --- CLIENT BLOCKS ---
    const clientBlocks = document.querySelectorAll('.cn-client-block');

    // =========================================================
    //  INTERSECTION OBSERVERS
    // =========================================================

    // Generic reveal observer
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('cn-visible');
            }
        });
    }, { threshold: 0.3, rootMargin: '0px 0px -80px 0px' });

    // Manifesto lines — staggered
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Stagger based on index
                const siblings = Array.from(entry.target.parentElement.children);
                const idx = siblings.indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('cn-visible');
                }, idx * 200);
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    manifestoLines.forEach(el => staggerObserver.observe(el));
    commonSpans.forEach(el => staggerObserver.observe(el));

    // Stat items — staggered reveal
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const siblings = Array.from(entry.target.parentElement.children);
                const idx = siblings.indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('cn-visible');
                    // Trigger counter animation
                    animateCounter(entry.target);
                }, idx * 150);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    statItems.forEach(el => statsObserver.observe(el));

    // Client blocks — scroll-driven visibility
    const clientObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('cn-in-view');
            } else {
                entry.target.classList.remove('cn-in-view');
            }
        });
    }, { threshold: 0, rootMargin: '-40% 0px -40% 0px' });

    clientBlocks.forEach(el => clientObserver.observe(el));

    // =========================================================
    //  COUNTER ANIMATION
    // =========================================================
    function animateCounter(statItem) {
        const valueEl = statItem.querySelector('[data-count]');
        if (!valueEl || valueEl.dataset.animated) return;
        valueEl.dataset.animated = 'true';

        const finalText = valueEl.textContent;
        const targetNum = parseFloat(finalText.replace(/[^0-9.]/g, ''));
        if (isNaN(targetNum)) return;

        const hasPlus = finalText.startsWith('+');
        const hasMinus = finalText.startsWith('-');
        const isDecimal = finalText.includes('.');
        const duration = 1500;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * targetNum;

            let display = isDecimal ? current.toFixed(1) : Math.floor(current).toString();
            if (hasPlus) display = '+' + display;
            if (hasMinus) display = '-' + display;

            valueEl.textContent = display;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                valueEl.textContent = finalText;
            }
        };

        requestAnimationFrame(animate);
    }

    // =========================================================
    //  SCROLL HANDLER (rAF throttled)
    // =========================================================
    let ticking = false;

    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;

            // Nav background
            if (scrollY > 60) {
                nav.classList.add('cn-nav--scrolled');
            } else {
                nav.classList.remove('cn-nav--scrolled');
            }

            // Global progress bar
            if (progressFill && docHeight > 0) {
                const progress = Math.min(scrollY / docHeight, 1);
                progressFill.style.width = `${progress * 100}%`;
            }

            // Update active dot
            updateActiveDot();

            // Hide scroll hint when scrolled
            const scrollHint = document.querySelector('.cn-scroll-hint');
            if (scrollHint) {
                scrollHint.style.opacity = scrollY > 100 ? '0' : '';
            }

            ticking = false;
        });
    };

    function updateActiveDot() {
        const scrollY = window.scrollY + window.innerHeight * 0.4;

        let activeIndex = 0;
        scenes.forEach((scene, i) => {
            if (scrollY >= scene.offsetTop) {
                activeIndex = i;
            }
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('cn-dot--active', i === activeIndex);
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // =========================================================
    //  CLIENT BLOCK PARALLAX (subtle)
    // =========================================================
    if (!isMobile()) {
        const parallaxScroll = () => {
            clientBlocks.forEach(block => {
                const rect = block.getBoundingClientRect();
                const blockH = block.offsetHeight;
                const scrollThrough = -rect.top / (blockH - window.innerHeight);
                const progress = Math.max(0, Math.min(1, scrollThrough));

                const number = block.querySelector('.cn-client-block__number');
                if (number) {
                    const yShift = (progress - 0.3) * -60;
                    number.style.transform = `scale(1) translateY(${yShift}px)`;
                }
            });

            requestAnimationFrame(parallaxScroll);
        };
        requestAnimationFrame(parallaxScroll);
    }

    // Initial trigger
    onScroll();
});
