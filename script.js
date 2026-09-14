(function () {
    'use strict';

    // --- Loading screen: typewriter + cup fill + progress bar + curtain split ---
    const loader = document.querySelector('.loading-screen');
    if (loader) {
        // Typewriter effect — type both names simultaneously
        const twArabic = document.getElementById('twArabic');
        const twEnglish = document.getElementById('twEnglish');
        if (twArabic && twEnglish) {
            const arabic = 'مَلَاذ';
            const english = 'Malaz';
            let aIdx = 0, eIdx = 0;

            function typeArabic() {
                if (aIdx <= arabic.length) {
                    twArabic.textContent = arabic.substring(0, aIdx);
                    aIdx++;
                    setTimeout(typeArabic, 120);
                }
            }

            function typeEnglish() {
                if (eIdx <= english.length) {
                    twEnglish.textContent = english.substring(0, eIdx);
                    eIdx++;
                    setTimeout(typeEnglish, 120);
                }
            }

            setTimeout(typeArabic, 400);
            setTimeout(typeEnglish, 400);
        }

        // Cup fill + full-width progress bar
        const fillEl = document.getElementById('cupFill');
        const cremaEl = document.getElementById('cupCrema');
        const progressFill = document.getElementById('loadingProgressFill');
        const CUP_TOP = 44;
        const CUP_BOTTOM = 74;
        const CUP_HEIGHT = CUP_BOTTOM - CUP_TOP;
        const duration = 2400;
        const startTime = performance.now();

        function updateFill() {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(100, (elapsed / duration) * 100);

            if (progressFill) progressFill.style.width = progress + '%';

            const h = (progress / 100) * CUP_HEIGHT;
            if (fillEl) {
                fillEl.setAttribute('y', CUP_BOTTOM - h);
                fillEl.setAttribute('height', h);
            }
            if (cremaEl) {
                const cremaH = Math.min(3, h);
                cremaEl.setAttribute('y', CUP_BOTTOM - h);
                cremaEl.setAttribute('height', cremaH);
            }

            if (progress < 100) {
                requestAnimationFrame(updateFill);
            } else {
                finishLoading();
            }
        }

        function finishLoading() {
            setTimeout(() => loader.classList.add('done'), 350);
            setTimeout(() => loader.classList.add('exiting'), 750);
            setTimeout(() => loader.classList.add('gone'), 2100);
        }

        requestAnimationFrame(updateFill);
    }

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

    // --- Hamburger Menu + Scroll Hide ---
    const hamburger = document.getElementById('hamburger');
    const menuOverlay = document.getElementById('menuOverlay');
    const header = document.querySelector('header');

    if (hamburger && menuOverlay) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            document.body.style.overflow = menuOverlay.classList.contains('active') ? 'hidden' : '';
        });

        menuOverlay.querySelectorAll('.menu-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
                hamburger.classList.remove('active');
                menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    if (header) {
        let lastScroll = 0;
        let scrollTimer = null;

        window.addEventListener('scroll', () => {
            const current = window.scrollY;

            if (current > lastScroll && current > 100) {
                header.classList.add('hidden');
            }

            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                header.classList.remove('hidden');
            }, 150);

            lastScroll = current;
        }, { passive: true });
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

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        document.querySelectorAll('a, button, .btn, .qty-btn, nav a').forEach(el => {
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
    let cart = JSON.parse(localStorage.getItem('malaz_cart')) || [];

    function saveCart() {
        localStorage.setItem('malaz_cart', JSON.stringify(cart));
        updateBadge();
    }

    function updateBadge() {
        const badge = document.getElementById('cartBadge');
        if (!badge) return;
        const total = cart.reduce((sum, item) => sum + item.count, 0);
        badge.textContent = total;
        badge.style.display = total > 0 ? 'flex' : 'none';
        if (total > 0) {
            badge.classList.remove('bounce');
            void badge.offsetWidth;
            badge.classList.add('bounce');
        }
    }

    document.querySelectorAll('.order-section').forEach(setupOrderSection);

    function setupOrderSection(section) {
        const productName = section.dataset.product || 'القهوة التركي';
        const qtyBtns = section.querySelectorAll('.qty-btn');
        const addBtn = section.querySelector('.add-to-cart-btn');
        const stepperVal = section.querySelector('.stepper-value');
        const stepperBtns = section.querySelectorAll('.stepper-btn');
        let selectedQty = 'ربع كيلو (250g)';
        let qtyCount = 1;

        const activeBtn = section.querySelector('.qty-btn.active');
        if (activeBtn) selectedQty = activeBtn.dataset.qty;
        if (stepperVal) qtyCount = parseInt(stepperVal.textContent, 10) || 1;

        qtyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                qtyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedQty = btn.dataset.qty;
            });
        });

        stepperBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.action === 'plus') {
                    qtyCount++;
                } else {
                    qtyCount = Math.max(1, qtyCount - 1);
                }
                if (stepperVal) stepperVal.textContent = qtyCount;
            });
        });

        function steamBurst() {
            if (!addBtn) return;
            for (let i = 0; i < 6; i++) {
                const w = document.createElement('span');
                w.className = 'steam-burst';
                w.style.left = (30 + Math.random() * 40) + '%';
                w.style.setProperty('--sx', (Math.random() * 30 - 15) + 'px');
                w.style.animationDelay = (Math.random() * 0.25) + 's';
                w.style.height = (22 + Math.random() * 16) + 'px';
                addBtn.appendChild(w);
                setTimeout(() => w.remove(), 1600);
            }
        }

        function waxSeal() {
            if (!addBtn) return;
            const seal = document.createElement('span');
            seal.className = 'wax-seal';
            seal.innerHTML =
                '<span class="ws-shadow"></span>' +
                '<span class="ws-drip"></span>' +
                '<span class="ws-ornament"></span>' +
                '<span class="ws-star">✦</span>' +
                '<span class="ws-name">مَلَاذ</span>' +
                '<span class="ws-shine"></span>' +
                '<span class="ws-stamp">ختمنا طلبك</span>';
            addBtn.appendChild(seal);
            addBtn.classList.add('sealed');
            setTimeout(() => {
                const stamp = seal.querySelector('.ws-stamp');
                const name = seal.querySelector('.ws-name');
                if (stamp) stamp.classList.add('done');
                if (name) name.classList.add('show');
            }, 850);
            setTimeout(() => dissolve(seal), 1350);
            setTimeout(() => {
                seal.remove();
                addBtn.classList.remove('sealed');
            }, 2050);
        }

        function dissolve(seal) {
            for (let i = 0; i < 14; i++) {
                const p = document.createElement('span');
                p.className = 'ws-particle';
                const angle = Math.random() * Math.PI * 2;
                const dist = 22 + Math.random() * 46;
                const dx = Math.cos(angle) * dist;
                const dy = Math.sin(angle) * dist - 16;
                p.style.setProperty('--dx', dx.toFixed(1) + 'px');
                p.style.setProperty('--dy', dy.toFixed(1) + 'px');
                p.style.animationDelay = (Math.random() * 0.12).toFixed(2) + 's';
                const s = 3.5 + Math.random() * 3.5;
                p.style.width = s.toFixed(1) + 'px';
                p.style.height = p.style.width;
                p.style.marginLeft = (-s / 2).toFixed(1) + 'px';
                p.style.marginTop = p.style.marginLeft;
                seal.appendChild(p);
            }
        }

        addBtn.addEventListener('click', () => {
            const existing = cart.find(i => i.name === productName && i.qty === selectedQty);
            if (existing) {
                existing.count += qtyCount;
            } else {
                cart.push({ name: productName, qty: selectedQty, count: qtyCount });
            }
            saveCart();
            steamBurst();
            waxSeal();

            const btnLabel = addBtn.querySelector('.btn-label');
            if (btnLabel) btnLabel.textContent = '✓ تمت الإضافة';
            addBtn.classList.add('added');
            setTimeout(() => {
                if (btnLabel) btnLabel.textContent = '🛒 أضف للسلة';
                addBtn.classList.remove('added');
            }, 1200);
        });
    }

    const cartBtn = document.getElementById('cartBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartWhatsapp = document.getElementById('cartWhatsapp');

    const coffeeSvg = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#d4a574" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>';

    function renderCart() {
        if (!cartItems) return;
        const summaryEl = document.getElementById('cartSummary');

        if (cart.length === 0) {
            cartItems.innerHTML =
                '<div class="cart-empty">' +
                    '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="rgba(212,165,116,0.35)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<path d="M18 8h1a4 4 0 010 8h-1"/>' +
                        '<path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>' +
                        '<line x1="6" y1="1" x2="6" y2="4"/>' +
                        '<line x1="10" y1="1" x2="10" y2="4"/>' +
                        '<line x1="14" y1="1" x2="14" y2="4"/>' +
                    '</svg>' +
                    '<p>لسه مفيش حاجة!</p>' +
                    '<span>افتح المنيو واختار قهوتك المفضلة</span>' +
                '</div>';
            cartFooter.style.display = 'none';
            if (summaryEl) summaryEl.innerHTML = '';
            return;
        }

        cartFooter.style.display = 'block';
        let html = '';

        cart.forEach((item, idx) => {
            html +=
                '<div class="cart-item" data-idx="' + idx + '">' +
                    '<div class="cart-item-row">' +
                        '<div class="cart-item-img">' + coffeeSvg + '</div>' +
                        '<div class="cart-item-info">' +
                            '<span class="cart-item-name">' + item.name + '</span>' +
                            '<span class="cart-item-qty">' + item.qty + '</span>' +
                        '</div>' +
                        '<div class="cart-item-controls">' +
                            '<button class="cart-count-btn" data-idx="' + idx + '" data-action="minus">−</button>' +
                            '<span class="cart-item-count" data-idx="' + idx + '">' + item.count + '</span>' +
                            '<button class="cart-count-btn" data-idx="' + idx + '" data-action="plus">+</button>' +
                            '<button class="cart-remove-btn" data-idx="' + idx + '">✕</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        });
        cartItems.innerHTML = html;

        const summaryEl = document.getElementById('cartSummary');
        if (summaryEl) {
            summaryEl.innerHTML =
                '<div class="cart-summary-row cart-summary-total"><span>المجموع</span><span>' + cart.length + ' أصناف</span></div>';
        }

        cartItems.querySelectorAll('.cart-count-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                if (btn.dataset.action === 'plus') {
                    cart[idx].count++;
                } else {
                    cart[idx].count--;
                    if (cart[idx].count <= 0) cart.splice(idx, 1);
                }
                saveCart();
                renderCart();
                const bumpEl = cartItems.querySelector('.cart-item-count[data-idx="' + idx + '"]');
                if (bumpEl) {
                    bumpEl.classList.remove('bump');
                    void bumpEl.offsetWidth;
                    bumpEl.classList.add('bump');
                }
            });
        });

        cartItems.querySelectorAll('.cart-remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                cart.splice(parseInt(btn.dataset.idx), 1);
                saveCart();
                renderCart();
            });
        });
    }

    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            renderCart();
            cartOverlay.classList.add('active');
        });
    }

    if (cartClose) {
        cartClose.addEventListener('click', () => cartOverlay.classList.remove('active'));
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) cartOverlay.classList.remove('active');
        });
    }

    if (cartWhatsapp) {
        cartWhatsapp.addEventListener('click', () => {
            let msg = 'مرحباً مَلَاذ 🙋\n\nأريد طلب:\n';
            cart.forEach(item => {
                msg += '▪ ' + item.name + ' — ' + item.qty + ' × ' + item.count + '\n';
            });
            msg += '\nالرجاء تأكيد الطلب والتوصيل.';
            const url = 'https://wa.me/201282256742?text=' + encodeURIComponent(msg);
            window.open(url, '_blank');
        });
    }

    updateBadge();
})();

