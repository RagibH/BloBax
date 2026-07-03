/**
 * Blobax UI — cursor, Lenis, GSAP, preloader, chat helpers
 */
(function () {
    'use strict';

    const hasGsap = typeof gsap !== 'undefined';
    const hasScrollTrigger = typeof ScrollTrigger !== 'undefined';
    const hasLenis = typeof Lenis !== 'undefined';

    if (hasGsap && hasScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger, TextPlugin);
    }

    /* ——— Cinematic preloader ——— */
    const preloader = document.getElementById('bx-preloader');
    const preloaderFill = document.querySelector('.bx-preloader-fill');
    const preloaderPct = document.querySelector('.bx-preloader-pct');
    const preloaderPanels = document.querySelectorAll('.bx-preloader-panel');

    const hidePreloader = () => {
        if (!preloader) return;
        if (hasGsap && preloaderPanels.length) {
            const tl = gsap.timeline({
                onComplete: () => preloader.classList.add('bx-hidden'),
            });
            tl.to(preloaderPanels, {
                yPercent: -100,
                duration: 0.9,
                stagger: 0.08,
                ease: 'power4.inOut',
            });
            tl.to(preloader, { opacity: 0, duration: 0.3 }, '-=0.2');
        } else {
            preloader.classList.add('bx-hidden');
        }
    };

    const isLanding = document.body.classList.contains('bx-page-home');
    if (preloader && preloaderPct && isLanding) {
        let pct = 0;
        const tick = setInterval(() => {
            pct = Math.min(pct + Math.floor(Math.random() * 12) + 3, 100);
            preloaderPct.textContent = pct + '%';
            if (preloaderFill) preloaderFill.style.width = pct + '%';
            if (pct >= 100) {
                clearInterval(tick);
                setTimeout(hidePreloader, 400);
            }
        }, 50);
        window.addEventListener('load', () => {
            clearInterval(tick);
            preloaderPct.textContent = '100%';
            if (preloaderFill) preloaderFill.style.width = '100%';
            setTimeout(hidePreloader, 500);
        });
        setTimeout(hidePreloader, 5000);
    } else if (preloader && isLanding) {
        window.addEventListener('load', () => setTimeout(hidePreloader, 600));
        setTimeout(hidePreloader, 4000);
    } else if (preloader) {
        preloader.classList.add('bx-hidden');
    }

    /* ——— Custom cursor ——— */
    const cursor = document.getElementById('bx-cursor');
    const dot = cursor?.querySelector('.bx-cursor-dot');
    const ring = cursor?.querySelector('.bx-cursor-ring');

    if (cursor && dot && ring && window.matchMedia('(min-width: 769px)').matches) {
        let mouseX = 0;
        let mouseY = 0;
        let ringX = 0;
        let ringY = 0;
        let rafId = null;

        const setPos = (el, x, y) => {
            el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        };

        window.addEventListener(
            'mousemove',
            (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                setPos(dot, mouseX, mouseY);
            },
            { passive: true }
        );

        const LERP = 0.18;
        const moveRing = () => {
            ringX += (mouseX - ringX) * LERP;
            ringY += (mouseY - ringY) * LERP;
            setPos(ring, ringX, ringY);
            rafId = requestAnimationFrame(moveRing);
        };
        moveRing();

        const addHover = () => cursor.classList.add('is-hovering');
        const removeHover = () => cursor.classList.remove('is-hovering');

        const hoverSelector =
            'a, button, [role="button"], input, textarea, select, .bx-btn, .bx-pred-card, .bx-toggle-btn, label, .bx-tab-btn, .bx-topic-chip';
        document.addEventListener(
            'mouseover',
            (e) => {
                if (e.target.closest(hoverSelector)) addHover();
            },
            { passive: true }
        );
        document.addEventListener(
            'mouseout',
            (e) => {
                if (!e.relatedTarget || !e.relatedTarget.closest(hoverSelector)) removeHover();
            },
            { passive: true }
        );

        window.addEventListener('mousedown', () => cursor.classList.add('is-clicking'));
        window.addEventListener('mouseup', () => cursor.classList.remove('is-clicking'));

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(rafId);
            } else {
                moveRing();
            }
        });
    }

    /* ——— Lenis smooth scroll (skip on chat — native scroll in thread) ——— */
    let lenis;
    const skipLenis =
        document.body.classList.contains('bx-page-chat') ||
        document.body.classList.contains('bx-page-directory');
    if (hasLenis && !skipLenis) {
        lenis = new Lenis({
            duration: 1.65,
            easing: (t) => 1 - Math.pow(1 - t, 4),
            smooth: true,
            smoothTouch: false,
        });
        const raf = (time) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
        if (hasGsap && hasScrollTrigger) {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        }
    }

    /* ——— Navbar scroll ——— */
    const nav = document.querySelector('.bx-nav');
    if (nav) {
        const onScroll = () => nav.classList.toggle('bx-scrolled', window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll);
    }

    /* ——— Mobile menu ——— */
    const menuBtn = document.getElementById('bx-menu-toggle');
    const mobileMenu = document.getElementById('bx-mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-open');
            document.body.style.overflow = mobileMenu.classList.contains('is-open') ? 'hidden' : '';
        });
        mobileMenu.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => {
                mobileMenu.classList.remove('is-open');
                document.body.style.overflow = '';
            });
        });
    }

    /* ——— GSAP scroll reveals ——— */
    if (hasGsap && hasScrollTrigger) {
        gsap.utils.toArray('.bx-reveal').forEach((el, i) => {
            gsap.fromTo(
                el,
                { opacity: 0, y: 36, filter: 'blur(6px)' },
                {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 1.05,
                    delay: (i % 5) * 0.05,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 90%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        });

        document.querySelectorAll('.bx-hero-vid-title').forEach((el) => {
            if (typeof Splitting !== 'undefined') {
                Splitting({ target: el, by: 'chars' });
                const chars = el.querySelectorAll('.char');
                if (chars.length) {
                    gsap.fromTo(
                        chars,
                        { opacity: 0, y: 40, rotateX: -20 },
                        {
                            opacity: 1,
                            y: 0,
                            rotateX: 0,
                            stagger: 0.02,
                            duration: 0.75,
                            ease: 'back.out(1.3)',
                            delay: 0.45,
                        }
                    );
                }
            }
        });

        document.querySelectorAll('.bx-page-home [data-counter]').forEach((el) => {
            const target = parseInt(el.dataset.counter, 10) || 0;
            const suffix = el.dataset.suffix || '';
            ScrollTrigger.create({
                trigger: el,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                    gsap.to(
                        { val: 0 },
                        {
                            val: target,
                            duration: 2,
                            ease: 'power2.out',
                            onUpdate: function () {
                                el.textContent = Math.floor(this.targets()[0].val) + suffix;
                            },
                        }
                    );
                },
            });
        });
    } else {
        document.querySelectorAll('.bx-reveal').forEach((el) => el.classList.add('bx-visible'));
        document.querySelectorAll('.bx-page-home [data-counter]').forEach((el) => {
            const target = parseInt(el.dataset.counter, 10) || 0;
            const obs = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) {
                        el.textContent = target + (el.dataset.suffix || '');
                        obs.disconnect();
                    }
                },
                { threshold: 0.3 }
            );
            obs.observe(el);
        });
    }

    window.BlobaxChat = {
        escapeHtml(text) {
            const d = document.createElement('div');
            d.textContent = text;
            return d.innerHTML;
        },
        formatMessage(text) {
            return this.escapeHtml(text)
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>');
        },
        getCsrf() {
            const c = document.cookie.match(/csrftoken=([^;]+)/);
            return c ? c[1] : '';
        },
    };
})();
