(function () {
    'use strict';

    // --- Loading screen with particles + typewriter ---
    const loader = document.querySelector('.loading-screen');
    if (loader) {
        // Create particles
        const particlesContainer = document.getElementById('loadingParticles');
        if (particlesContainer) {
            for (let i = 0; i < 12; i++) {
                const p = document.createElement('div');
                p.className = 'loading-particle';
                p.style.animationDelay = (i * 0.25) + 's';
                p.style.animationDuration = (2.5 + Math.random() * 1.5) + 's';
                particlesContainer.appendChild(p);
            }
        }

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

        setTimeout(() => loader.classList.add('hide'), 3200);
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

    const orderSections = document.querySelectorAll('.order-section');

    orderSections.forEach(section => {
        const productName = section.dataset.product || 'القهوة التركي';
        const qtyBtns = section.querySelectorAll('.qty-btn');
        const addBtn = section.querySelector('.add-to-cart-btn');
        let selectedQty = 'ربع كيلو (250g)';

        qtyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                qtyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedQty = btn.dataset.qty;
            });
        });

        addBtn.addEventListener('click', () => {
            const existing = cart.find(i => i.name === productName && i.qty === selectedQty);
            if (existing) {
                existing.count++;
            } else {
                cart.push({ name: productName, qty: selectedQty, count: 1 });
            }
            saveCart();

            addBtn.textContent = '✓ تمت الإضافة';
            addBtn.classList.add('added');
            setTimeout(() => {
                addBtn.textContent = '🛒 أضف للسلة';
                addBtn.classList.remove('added');
            }, 1200);
        });
    });

    const cartBtn = document.getElementById('cartBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    const cartWhatsapp = document.getElementById('cartWhatsapp');

    function renderCart() {
        if (!cartItems) return;
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="cart-empty">السلة فاضية — أضف منتجات أولاً</p>';
            cartFooter.style.display = 'none';
            return;
        }

        cartFooter.style.display = 'block';
        let html = '';
        cart.forEach((item, idx) => {
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-qty">${item.qty}</span>
                    </div>
                    <div class="cart-item-controls">
                        <button class="cart-count-btn" data-idx="${idx}" data-action="minus">−</button>
                        <span class="cart-item-count">${item.count}</span>
                        <button class="cart-count-btn" data-idx="${idx}" data-action="plus">+</button>
                        <button class="cart-remove-btn" data-idx="${idx}">✕</button>
                    </div>
                </div>`;
        });
        cartItems.innerHTML = html;

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
                msg += `▪ ${item.name} — ${item.qty} × ${item.count}\n`;
            });
            msg += '\nالرجاء تأكيد الطلب والتوصيل.';
            const url = `https://wa.me/201282256742?text=${encodeURIComponent(msg)}`;
            window.open(url, '_blank');
        });
    }

    updateBadge();

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