// --- 3D Tilt Cards (products + about) ---
(function () {
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

// --- Dynamic Greeting ---
(function () {
    const el = document.getElementById('heroGreeting');
    if (!el) return;

    const hour = new Date().getHours();
    let greeting;

    if (hour >= 5 && hour < 12) {
        greeting = 'صباح القهوة ☀️';
    } else if (hour >= 12 && hour < 17) {
        greeting = 'مساء النشاط ☕';
    } else if (hour >= 17 && hour < 21) {
        greeting = 'مساء الهدوء 🌙';
    } else {
        greeting = 'ليلة هانئة ✨';
    }

    const visited = localStorage.getItem('malaz_visited');
    if (visited) {
        el.textContent = 'أهلاً بعودتك! ' + greeting;
    } else {
        el.textContent = greeting;
    }
    localStorage.setItem('malaz_visited', 'true');
})();

// --- Message of the Day (2 per day = 60 quotes = 30 days) ---
(function () {
    const el = document.getElementById('heroDotd');
    if (!el) return;

    const quotes = [
        'القهوة الجيدة تبدأ من حبوب مختارة بعناية.',
        'كل فنجان قصة، وكل رشفة ذكرى.',
        'القهوة هي لحظة صفاء في عالم مشحون.',
        'من الحبوب إلى الفنجان... نقدم لك الأصالة.',
        'أحلى لحظات اليوم تبدأ مع فنجان مَلَاذ.',
        'القهوة ليست مجرد مشروب، إنها تجربة.',
        'في كل فنجان مَلَاذ... حكاية من أجود الحبوب.',
        'القهوة العربية: أصالة عمرها مئات السنين.',
        'ابدأ يومك بفنجان يروي ظمأ روحك.',
        'القهوة الراقية لا تُعجّل، تُقدَّم بحب.',
        'القهوة كالصداقة.. كلما كانت أصيلة، كانت أروع.',
        'فنجانك في مَلَاذ... هو لحظتك مع نفسك.',
        'نؤمن بأن القهوة الجيدة تصنع يوماً أفضل.',
        'حبوبنا تُحمّص بحب، وتُقدَّم بفخر.',
        'مَلَاذ... حيث يلتقي الطعم بالأصالة.',
        'القهوة المثالية هي التي تبقى في الذاكرة.',
        'استمتع بكل رشفة، فهي لحظة لا تتكرر.',
        'القهوة تجمعنا، والمذاق يربطنا.',
        'من مزارع العالم إلى فنجانك... قصة مَلَاذ.',
        'أصالة الماضي، عبق الحاضر، في فنجان مَلَاذ.',
        'لا تُسرع في فنجانك، الحياة أجمل بهدوء.',
        'القهوة العربية فن، ومَلَاذ صاحب الفن.',
        'في كل صباح، فنجانك ينتظرك في مَلَاذ.',
        'القهوة تصنع الفارق، ومَلَاذ يصنع القهوة.',
        'أحلى صباح مع فنجان مَلَاذ.',
        'القهوة الجيدة صديقك في كل الأوقات.',
        'مَلَاذ... لأنك تستحق الأفضل.',
        'كل فنجان في مَلَاذ... تحفة فنية.',
        'القهوة تروي الظما، ومَلَاذ تروي الروح.',
        'القهوة العربية تقليد عريق، ومَلَاذ حارس هذا التقليد.',
        'القهوة كالحياة.. أحياناً مُرّة وأحياناً حلوة، لكنها دائماً تستحق.',
        'لا تبدأ يومك دون فنجان يُشعّل شغفك.',
        'القهوة التي تحبّها... هي التي تصنع لحظاتك المفضلة.',
        'أجود الحبوب تصنع أجود القهوة، وأجود القهوة تصنع أسعد اللحظات.',
        'القهوة المحمّصة بحب... تُقدَّم بفرق.',
        'في صمت الصباح، فنجان القهوة يحكي لك.',
        'مَلَاذ لا تُقدّم قهوة فحسب، بل تُقدّم تجربة.',
        'القهوة الجيدة لا تحتاج إلى كلام، شرشفتها تكفي.',
        'حبوب بن كولومبية، هندية، عربية... كل حبة تروي قصة.',
        'القهوة العربية فن قديم، ومَلَاذ يُحييه بأسلوب عصري.',
        'فنجان واحد يغيّر نهارك بالكامل.',
        'القهوة التي تُصنع بحب... تُشرب بشغف.',
        'لا شيء يُضاهي رائحة القهوة المحمّصة طازجة.',
        'مَلَاذ... لأن كل فنجان يستحق أن يكون مميزاً.',
        'القهوة ليست عن التسريع، إنها عن الاستمتاع باللحظة.',
        'من حبوب العالم إلى فنجانك... مَلَاذ تختار لك الأفضل.',
        'القهوة تجمع الأصدقاء، وفنجان مَلَاذ يجمع القلوب.',
        'صباحك لا يكتمل دون فنجانك المفضل.',
        'القهوة كالموسيقى.. كل نوع لها لحن خاص.',
        'مَلَاذ... حيث يتحول الفنجان إلى ذكرى.',
        'القهوة الراقية تُقدَّم ببساطة، وتترك أثراً عميقاً.',
        'في كل رشفة من فنجانك... تذوّق حبوب العالم.',
        'أصالة القهوة العربية تبدأ من اختيار الحبة الصحيحة.',
        'مَلَاذ تؤمن بأن التفاصيل الصغيرة تصنع الفرق الكبير.',
        'القهوة كالحبيبة.. تستاهل اللي يختارها بعناية.',
        'لا تقلّل من شأن فنجان قهوة جيد، فقد يُغيّر يومك.',
        'حبوبنا تُحمّص كل صباح لتصل إليك بأجود حال.',
        'مَلَاذ... لأنك تستحق قهوة تليق بذوقك.',
        'القهوة العربية ليست مجرد عادة، إنها هوية.',
        'كل فنجان في مَلَاذ يحمل حبّاً وعناية لا تنتهي.'
    ];

    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    const isEvening = now.getHours() >= 14;
    const quoteIndex = ((dayOfYear * 2) + (isEvening ? 1 : 0)) % quotes.length;
    el.textContent = quotes[quoteIndex];
})();

// --- Coffee Origins Map ---
(function () {
    const map = document.getElementById('originsMap');
    if (!map) return;

    // Zoom controls
    const zoomArea = document.getElementById('mapZoomArea');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const zoomResetBtn = document.getElementById('zoomReset');
    let zoomLevel = 1;

    if (zoomArea && zoomInBtn && zoomOutBtn && zoomResetBtn) {
        let panX = 0, panY = 0;
        let isDragging = false;
        let startX, startY;
        let startPanX, startPanY;

        function applyTransform() {
            zoomArea.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
        }

        function setZoom(level) {
            zoomLevel = Math.min(3, Math.max(0.5, level));
            if (zoomLevel <= 1) { panX = 0; panY = 0; }
            applyTransform();
        }

        function clampPan() {
            const maxPan = (zoomLevel - 1) * 200;
            panX = Math.max(-maxPan, Math.min(maxPan, panX));
            panY = Math.max(-maxPan, Math.min(maxPan, panY));
        }

        zoomInBtn.addEventListener('click', () => setZoom(zoomLevel + 0.25));
        zoomOutBtn.addEventListener('click', () => setZoom(zoomLevel - 0.25));
        zoomResetBtn.addEventListener('click', () => { panX = 0; panY = 0; setZoom(1); });

        // Mouse drag
        zoomArea.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startPanX = panX;
            startPanY = panY;
            zoomArea.classList.add('dragging');
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            panX = startPanX + (e.clientX - startX);
            panY = startPanY + (e.clientY - startY);
            clampPan();
            applyTransform();
        });
        document.addEventListener('mouseup', () => {
            if (isDragging) { isDragging = false; zoomArea.classList.remove('dragging'); }
        });

        // Touch drag
        zoomArea.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return;
            isDragging = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startPanX = panX;
            startPanY = panY;
            zoomArea.classList.add('dragging');
        }, { passive: true });
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            panX = startPanX + (e.touches[0].clientX - startX);
            panY = startPanY + (e.touches[0].clientY - startY);
            clampPan();
            applyTransform();
        }, { passive: true });
        document.addEventListener('touchend', () => {
            if (isDragging) { isDragging = false; zoomArea.classList.remove('dragging'); }
        });
    }

    // Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const group = btn.dataset.filter;
            const value = btn.dataset.value;
            document.querySelectorAll(`.filter-btn[data-filter="${group}"]`).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilters();
        });
    });

    function applyFilters() {
        const continent = document.querySelector('.filter-btn[data-filter="continent"].active')?.dataset.value || 'all';
        const bean = document.querySelector('.filter-btn[data-filter="bean"].active')?.dataset.value || 'all';

        // Filter bean pins
        document.querySelectorAll('.bean-pin').forEach(pin => {
            const pinContinent = pin.dataset.continent;
            const pinBean = pin.dataset.bean;
            const matchContinent = continent === 'all' || pinContinent === continent;
            const matchBean = bean === 'all' || pinBean === bean || pinBean === 'both';
            pin.style.opacity = (matchContinent && matchBean) ? '1' : '0.1';
            pin.style.transition = 'opacity 0.4s ease';
        });

        // Filter continent groups (these are sibling <g> elements, not parents of bean-pins)
        const beanPins = document.querySelectorAll('.bean-pin');
        document.querySelectorAll('g[data-continent]').forEach(group => {
            if (group.classList.contains('bean-pin')) return;
            const groupContinent = group.dataset.continent;

            // Continent filter: dim non-matching continent groups
            const matchContinent = continent === 'all' || groupContinent === continent;

            // Bean filter: dim continent group if it has no matching bean pins
            let matchBean = true;
            if (bean !== 'all') {
                const hasMatchingPin = Array.from(beanPins).some(pin => {
                    const pc = pin.dataset.continent;
                    const pb = pin.dataset.bean;
                    return pc === groupContinent && (pb === bean || pb === 'both');
                });
                matchBean = hasMatchingPin;
            }

            group.style.opacity = (matchContinent && matchBean) ? '1' : '0.12';
            group.style.transition = 'opacity 0.4s ease';
        });
    }

    // Quick Facts rotation
    const facts = document.querySelectorAll('.quick-facts .fact');
    if (facts.length > 0) {
        let factIdx = 0;
        setInterval(() => {
            facts[factIdx].classList.remove('active');
            factIdx = (factIdx + 1) % facts.length;
            facts[factIdx].classList.add('active');
        }, 3500);
    }

    // Production Ranking — circular rings
    const rankingContainer = document.getElementById('rankingBars');
    if (rankingContainer) {
        const countries = [
            { name: 'البرازيل', code: 'br', rank: 1, production: '3.7M طن', pct: 100 },
            { name: 'فيتنام', code: 'vn', rank: 2, production: '1.8M طن', pct: 49 },
            { name: 'كولومبيا', code: 'co', rank: 3, production: '800K طن', pct: 22 },
            { name: 'إندونيسيا', code: 'id', rank: 4, production: '700K طن', pct: 19 },
            { name: 'إثيوبيا', code: 'et', rank: 5, production: '600K طن', pct: 16 },
            { name: 'هندوراس', code: 'hn', rank: 6, production: '400K طن', pct: 11 },
            { name: 'الهند', code: 'in', rank: 7, production: '350K طن', pct: 9 },
            { name: 'أوغندا', code: 'ug', rank: 8, production: '300K طن', pct: 8 },
            { name: 'المكسيك', code: 'mx', rank: 9, production: '250K طن', pct: 7 },
            { name: 'بيرو', code: 'pe', rank: 10, production: '200K طن', pct: 5 },
        ];
        const r = 42, circ = 2 * Math.PI * r;
        rankingContainer.innerHTML = countries.map((c, i) => {
            const offset = circ - (c.pct / 100) * circ;
            const size = c.rank <= 3 ? 140 : c.rank <= 6 ? 120 : 105;
            return `
            <div class="rank-ring" style="animation-delay: ${i * 0.1}s; --ring-size: ${size}px">
                <div class="rank-ring-svg">
                    <svg viewBox="0 0 100 100">
                        <circle class="ring-bg" cx="50" cy="50" r="${r}"/>
                        <circle class="ring-fill" cx="50" cy="50" r="${r}"
                            stroke-dasharray="${circ}"
                            stroke-dashoffset="${circ}"
                            data-offset="${offset}"/>
                    </svg>
                    <div class="rank-ring-flag">
                        <img src="https://flagcdn.com/w160/${c.code}.png" alt="${c.name}">
                    </div>
                </div>
                <div class="rank-ring-name">${c.name}</div>
                <div class="rank-ring-prod">${c.production}</div>
            </div>`;
        }).join('');

        // Animate rings on scroll
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.querySelectorAll('.ring-fill').forEach(ring => {
                        ring.style.strokeDashoffset = ring.dataset.offset;
                    });
                }
            });
        }, { threshold: 0.25 });
        obs.observe(rankingContainer);
    }
})();

