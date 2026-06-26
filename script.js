/* ============================================================
   COMPLETE script.js — All Features Integrated
   Native Scroll + GSAP ScrollTrigger + Circular Ripple Audio
   Double-Click CTA Audio + Immediate Autoplay Volume Ramp
   Snappy Reveals + Lightbox Drag-to-Pan + Magnification Lens
   + Mobile Touch Sensor Cursor Trail
   ============================================================ */

(function() {
    let systemsActive = false;
    const loadingScreen = document.getElementById('loading-screen');
    const loaderPercent = document.getElementById('loader-percent');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let loadProgress = 0;
    const loadInterval = setInterval(function() {
        loadProgress += Math.floor(Math.random() * 18) + 4;
        if (loadProgress >= 100) {
            loadProgress = 100;
            clearInterval(loadInterval);
            setTimeout(function() {
                loadingScreen.classList.add('hidden-load');
                systemsActive = true;
                startAllSystems();
                initAudioAutoplay();
            }, 400);
        }
        loaderPercent.textContent = loadProgress + '%';
    }, 120);

    // ────────────────────────────────────────────────
    //  IMMEDIATE AUDIO AUTOPLAY BYPASS WITH VOLUME RAMP
    //  Uses autoplay+muted HTML tag then ramps to full volume
    // ────────────────────────────────────────────────
    var bgAudio = document.getElementById('bg-audio');
    var playBtn = document.getElementById('audio-play-btn');
    var progressFill = document.getElementById('audio-progress-fill');
    var progressContainer = document.getElementById('audio-progress');
    var audioHasStarted = false;

    function initAudioAutoplay() {
        if (!bgAudio) return;
        // Start at zero volume, unmute, and play immediately
        bgAudio.volume = 0;
        bgAudio.muted = false;

        var playPromise = bgAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(function() {
                audioHasStarted = true;
                // Ramp volume from 0 to 1 over 800ms
                rampAudioVolume(0, 1, 800);
            }).catch(function() {
                // Browser blocked — wait for first user interaction
                document.addEventListener('click', function once() {
                    if (audioHasStarted) return;
                    audioHasStarted = true;
                    bgAudio.volume = 0;
                    bgAudio.muted = false;
                    bgAudio.play().then(function() {
                        rampAudioVolume(0, 1, 800);
                    }).catch(function() {});
                    document.removeEventListener('click', once);
                }, { once: true });
            });
        }
    }

    function rampAudioVolume(from, to, duration) {
        if (!bgAudio) return;
        var startTime = Date.now();
        function ramp() {
            var elapsed = Date.now() - startTime;
            var progress = Math.min(elapsed / duration, 1);
            // ease-out cubic for smooth ramp
            var eased = 1 - Math.pow(1 - progress, 3);
            bgAudio.volume = from + (to - from) * eased;
            if (progress < 1) {
                requestAnimationFrame(ramp);
            }
        }
        requestAnimationFrame(ramp);
    }

    playBtn.addEventListener('click', function() {
        if (!bgAudio) return;
        if (bgAudio.paused) {
            if (bgAudio.volume < 0.01) bgAudio.volume = 1;
            bgAudio.play().catch(function() {});
        } else {
            bgAudio.pause();
        }
    });

    bgAudio.addEventListener('play', function() {
        playBtn.classList.remove('paused');
        playBtn.classList.add('playing');
        playBtn.title = 'Pause Background Audio';
    });
    bgAudio.addEventListener('pause', function() {
        playBtn.classList.remove('playing');
        playBtn.classList.add('paused');
        playBtn.title = 'Play Background Audio';
    });
    bgAudio.addEventListener('ended', function() {
        bgAudio.currentTime = 0;
        bgAudio.play();
    });
    bgAudio.addEventListener('timeupdate', function() {
        if (bgAudio.duration) {
            var pct = (bgAudio.currentTime / bgAudio.duration) * 100;
            if (window.innerWidth >= 768) progressFill.style.height = pct + '%';
            else progressFill.style.width = pct + '%';
        }
    });
    progressContainer.addEventListener('click', function(e) {
        var rect = progressContainer.getBoundingClientRect();
        var pct = window.innerWidth >= 768 ? (e.clientY - rect.top) / rect.height : (e.clientX - rect.left) / rect.width;
        pct = Math.max(0, Math.min(1, pct));
        bgAudio.currentTime = pct * bgAudio.duration;
    });

    var sharedAudioCtx = null;
    function getSharedAudioContext() {
        if (!sharedAudioCtx) sharedAudioCtx = new(window.AudioContext || window.webkitAudioContext)();
        return sharedAudioCtx;
    }
    function ensureAudioContextRunning() {
        var ctx = getSharedAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
    }
    document.addEventListener('click', ensureAudioContextRunning);
    document.addEventListener('touchstart', ensureAudioContextRunning);
    document.addEventListener('keydown', ensureAudioContextRunning);

    function startAllSystems() {
        initScrambleObserver();
        initTimer();
        initStars();
        initScrollReveals();
        initCursor();
        initTouchCursor();   // NEW: mobile touch cursor trail
        initVerticalNav();
        initOceanDrone();
        initCtaHoverSound();
        initCtaDoubleClickSound();
        initArtworkModal();
        initBigBlurDots();
        initLightboxDragPan();
    }

    // ────────────────────────────────────────────────
    //  SMOOTH INFINITE BIG BLUR DOTS
    // ────────────────────────────────────────────────
    function initBigBlurDots() {
        var dots = document.querySelectorAll('.big-blur-dot');
        dots.forEach(function(dot) {
            var leftPct = parseFloat(dot.style.left) || 50;
            var topPct = parseFloat(dot.style.top) || 50;
            var centerX = (leftPct / 100) * window.innerWidth;
            var centerY = (topPct / 100) * window.innerHeight;
            var amplitudeX = 100 + Math.random() * 160;
            var amplitudeY = 80 + Math.random() * 140;
            var freqX = 0.00025 + Math.random() * 0.00035;
            var freqY = 0.0002 + Math.random() * 0.0003;
            var phaseX = Math.random() * Math.PI * 2;
            var phaseY = Math.random() * Math.PI * 2;
            function move() {
                var t = Date.now() * 0.001;
                var x = centerX + Math.sin(t * freqX + phaseX) * amplitudeX;
                var y = centerY + Math.cos(t * freqY + phaseY) * amplitudeY;
                dot.style.left = x + 'px';
                dot.style.top = y + 'px';
                requestAnimationFrame(move);
            }
            move();
        });
        window.addEventListener('resize', function() {
            dots.forEach(function(dot) {
                if (!dot.dataset.centerX) {
                    dot.dataset.centerX = parseFloat(dot.style.left) || 50;
                    dot.dataset.centerY = parseFloat(dot.style.top) || 50;
                }
            });
        });
    }

    // ────────────────────────────────────────────────
    //  SNAPPY CINEMATIC SCROLL REVEALS (GSAP ScrollTrigger)
    //  Vision section: clean fade only, no complex stagger
    // ────────────────────────────────────────────────
    function initScrollReveals() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        function revealSection(sectionSelector, itemSelector, opts) {
            var section = document.querySelector(sectionSelector);
            if (!section) return;
            var items = section.querySelectorAll(itemSelector);
            if (!items.length) return;
            opts = opts || {};
            gsap.fromTo(items,
                { y: opts.y || 30, opacity: 0, scale: opts.scale || 1 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: opts.duration || 0.9,
                    ease: opts.ease || 'power3.out',
                    stagger: opts.stagger || 0.1,
                    scrollTrigger: {
                        trigger: section,
                        start: opts.start || 'top 80%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        }

        // ── Hero ──
        revealSection('#hero', '.scramble-target, .cta-primary, .inline-flex', {
            start: 'top 90%',
            stagger: 0.1,
            duration: 0.85,
        });
        var heroImg = document.querySelector('#hero .ease-in-img');
        if (heroImg) {
            gsap.fromTo(heroImg,
                { y: 30, opacity: 0, scale: 1.05 },
                {
                    y: 0, opacity: 1, scale: 1,
                    duration: 1.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '#hero',
                        start: 'top 88%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        }

        // ── Bio — Vision section: clean fade only for headers, cards get normal reveal ──
        // Vision cards: simple fade-in, no stagger
        var visionCards = document.querySelectorAll('#bio .vision-card');
        if (visionCards.length) {
            gsap.fromTo(visionCards,
                { y: 20, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 0.7,
                    ease: 'power2.out',
                    stagger: 0.08,
                    scrollTrigger: {
                        trigger: '#bio',
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        }
        // Vision headers: clean vertical ease-in fade
        var visionHeaders = document.querySelectorAll('#bio .vision-header');
        if (visionHeaders.length) {
            gsap.fromTo(visionHeaders,
                { y: 12, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 0.6,
                    ease: 'power2.out',
                    stagger: 0.04,
                    scrollTrigger: {
                        trigger: '#bio',
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        }
        // Bio badges
        var bioBadges = document.querySelectorAll('#bio .grid-badge');
        if (bioBadges.length) {
            gsap.fromTo(bioBadges,
                { y: 16, opacity: 0, scale: 0.97 },
                {
                    y: 0, opacity: 1, scale: 1,
                    duration: 0.55,
                    ease: 'power2.out',
                    stagger: 0.05,
                    scrollTrigger: {
                        trigger: '#bio',
                        start: 'top 78%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        }
        // Bio body scramble targets (paragraphs)
        var bioBodyTexts = document.querySelectorAll('#bio .vision-card .scramble-target.body-text');
        if (bioBodyTexts.length) {
            gsap.fromTo(bioBodyTexts,
                { y: 14, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 0.6,
                    ease: 'power2.out',
                    stagger: 0.06,
                    scrollTrigger: {
                        trigger: '#bio',
                        start: 'top 82%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        }

        // ── Timeline ──
        revealSection('#timeline', '.scramble-target', { start: 'top 85%', duration: 0.8 });
        var timelineCards = document.querySelectorAll('#timeline .card-studio');
        if (timelineCards.length) {
            gsap.fromTo(timelineCards,
                { y: 30, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                    stagger: 0.12,
                    scrollTrigger: {
                        trigger: '#timeline',
                        start: 'top 75%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        }
        var timelineImg = document.querySelector('#timeline .ease-in-img');
        if (timelineImg) {
            gsap.fromTo(timelineImg,
                { y: 20, opacity: 0, scale: 1.03 },
                {
                    y: 0, opacity: 1, scale: 1,
                    duration: 1.0,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: timelineImg.closest('.max-w-\\[1400px\\]') || timelineImg,
                        start: 'top 82%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        }

        // ── Showcase ──
        revealSection('#showcase', '.scramble-target, .cta-primary', { start: 'top 85%', duration: 0.85 });
        var masonryCards = document.querySelectorAll('#showcase .masonry-card');
        if (masonryCards.length) {
            gsap.fromTo(masonryCards,
                { y: 40, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 0.9,
                    ease: 'power3.out',
                    stagger: 0.12,
                    scrollTrigger: {
                        trigger: '#showcase',
                        start: 'top 80%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        }
        var masonryImages = document.querySelectorAll('#showcase .masonry-card .aspect-\\[4\\/5\\] img, #showcase .masonry-card .aspect-\\[3\\/4\\] img');
        if (masonryImages.length) {
            gsap.fromTo(masonryImages,
                { scale: 1.06, opacity: 0 },
                {
                    scale: 1, opacity: 1,
                    duration: 1.1,
                    ease: 'power3.out',
                    stagger: 0.12,
                    scrollTrigger: {
                        trigger: '#showcase',
                        start: 'top 80%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        }

        // ── Contact ──
        revealSection('#contact', '.scramble-target, .card-studio, .cta-primary', {
            start: 'top 85%',
            stagger: 0.12,
            duration: 0.85,
        });

        // ── Footer image ──
        var footerImg = document.querySelector('div.max-w-\\[1400px\\].mx-auto .ease-in-img');
        if (!footerImg) {
            var allEaseImgs = document.querySelectorAll('.ease-in-img');
            if (allEaseImgs.length) footerImg = allEaseImgs[allEaseImgs.length - 1];
        }
        if (footerImg && !footerImg.closest('#hero') && !footerImg.closest('#timeline')) {
            gsap.fromTo(footerImg,
                { y: 20, opacity: 0, scale: 1.02 },
                {
                    y: 0, opacity: 1, scale: 1,
                    duration: 0.9,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: footerImg,
                        start: 'top 92%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        }

        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }

    // ────────────────────────────────────────────────
    //  CTA HOVER SOUND
    // ────────────────────────────────────────────────
    function initCtaHoverSound() {
        var ctaAudio = new Audio('CTA-button.mp3');
        ctaAudio.volume = 0.4;
        function attach(el) {
            el.addEventListener('mouseenter', function() {
                ensureAudioContextRunning();
                ctaAudio.currentTime = 0;
                ctaAudio.play().catch(function() {});
            });
        }
        document.querySelectorAll('.cta-primary, .nav-link').forEach(attach);
        new MutationObserver(function() {
            document.querySelectorAll('.cta-primary:not([data-cta-hover]), .nav-link:not([data-cta-hover])').forEach(function(el) {
                el.setAttribute('data-cta-hover', 'true');
                attach(el);
            });
        }).observe(document.body, { childList: true, subtree: true });
    }

    // ────────────────────────────────────────────────
    //  DOUBLE-CLICK DUAL-LAYERED CTA AUDIO TRIGGER
    // ────────────────────────────────────────────────
    function initCtaDoubleClickSound() {
        var ctaAudio1 = new Audio('CTA-button.mp3');
        var ctaAudio2 = new Audio('CTA-button.mp3');
        ctaAudio1.volume = 0.45;
        ctaAudio2.volume = 0.35;

        function playDualLayered() {
            ensureAudioContextRunning();
            ctaAudio1.currentTime = 0;
            ctaAudio2.currentTime = 0;
            ctaAudio1.play().catch(function() {});
            setTimeout(function() {
                ctaAudio2.play().catch(function() {});
            }, 60);
        }

        function attachClick(el) {
            el.addEventListener('click', function(e) {
                playDualLayered();
            });
        }

        document.querySelectorAll('.cta-primary[data-cta-sound]').forEach(attachClick);
        new MutationObserver(function() {
            document.querySelectorAll('.cta-primary[data-cta-sound]:not([data-cta-double-click])').forEach(function(el) {
                el.setAttribute('data-cta-double-click', 'true');
                attachClick(el);
            });
        }).observe(document.body, { childList: true, subtree: true });
    }

    // ────────────────────────────────────────────────
    //  STARS
    // ────────────────────────────────────────────────
    function initStars() {
        var nodes = document.querySelectorAll('.star-node');
        var data = [];
        var palette = ['#FF4B4B', '#FF6B6B', '#FF8C28', '#FFB450', '#FFD700', '#FFA040', '#FFC870', '#FF3366', '#FF7800', '#FF9A3C', '#00E5FF', '#FF2D55'];
        function getCenter() {
            return {
                cx: window.innerWidth / 2,
                cy: window.innerHeight / 2,
                rx: window.innerWidth * 0.3,
                ry: window.innerHeight * 0.3,
            };
        }
        var center = getCenter();
        nodes.forEach(function(node) {
            var col = palette[Math.floor(Math.random() * palette.length)];
            node.style.backgroundColor = col;
            node.style.boxShadow = '0 0 14px ' + col + ', 0 0 35px ' + col + '66';
            var angle = Math.random() * Math.PI * 2;
            var dist = Math.random();
            var x = center.cx + Math.cos(angle) * center.rx * dist;
            var y = center.cy + Math.sin(angle) * center.ry * dist;
            node.style.left = x + 'px';
            node.style.top = y + 'px';
            data.push({
                el: node, x: x, y: y, angle: angle, dist: dist,
                speed: 0.0003 + Math.random() * 0.0007,
                wobbleAmp: 0.002 + Math.random() * 0.004,
                wobbleSpeed: 0.0005 + Math.random() * 0.001,
                wobbleOffset: Math.random() * Math.PI * 2,
            });
        });
        window.addEventListener('resize', function() { center = getCenter(); });
        function anim() {
            if (!systemsActive) { requestAnimationFrame(anim); return; }
            var now = Date.now() * 0.001;
            data.forEach(function(d) {
                d.angle += d.speed;
                var wobble = Math.sin(now * d.wobbleSpeed + d.wobbleOffset) * d.wobbleAmp;
                var distVariation = d.dist + wobble;
                distVariation = Math.max(0.05, Math.min(1, distVariation));
                var tx = center.cx + Math.cos(d.angle) * center.rx * distVariation;
                var ty = center.cy + Math.sin(d.angle) * center.ry * distVariation;
                d.x += (tx - d.x) * 0.03;
                d.y += (ty - d.y) * 0.03;
                d.el.style.left = d.x + 'px';
                d.el.style.top = d.y + 'px';
            });
            requestAnimationFrame(anim);
        }
        requestAnimationFrame(anim);
    }

    // ────────────────────────────────────────────────
    //  SCRAMBLE OBSERVER
    // ────────────────────────────────────────────────
    var scrambleObserver;
    function initScrambleObserver() {
        var chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEF';
        scrambleObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !entry.target.dataset.scrambled) {
                    entry.target.dataset.scrambled = 'true';
                    var el = entry.target;
                    el._originalHTML = el.innerHTML;
                    var finalHTML = el.dataset.original || el.innerText;
                    var tmp = document.createElement('div');
                    tmp.innerHTML = finalHTML;
                    var finalText = tmp.textContent || finalHTML;
                    var len = finalText.length;
                    var frame = 0;
                    var total = 18;
                    function tick() {
                        if (!systemsActive && frame < total * 0.25) { requestAnimationFrame(tick); return; }
                        frame++;
                        var prog = Math.min(frame / total, 1);
                        var display = '';
                        for (var i = 0; i < len; i++) {
                            display += Math.random() < prog ? finalText[i] : chars[Math.floor(Math.random() * chars.length)];
                        }
                        el.textContent = display;
                        if (prog < 1) requestAnimationFrame(tick);
                        else { el.innerHTML = el._originalHTML; }
                    }
                    requestAnimationFrame(tick);
                }
            });
        }, { threshold: 0.15 });
        document.querySelectorAll('.scramble-target').forEach(function(p) {
            if (!p.dataset.original) p.dataset.original = p.innerText;
            scrambleObserver.observe(p);
        });
    }

    // ────────────────────────────────────────────────
    //  TIMER
    // ────────────────────────────────────────────────
    function initTimer() {
        var el = document.getElementById('floating-timer');
        var start = Date.now();
        function upd() {
            var e = Date.now() - start;
            el.textContent = String(Math.floor(e / 3600000) % 24).padStart(2,'0') + ':' +
                String(Math.floor(e / 60000) % 60).padStart(2,'0') + ':' +
                String(Math.floor(e / 1000) % 60).padStart(2,'0') + ':' +
                String(e % 1000).padStart(3,'0');
            requestAnimationFrame(upd);
        }
        requestAnimationFrame(upd);
    }

    // ────────────────────────────────────────────────
    //  SCROLL PROGRESS BAR — native scroll
    // ────────────────────────────────────────────────
    var progressBar = document.getElementById('scroll-progress-bar');
    function updateProgressBar() {
        var scrollY = window.scrollY;
        var h = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.height = h > 0 ? Math.min((scrollY / h) * 100, 100) + '%' : '0%';
    }
    window.addEventListener('scroll', updateProgressBar, { passive: true });

    // ────────────────────────────────────────────────
    //  VERTICAL NAV — native scroll
    // ────────────────────────────────────────────────
    function initVerticalNav() {
        var secs = document.querySelectorAll('section[id]');
        var links = document.querySelectorAll('#nav-links .nav-link');
        function updateActiveLink() {
            var cur = '';
            var scrollY = window.scrollY;
            secs.forEach(function(s) { if (scrollY >= s.offsetTop - 160) cur = s.getAttribute('id'); });
            links.forEach(function(l) {
                l.classList.remove('active');
                if (l.getAttribute('href') === '#' + cur) l.classList.add('active');
            });
        }
        window.addEventListener('scroll', updateActiveLink, { passive: true });
    }

    // ────────────────────────────────────────────────
    //  CURSOR — Desktop mouse tracking
    // ────────────────────────────────────────────────
    var cursorDot, cursorRing;
    function initCursor() {
        cursorDot = document.getElementById('cursor-dot');
        cursorRing = document.getElementById('cursor-ring');
        var rx = 0, ry = 0;
        window.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (cursorDot) {
                cursorDot.style.left = mouseX + 'px';
                cursorDot.style.top = mouseY + 'px';
            }
        });
        function anim() {
            if (!cursorRing) { requestAnimationFrame(anim); return; }
            rx += (mouseX - rx) * 0.12;
            ry += (mouseY - ry) * 0.12;
            cursorRing.style.left = rx + 'px';
            cursorRing.style.top = ry + 'px';
            requestAnimationFrame(anim);
        }
        anim();
    }

    // ────────────────────────────────────────────────
    //  MOBILE TOUCH SENSOR CURSOR TRAIL
    //  Maps touchstart/touchmove to cursor elements
    // ────────────────────────────────────────────────
    var touchActive = false;
    var touchTimeout = null;

    function initTouchCursor() {
        var dot = document.getElementById('cursor-dot');
        var ring = document.getElementById('cursor-ring');
        if (!dot || !ring) return;

        function updateCursorPosition(x, y) {
            mouseX = x;
            mouseY = y;
            dot.style.left = x + 'px';
            dot.style.top = y + 'px';
            // Ring follows via the existing animation loop in initCursor()
        }

        function showCursor() {
            touchActive = true;
            dot.style.opacity = '1';
            ring.style.opacity = '0.7';
            if (touchTimeout) clearTimeout(touchTimeout);
        }

        function hideCursorAfterDelay() {
            touchTimeout = setTimeout(function() {
                touchActive = false;
                dot.style.opacity = '0.3';
                ring.style.opacity = '0.3';
            }, 800);
        }

        // Touch start — show cursor at touch point
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length === 1) {
                showCursor();
                updateCursorPosition(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        // Touch move — trail the cursor
        document.addEventListener('touchmove', function(e) {
            if (e.touches.length === 1) {
                showCursor();
                updateCursorPosition(e.touches[0].clientX, e.touches[0].clientY);
                // Reset hide timer
                if (touchTimeout) clearTimeout(touchTimeout);
            }
        }, { passive: true });

        // Touch end — fade cursor after delay
        document.addEventListener('touchend', function() {
            hideCursorAfterDelay();
        });

        // Touch cancel — fade immediately
        document.addEventListener('touchcancel', function() {
            hideCursorAfterDelay();
        });
    }

    // ────────────────────────────────────────────────
    //  OCEAN DRONE
    // ────────────────────────────────────────────────
    function initOceanDrone() {
        try {
            var ctx = getSharedAudioContext();
            ensureAudioContextRunning();
            var bufSize = 2 * ctx.sampleRate;
            var noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
            var out = noiseBuf.getChannelData(0);
            for (var i = 0; i < bufSize; i++) out[i] = Math.random() * 2 - 1;
            var white = ctx.createBufferSource();
            white.buffer = noiseBuf;
            white.loop = true;
            var lp = ctx.createBiquadFilter();
            lp.type = 'lowpass';
            lp.frequency.value = 200;
            lp.Q.value = 0.5;
            var gain = ctx.createGain();
            gain.gain.value = 0.03;
            white.connect(lp);
            lp.connect(gain);
            gain.connect(ctx.destination);
            white.start();
            setInterval(function() {
                lp.frequency.value = 160 + Math.sin(Date.now() * 0.0003) * 60;
                gain.gain.value = 0.02 + Math.sin(Date.now() * 0.0005) * 0.015;
            }, 200);
        } catch (e) {}
    }

    // ────────────────────────────────────────────────
    //  ADVANCED LIGHTBOX DRAG-TO-PAN + ZOOM
    //  Pauses autoplay on zoom, grab cursor, drag to pan
    // ────────────────────────────────────────────────
    var lightboxZoomLevel = 1;
    var lightboxMinZoom = 0.5;
    var lightboxMaxZoom = 3;
    var lightboxZoomStep = 0.15;
    var lightboxIsZoomed = false;

    // Drag state
    var isDragging = false;
    var dragStartX = 0;
    var dragStartY = 0;
    var translateX = 0;
    var translateY = 0;
    var dragStartTranslateX = 0;
    var dragStartTranslateY = 0;

    // Reference to stopAutoplay from artwork modal
    var lightboxStopAutoplayFn = null;

    function initLightboxDragPan() {
        var lb = document.getElementById('artwork-lightbox');
        var lbImg = document.getElementById('lightbox-img');
        var zoomBar = document.getElementById('lightbox-zoom-bar');
        var zoomFill = document.getElementById('lightbox-zoom-fill');
        var zoomLabel = document.getElementById('lightbox-zoom-label');

        if (!lb || !lbImg) return;

        function updateZoomUI() {
            if (!zoomFill || !zoomBar || !zoomLabel) return;
            var pct = ((lightboxZoomLevel - lightboxMinZoom) / (lightboxMaxZoom - lightboxMinZoom)) * 100;
            zoomFill.style.width = Math.max(0, Math.min(100, pct)) + '%';
            if (lightboxZoomLevel !== 1) {
                zoomBar.classList.add('visible');
                zoomLabel.classList.add('visible');
            } else {
                zoomBar.classList.remove('visible');
                zoomLabel.classList.remove('visible');
                setTimeout(function() {
                    if (lightboxZoomLevel === 1) {
                        zoomLabel.classList.remove('visible');
                    }
                }, 600);
            }
        }

        function applyTransform() {
            lbImg.style.transform = 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + lightboxZoomLevel + ')';
            if (lightboxZoomLevel > 1.05) {
                lbImg.classList.add('zoomed');
            } else {
                lbImg.classList.remove('zoomed');
                // Clamp translation back when at zoom 1
                if (translateX !== 0 || translateY !== 0) {
                    translateX = 0;
                    translateY = 0;
                    lbImg.style.transform = 'translate(0px, 0px) scale(' + lightboxZoomLevel + ')';
                }
            }
            updateZoomUI();
        }

        function resetZoom() {
            lightboxZoomLevel = 1;
            lightboxIsZoomed = false;
            translateX = 0;
            translateY = 0;
            isDragging = false;
            lbImg.classList.remove('dragging');
            applyTransform();
        }

        function onZoomChange() {
            applyTransform();
            // Pause autoplay when user zooms
            if (typeof lightboxStopAutoplayFn === 'function') {
                lightboxStopAutoplayFn();
            }
        }

        // Mousewheel scroll zoom
        lb.addEventListener('wheel', function(e) {
            if (!lb.classList.contains('open')) return;
            e.preventDefault();
            var delta = e.deltaY > 0 ? -lightboxZoomStep : lightboxZoomStep;
            lightboxZoomLevel = Math.max(lightboxMinZoom, Math.min(lightboxMaxZoom, lightboxZoomLevel + delta));
            onZoomChange();
        }, { passive: false });

        // Double-click magnification toggle
        lbImg.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            if (lightboxIsZoomed) {
                lightboxZoomLevel = 1;
                lightboxIsZoomed = false;
                translateX = 0;
                translateY = 0;
            } else {
                lightboxZoomLevel = 2;
                lightboxIsZoomed = true;
            }
            onZoomChange();
        });

        // ── Drag-to-pan ──
        lbImg.addEventListener('mousedown', function(e) {
            if (lightboxZoomLevel <= 1.05) return;
            e.preventDefault();
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            dragStartTranslateX = translateX;
            dragStartTranslateY = translateY;
            lbImg.classList.add('dragging');
        });

        window.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            var dx = e.clientX - dragStartX;
            var dy = e.clientY - dragStartY;
            translateX = dragStartTranslateX + dx;
            translateY = dragStartTranslateY + dy;
            applyTransform();
        });

        window.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                lbImg.classList.remove('dragging');
            }
        });

        // Touch support for drag-to-pan
        lbImg.addEventListener('touchstart', function(e) {
            if (lightboxZoomLevel <= 1.05) return;
            if (e.touches.length === 1) {
                isDragging = true;
                dragStartX = e.touches[0].clientX;
                dragStartY = e.touches[0].clientY;
                dragStartTranslateX = translateX;
                dragStartTranslateY = translateY;
                lbImg.classList.add('dragging');
            }
        }, { passive: false });

        lbImg.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            if (e.touches.length === 1) {
                e.preventDefault();
                var dx = e.touches[0].clientX - dragStartX;
                var dy = e.touches[0].clientY - dragStartY;
                translateX = dragStartTranslateX + dx;
                translateY = dragStartTranslateY + dy;
                applyTransform();
            }
        }, { passive: false });

        lbImg.addEventListener('touchend', function() {
            if (isDragging) {
                isDragging = false;
                lbImg.classList.remove('dragging');
            }
        });

        // Reset zoom on navigation
        var lbPrev = document.getElementById('lightbox-prev');
        var lbNext = document.getElementById('lightbox-next');
        if (lbPrev) lbPrev.addEventListener('click', function() { resetZoom(); });
        if (lbNext) lbNext.addEventListener('click', function() { resetZoom(); });

        // Reset zoom when closing
        var lbClose = document.getElementById('lightbox-close');
        if (lbClose) {
            lbClose.addEventListener('click', function() { resetZoom(); });
        }
        lb.addEventListener('click', function(e) {
            if (e.target === lb) { resetZoom(); }
        });

        // Reset zoom on new image load
        var observer = new MutationObserver(function() {
            resetZoom();
        });
        observer.observe(lbImg, { attributes: true, attributeFilter: ['src'] });

        // Expose zoom reset for external callers
        window._lightboxResetZoom = resetZoom;
    }

    // ────────────────────────────────────────────────
    //  ARTWORK MODAL
    // ────────────────────────────────────────────────
    function initArtworkModal() {
        var modal = document.getElementById('artwork-modal');
        var inner = document.getElementById('modal-details');
        var closeBtn = document.getElementById('modal-close');
        var modalProgress = document.getElementById('modal-scroll-progress');
        var modalContent = document.querySelector('.modal-content');
        var prevWorkBtn = document.getElementById('modal-prev-work');
        var nextWorkBtn = document.getElementById('modal-next-work');

        var lb = document.getElementById('artwork-lightbox');
        var lbImg = document.getElementById('lightbox-img');
        var lbClose = document.getElementById('lightbox-close');
        var lbPrev = document.getElementById('lightbox-prev');
        var lbNext = document.getElementById('lightbox-next');
        var autoplayBtn = document.getElementById('lightbox-autoplay-btn');

        var allCards = document.querySelectorAll('.masonry-card[data-artwork-id]');
        var totalWorks = allCards.length;
        var currentWorkIndex = -1;
        var currentArtworkImages = [];
        var currentLightboxIdx = 0;

        var autoplayTimer = null;
        var isAutoplayOn = false;
        var isModalTransitioning = false;

        function stopAutoplay() {
            if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
            isAutoplayOn = false;
            autoplayBtn.textContent = 'Play';
        }

        // Expose stopAutoplay to lightbox drag-pan module
        lightboxStopAutoplayFn = stopAutoplay;

        function startAutoplay() {
            stopAutoplay();
            if (!currentArtworkImages.length) return;
            isAutoplayOn = true;
            autoplayBtn.textContent = 'Pause';
            autoplayTimer = setInterval(function() {
                if (!lb.classList.contains('open')) { stopAutoplay(); return; }
                currentLightboxIdx = (currentLightboxIdx + 1) % currentArtworkImages.length;
                lbImg.style.opacity = '0';
                setTimeout(function() {
                    lbImg.src = currentArtworkImages[currentLightboxIdx] || '';
                    lbImg.style.opacity = '1';
                    if (window._lightboxResetZoom) window._lightboxResetZoom();
                }, 180);
            }, 5000);
        }

        autoplayBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (isAutoplayOn) stopAutoplay();
            else startAutoplay();
        });

        modalContent.addEventListener('scroll', function() {
            var h = modalContent.scrollHeight - modalContent.clientHeight;
            modalProgress.style.height = h > 0 ? (modalContent.scrollTop / h * 100) + '%' : '0%';
        });

        function showLightbox(srcs, si) {
            currentArtworkImages = srcs;
            currentLightboxIdx = si;
            if (window._lightboxResetZoom) window._lightboxResetZoom();
            lbImg.style.opacity = '0';
            setTimeout(function() {
                lbImg.src = currentArtworkImages[currentLightboxIdx] || '';
                lbImg.style.opacity = '1';
            }, 180);
            lb.classList.add('open');
            startAutoplay();
        }

        function hideLightbox() {
            lb.classList.remove('open');
            stopAutoplay();
            if (window._lightboxResetZoom) window._lightboxResetZoom();
        }

        function navigateLightbox(dir) {
            if (!currentArtworkImages.length) return;
            currentLightboxIdx = (currentLightboxIdx + dir + currentArtworkImages.length) % currentArtworkImages.length;
            if (window._lightboxResetZoom) window._lightboxResetZoom();
            lbImg.style.opacity = '0';
            setTimeout(function() {
                lbImg.src = currentArtworkImages[currentLightboxIdx] || '';
                lbImg.style.opacity = '1';
            }, 150);
            stopAutoplay();
        }

        lbClose.addEventListener('click', hideLightbox);
        lb.addEventListener('click', function(e) { if (e.target === lb) hideLightbox(); });
        lbPrev.addEventListener('click', function(e) { e.stopPropagation(); navigateLightbox(-1); });
        lbNext.addEventListener('click', function(e) { e.stopPropagation(); navigateLightbox(1); });
        document.addEventListener('keydown', function(e) {
            if (!lb.classList.contains('open')) return;
            if (e.key === 'ArrowLeft') { e.preventDefault(); navigateLightbox(-1); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); navigateLightbox(1); }
        });

        function openArtworkByIndex(index) {
            if (isModalTransitioning) return;
            if (index < 0) index = totalWorks - 1;
            if (index >= totalWorks) index = 0;
            isModalTransitioning = true;
            currentWorkIndex = index;
            var card = allCards[index];
            var d = card.dataset;
            var imgs = [d.image1, d.image2, d.image3].filter(Boolean);
            currentArtworkImages = imgs;

            var html = '';
            imgs.forEach(function(src, i) {
                var colorClass = (i % 2 === 0) ? 'lb-red' : 'lb-blue';
                html += '<div class="aspect-[4/3] rounded-lg overflow-hidden mb-4 cursor-pointer lightbox-trigger ' + colorClass + '" data-src-index="' + i + '"><img src="' + src + '" alt="Project image" class="w-full h-full object-cover"></div>';
            });

            inner.innerHTML = '<h2 class="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter text-zinc-100 heading-font mb-6">' + (d.title || 'Artwork Details') + '</h2>' +
                '<div class="grid grid-cols-1 md:grid-cols-2 gap-6">' +
                '<div>' + (html || '<p class="text-zinc-500">No additional images</p>') + '</div>' +
                '<div class="space-y-4 body-text">' +
                '<div><span class="block text-xs tracking-[0.2em] uppercase text-zinc-500">Client</span><p class="text-zinc-200 text-lg">' + (d.client || '—') + '</p></div>' +
                '<div><span class="block text-xs tracking-[0.2em] uppercase text-zinc-500">Industry</span><p class="text-zinc-200 text-lg">' + (d.industry || '—') + '</p></div>' +
                '<div><span class="block text-xs tracking-[0.2em] uppercase text-zinc-500">Service Years</span><p class="text-zinc-200 text-lg">' + (d.years || '—') + '</p></div>' +
                '<div><span class="block text-xs tracking-[0.2em] uppercase text-zinc-500">Artwork Type</span><p class="text-zinc-200 text-lg">' + (d.type || '—') + '</p></div>' +
                '<div><span class="block text-xs tracking-[0.2em] uppercase text-zinc-500">Summary</span><p class="text-zinc-300 leading-relaxed">' + (d.summary || '') + '</p></div>' +
                '</div></div>';

            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
            document.getElementById('main-wrapper').classList.add('blurred');
            modalProgress.style.height = '0%';
            modalContent.scrollTop = 0;

            prevWorkBtn.style.opacity = '1';
            prevWorkBtn.style.pointerEvents = 'auto';
            nextWorkBtn.style.opacity = '1';
            nextWorkBtn.style.pointerEvents = 'auto';

            modal.querySelectorAll('.lightbox-trigger').forEach(function(tr) {
                tr.addEventListener('click', function(ev) {
                    ev.stopPropagation();
                    showLightbox(imgs, parseInt(tr.dataset.srcIndex, 10));
                });
            });

            stopAutoplay();
            setTimeout(function() { isModalTransitioning = false; }, 200);
        }

        allCards.forEach(function(card, idx) {
            card.addEventListener('click', function(e) {
                if (e.target.closest('a')) return;
                e.stopPropagation();
                openArtworkByIndex(idx);
            });
        });

        prevWorkBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (!isModalTransitioning) openArtworkByIndex(currentWorkIndex - 1);
        });
        nextWorkBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (!isModalTransitioning) openArtworkByIndex(currentWorkIndex + 1);
        });

        function closeModal() {
            if (isModalTransitioning) return;
            modal.classList.remove('open');
            document.body.style.overflow = '';
            document.getElementById('main-wrapper').classList.remove('blurred');
            stopAutoplay();
        }

        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeModal();
        });
        modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (lb.classList.contains('open')) hideLightbox();
                else if (modal.classList.contains('open')) closeModal();
            }
        });
    }

    // ── Initialize cursor (desktop) and prepare for touch ──
    initCursor();
    initVerticalNav();
})();