(function () {
    'use strict';

    // --- Loading screen ---
    const loader = document.querySelector('.loading-screen');
    if (loader) setTimeout(() => loader.classList.add('hide'), 2200);

    // --- Coffee grains background ---
    const grainsContainer = document.body;
    const grainEmojis = ['☕', '🫘'];
    for (let i = 0; i < 18; i++) {
        const span = document.createElement('span');
        span.className = 'grain';
        span.textContent = grainEmojis[i % 2];
        const size = 16 + Math.random() * 24;
        span.style.cssText = `
            font-size: ${size}px;
            left: ${Math.random() * 100}%;
            bottom: ${-20 - Math.random() * 40}px;
            animation-duration: ${18 + Math.random() * 25}s;
            animation-delay: ${Math.random() * 15}s;
            opacity: ${0.06 + Math.random() * 0.1};
            transform: rotate(${Math.random() * 360}deg);
        `;
        grainsContainer.appendChild(span);
    }

    // --- Header scroll effect ---
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50), { passive: true });
    }

    // --- Scroll reveal (IntersectionObserver) ---
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    revealEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('visible');
        } else {
            observer.observe(el);
        }
    });

    // --- Custom cursor + mouse trail (desktop only) ---
    if (!window.matchMedia('(pointer: coarse)').matches) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.innerHTML = '<div class="cursor-dot"></div>';
        document.body.appendChild(cursor);

        let mx = 0, my = 0;
        document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

        function moveCursor() {
            cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
            requestAnimationFrame(moveCursor);
        }
        moveCursor();

        document.querySelectorAll('a, button, .btn, .qty-btn, nav a, .insta-card').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });

        // Mouse trail
        const trail = document.createElement('div');
        trail.className = 'mouse-trail-container';
        document.body.appendChild(trail);

        const count = 12;
        const particles = [];
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'mouse-particle';
            p.style.opacity = 0.6 - (i / count) * 0.55;
            const s = 1 - (i / count) * 0.4;
            p.style.transform = `translate(-50%, -50%) scale(${s})`;
            trail.appendChild(p);
            particles.push({ el: p, x: 0, y: 0 });
        }

        let idx = 0;
        document.addEventListener('mousemove', (e) => {
            particles[idx].x = e.clientX;
            particles[idx].y = e.clientY;
            idx = (idx + 1) % count;
        });

        function updateTrail() {
            for (let i = 1; i < count; i++) {
                particles[i].x += (particles[i - 1].x - particles[i].x) * 0.3;
                particles[i].y += (particles[i - 1].y - particles[i].y) * 0.3;
                particles[i].el.style.transform = `translate(${particles[i].x}px, ${particles[i].y}px) translate(-50%, -50%) scale(${1 - (i / count) * 0.4})`;
            }
            requestAnimationFrame(updateTrail);
        }
        updateTrail();
    }

})();

(function () {
    const hero = document.querySelector('.hero');
    if (hero) {
        const beans = ['☕', '🫘'];
        for (let i = 0; i < 12; i++) {
            const span = document.createElement('span');
            span.textContent = beans[i % 2];
            span.style.cssText = `
                position: absolute;
                font-size: ${14 + Math.random() * 22}px;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                opacity: ${0.08 + Math.random() * 0.12};
                animation: float ${5 + Math.random() * 8}s ease-in-out infinite;
                animation-delay: ${Math.random() * 4}s;
                pointer-events: none;
                z-index: 0;
                transform: rotate(${Math.random() * 360}deg);
            `;
            hero.appendChild(span);
        }
    }
})();

(function () {
    const orderSections = document.querySelectorAll('.order-section');

    orderSections.forEach(section => {
        const productName = section.dataset.product || 'القهوة التركي';
        const qtyBtns = section.querySelectorAll('.qty-btn');
        const orderBtn = section.querySelector('.order-btn');
        let selectedQty = 'ربع كيلو (250g)';

        qtyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                qtyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedQty = btn.dataset.qty;
            });
        });

        orderBtn.addEventListener('click', () => {
            const msg = `مرحباً مَلَاذ 🙋\n\nأريد طلب:\n▪ ${productName}\n▪ الكمية: ${selectedQty}\n\nالرجاء تأكيد الطلب والتوصيل.`;
            const url = `https://wa.me/201282256742?text=${encodeURIComponent(msg)}`;
            window.open(url, '_blank');
        });
    });

    const rotatables = document.querySelectorAll('.rotate-360');
    rotatables.forEach(rotatable => {
        let isDragging = false;
        let startX, startAngle = 0, currentAngle = 0;

        const onStart = (x) => {
            isDragging = true;
            startX = x;
            startAngle = currentAngle;
            rotatable.style.transition = 'none';
        };

        const onMove = (x) => {
            if (!isDragging) return;
            const delta = x - startX;
            currentAngle = startAngle + delta * 0.6;
            rotatable.style.transform = `rotateY(${currentAngle}deg)`;
        };

        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            rotatable.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            const snap = Math.round(currentAngle / 30) * 30;
            currentAngle = snap;
            rotatable.style.transform = `rotateY(${snap}deg)`;
        };

        rotatable.addEventListener('mousedown', (e) => onStart(e.clientX));
        document.addEventListener('mousemove', (e) => onMove(e.clientX));
        document.addEventListener('mouseup', onEnd);

        rotatable.addEventListener('touchstart', (e) => {
            e.preventDefault();
            onStart(e.touches[0].clientX);
        });
        rotatable.addEventListener('touchmove', (e) => {
            e.preventDefault();
            onMove(e.touches[0].clientX);
        });
        rotatable.addEventListener('touchend', onEnd);
    });

    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotX = ((y - centerY) / centerY) * -8;
            const rotY = ((x - centerX) / centerX) * 8;
            card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
            card.style.transition = 'transform 0.5s ease-out';
            setTimeout(() => { card.style.transition = ''; }, 500);
        });
    });
})();