// --- Coffee Preparation Steps Animation ---
(function () {
    const steps = document.querySelectorAll('.cs-step');
    const dots = document.querySelectorAll('.step-dot');
    const playBtn = document.getElementById('csPlayBtn');
    const progressFill = document.getElementById('csProgressFill');
    if (!steps.length || !dots.length) return;

    let current = 0;
    let playing = false;
    let timer = null;
    let progressTimer = null;
    const STEP_DURATION = 3000;
    const PROGRESS_INTERVAL = 30;

    function goToStep(idx) {
        steps.forEach((s, i) => {
            s.classList.remove('active', 'exit-left');
            if (i < idx) s.classList.add('exit-left');
        });
        dots.forEach((d, i) => {
            d.classList.remove('active', 'done');
            if (i < idx) d.classList.add('done');
            if (i === idx) d.classList.add('active');
        });
        steps[idx].classList.add('active');
        current = idx;
    }

    function nextStep() {
        const next = (current + 1) % steps.length;
        goToStep(next);
    }

    function startAutoPlay() {
        playing = true;
        playBtn.classList.add('playing');
        let elapsed = 0;
        progressFill.style.width = '0%';

        progressTimer = setInterval(() => {
            elapsed += PROGRESS_INTERVAL;
            const pct = (elapsed / STEP_DURATION) * 100;
            progressFill.style.width = Math.min(pct, 100) + '%';
        }, PROGRESS_INTERVAL);

        timer = setInterval(() => {
            elapsed = 0;
            progressFill.style.width = '0%';
            nextStep();
        }, STEP_DURATION);
    }

    function stopAutoPlay() {
        playing = false;
        playBtn.classList.remove('playing');
        clearInterval(timer);
        clearInterval(progressTimer);
        progressFill.style.width = '0%';
    }

    playBtn.addEventListener('click', () => {
        if (playing) stopAutoPlay();
        else startAutoPlay();
    });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            if (playing) stopAutoPlay();
            goToStep(i);
        });
    });

    // Start auto-play when section scrolls into view
    const section = document.querySelector('.coffee-steps-section');
    if (section) {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !playing) {
                    startAutoPlay();
                } else if (!entry.isIntersecting && playing) {
                    stopAutoPlay();
                }
            });
        }, { threshold: 0.3 });
        obs.observe(section);
    }
})();

