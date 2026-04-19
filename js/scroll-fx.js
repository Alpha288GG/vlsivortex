/**
 * scroll-fx.js — Tech Vortex
 * Smooth, glitch-free scroll animations.
 * No rotateX / 3D perspective — pure translateY + opacity.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ── 1. Smooth scroll reveal with staggered delays ──
    const revealElements = document.querySelectorAll('[data-reveal]');

    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const delay = parseInt(el.dataset.delay || '0', 10);
                // Use rAF for paint-before-transition to avoid FOUC / glitch
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        el.classList.add('revealed');
                    }, delay);
                });
                revealObserver.unobserve(el);
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -48px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // ── 2. Stat counter animation ──
    const counters = document.querySelectorAll('[data-counter]');
    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.dataset.counter, 10);
                const prefix = el.dataset.prefix || '';
                const suffix = el.dataset.suffix || '';
                const duration = 1600;
                const start = performance.now();

                function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

                function tick(now) {
                    const progress = Math.min((now - start) / duration, 1);
                    const v = Math.round(easeOut(progress) * target);
                    el.textContent = prefix + v.toLocaleString('en-IN') + suffix;
                    if (progress < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
                counterObserver.unobserve(el);
            });
        }, { threshold: 0.5 });

        counters.forEach(el => counterObserver.observe(el));
    }

    // ── 3. Card 3D tilt on hover ──
    // Uses CSS perspective — no JS layout thrash
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const tiltCards = document.querySelectorAll('[data-tilt]');
    
    if (!isTouchDevice) {
        tiltCards.forEach(card => {
        let raf = null;
        let targetRX = 0, targetRY = 0;
        let currentRX = 0, currentRY = 0;

        function lerp(a, b, t) { return a + (b - a) * t; }

        function animateTilt() {
            currentRX = lerp(currentRX, targetRX, 0.1);
            currentRY = lerp(currentRY, targetRY, 0.1);
            card.style.transform = `perspective(900px) rotateX(${currentRX}deg) rotateY(${currentRY}deg) scale(1.02)`;
            if (Math.abs(currentRX - targetRX) > 0.01 || Math.abs(currentRY - targetRY) > 0.01) {
                raf = requestAnimationFrame(animateTilt);
            } else {
                raf = null;
            }
        }

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            targetRY = x * 10;
            targetRX = -y * 8;
            if (!raf) raf = requestAnimationFrame(animateTilt);
        });

        card.addEventListener('mouseleave', () => {
            targetRX = 0;
            targetRY = 0;
            // Smooth back to identity
            function resetTilt() {
                currentRX = lerp(currentRX, 0, 0.12);
                currentRY = lerp(currentRY, 0, 0.12);
                card.style.transform = `perspective(900px) rotateX(${currentRX}deg) rotateY(${currentRY}deg) scale(1)`;
                if (Math.abs(currentRX) > 0.01 || Math.abs(currentRY) > 0.01) {
                    requestAnimationFrame(resetTilt);
                } else {
                    card.style.transform = '';
                }
            }
            cancelAnimationFrame(raf);
            raf = null;
            requestAnimationFrame(resetTilt);
        });
        });
    }

    // ── 4. Passive scroll parallax (performance-safe) ──
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    if (parallaxEls.length > 0) {
        let ticking = false;
        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const sy = window.scrollY;
                parallaxEls.forEach(el => {
                    const speed = parseFloat(el.dataset.parallax) || 0.2;
                    el.style.transform = `translateY(${sy * speed}px)`;
                });
                ticking = false;
            });
        }
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // ── 5. Mobile hamburger ──
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            menuBtn.textContent = mobileMenu.classList.contains('open') ? '✕' : '☰';
        });
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('open');
                menuBtn.textContent = '☰';
            }
        });
    }
});
