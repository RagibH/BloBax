(function () {
    'use strict';

    document.querySelectorAll('.bx-faq-q').forEach((btn) => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.bx-faq-item');
            const wasOpen = item.classList.contains('is-open');
            document.querySelectorAll('.bx-faq-item').forEach((el) => el.classList.remove('is-open'));
            if (!wasOpen) item.classList.add('is-open');
        });
    });

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.utils.toArray('.bx-land-section').forEach((section) => {
        const cards = section.querySelectorAll('.bx-card, .bx-mission-card, .bx-why-card, .bx-how-card');
        if (!cards.length) return;
        gsap.fromTo(
            cards,
            { opacity: 0, y: 28 },
            {
                opacity: 1,
                y: 0,
                duration: 0.85,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: section,
                    start: 'top 78%',
                    toggleActions: 'play none none none',
                },
            }
        );
    });

    const hero = document.querySelector('.bx-hero-video-land');
    if (hero) {
        gsap.to('.bx-hero-video-bg video', {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: 1.2,
            },
        });
    }
})();