// --- CINEMATIC: Scroll Progress Bar ---
(function () {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    function update() {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
        bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
})();

// --- CINEMATIC: Section Indicator ---
(function () {
    const indicator = document.getElementById('sectionIndicator');
    if (!indicator) return;
    const dots = indicator.querySelectorAll('.si-dot');
    const sections = document.querySelectorAll('.cinema-section');
    if (!sections.length) return;

    // Show indicator after loading
    setTimeout(() => indicator.classList.add('visible'), 3500);

    // Click to scroll
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const idx = parseInt(dot.dataset.section);
            if (sections[idx]) {
                sections[idx].scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Update active dot on scroll
    function updateActive() {
        let current = 0;
        sections.forEach((sec, i) => {
            const rect = sec.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.5) {
                current = i;
            }
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }
    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
})();

// --- CINEMATIC: Scroll Reveal (cinema-line, scroll-reveal) ---
(function () {
    const reveals = document.querySelectorAll('.cinema-line, .scroll-reveal');
    if (!reveals.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseFloat(entry.target.dataset.delay) || 0;
                setTimeout(() => entry.target.classList.add('visible'), delay * 1000);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(el => obs.observe(el));
})();

// --- CINEMATIC: Counter Animation ---
(function () {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                const duration = 1500;
                const start = performance.now();

                function tick(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.round(eased * target);
                    if (progress < 1) requestAnimationFrame(tick);
                    else el.textContent = target;
                }
                requestAnimationFrame(tick);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => obs.observe(c));
})();

// --- CINEMATIC: Parallax on hero content + scroll hint click ---
(function () {
    const hero = document.querySelector('.hero-section');
    const content = document.querySelector('.hero-content');
    const scrollHint = document.querySelector('.scroll-hint');
    if (!hero || !content) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const vh = window.innerHeight;
        if (scrolled < vh * 1.5) {
            const pct = scrolled / vh;
            content.style.transform = `translateY(${pct * 80}px)`;
            content.style.opacity = 1 - pct * 1.2;
            if (scrollHint) {
                scrollHint.style.opacity = Math.max(0, 1 - pct * 3);
            }
        }
    }, { passive: true });

    if (scrollHint) {
        scrollHint.addEventListener('click', () => {
            const next = document.querySelector('.cinema-section:nth-of-type(2)');
            if (next) {
                next.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
})();

// --- Page transition curtain between pages ---
(function () {
    const pt = document.createElement('div');
    pt.className = 'page-transition';
    pt.innerHTML = '<div class="pt-curtain pt-curtain-top"></div><div class="pt-curtain pt-curtain-bottom"></div>';
    document.body.appendChild(pt);

    document.addEventListener('click', function (e) {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href') || '';
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
        if (link.target === '_blank' || link.hasAttribute('download')) return;
        if (!/\.html(\?|#|$)/.test(href)) return;
        e.preventDefault();
        pt.classList.add('active');
        setTimeout(() => { window.location.href = href; }, 550);
    });
})();

// --- Skeleton shimmer while images load ---
(function () {
    document.querySelectorAll('img').forEach(img => {
        if (img.complete) return;
        img.classList.add('img-loading');
        const done = () => img.classList.remove('img-loading');
        img.addEventListener('load', done);
        img.addEventListener('error', done);
    });
})();
