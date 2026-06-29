const startTime = Date.now();

// Force scroll to top on refresh
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
});

document.addEventListener("DOMContentLoaded", () => {
    window.scrollTo(0, 0);
    setTimeout(() => { window.scrollTo(0, 0); }, 50);

    /* Lenis Scroll */
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis();
        window.lenis = lenis;

        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            ScrollTrigger.config({ ignoreMobileResize: true }); // Prevent random layout jumps on scroll
            
            // Sync Lenis scroll with ScrollTrigger
            lenis.on('scroll', ScrollTrigger.update);
            
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            
            gsap.ticker.lagSmoothing(0, 0);
        } else {
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }

        // Handle anchor links with Lenis
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                
                if (href === '#') {
                    lenis.scrollTo(0);
                    return;
                }

                const target = document.querySelector(href);
                if (target) {
                    let scrollTarget = target;
                    
                    // If the section is pinned by ScrollTrigger, scroll to its exact calculated start position
                    if (typeof ScrollTrigger !== 'undefined') {
                        const st = ScrollTrigger.getAll().find(s => s.trigger === target && s.pin);
                        if (st) {
                            scrollTarget = st.start;
                        }
                    }
                    
                    lenis.scrollTo(scrollTarget, { offset: 0 });
                }
            });
        });
    }

    // Sticky Navbar Logic
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.remove('bg-transparent');
            header.classList.add('bg-[#1A110C]/80', 'backdrop-blur-md');
        } else {
            header.classList.add('bg-transparent');
            header.classList.remove('bg-[#1A110C]/80', 'backdrop-blur-md');
        }
    });

    // Preloader Logic
    const preloader = document.getElementById('preloader');
    
    // GSAP Timelines for entry animations - Paused initially
    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 }, paused: true });

    // Navbar animation
    tl.fromTo(".logo-anim", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.8 })
      .fromTo(".nav-links-anim li", { opacity: 0, y: -10 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 }, "-=0.5")
      .fromTo(".cta-anim", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6 }, "-=0.4");

    // Hero content animation
    tl.fromTo(".hero-subtitle", { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.2")
      .fromTo(".hero-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2 }, "-=0.6")
      .fromTo(".hero-text", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, "-=0.8")
      .fromTo(".hero-btn-container", { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.8")
      .fromTo(".hero-content-right > div", { opacity: 0, x: 20 }, { opacity: 1, x: 0, stagger: 0.1, duration: 0.8 }, "-=1.0");

    // Wait for at least 3 seconds before hiding preloader
    window.addEventListener('load', () => {
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, 3000 - elapsed);
        
        setTimeout(() => {
            if (preloader) {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                    tl.play(); // Start GSAP animations
                }, 1000); // Wait for transition-opacity duration
            } else {
                if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                tl.play();
            }
        }, remainingTime);
    });

    // Mobile Menu Logic
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn && closeMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('translate-x-full');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
            gsap.fromTo(".mobile-link", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, delay: 0.3 });
        });

        const closeMenu = () => {
            mobileMenu.classList.add('translate-x-full');
            document.body.style.overflow = '';
        };

        closeMenuBtn.addEventListener('click', closeMenu);
        mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
    }

    // Statement Section Animations
    if (typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        // Hero Section Canvas Animation
        const heroCanvas = document.getElementById('hero-canvas');
        const heroSection = document.getElementById('hero-section');
        if (heroCanvas && heroSection) {
            const context = heroCanvas.getContext('2d');
            const heroFrameCount = 192;
            const heroImages = [];
            const heroSeq = { frame: 0 };
            
            // Preload hero images
            for (let i = 1; i <= heroFrameCount; i++) {
                const img = new Image();
                img.src = `./assets/Coffee_hero_section/${String(i).padStart(5, '0')}.webp`;
                heroImages.push(img);
            }
            
            // Set canvas size based on first image
            heroImages[0].onload = () => {
                heroCanvas.width = heroImages[0].width;
                heroCanvas.height = heroImages[0].height;
                context.drawImage(heroImages[0], 0, 0);
            };
            
            const renderHeroFrame = () => {
                if (heroImages[heroSeq.frame] && heroImages[heroSeq.frame].complete) {
                    context.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
                    context.drawImage(heroImages[heroSeq.frame], 0, 0);
                }
            };
            
            gsap.to(heroSeq, {
                frame: heroFrameCount - 1,
                snap: "frame",
                ease: "none",
                scrollTrigger: {
                    trigger: heroSection,
                    start: "top top",
                    end: "+=2000",
                    scrub: true,
                    pin: true,
                    anticipatePin: 1
                },
                onUpdate: renderHeroFrame
            });
        }

        // Bestsellers Slider Animation (5-Card Horizontal Scroll)
        const sliderSection = document.getElementById('bestsellers-slider');
        const cardsContainer = document.getElementById('slider-cards-container');
        const sliderDragArea = document.getElementById('slider-drag-area');
        const bgContainer = document.getElementById('slider-bg-container');
        const cards = document.querySelectorAll('.slider-card');
        const bgs = document.querySelectorAll('.slider-bg');
        const titleEl = document.getElementById('slider-title');
        const descEl = document.getElementById('slider-desc');
        const priceEl = document.getElementById('slider-price');

        if (sliderSection && cardsContainer && cards.length > 0) {
            const cardData = [
                { title: "Caramel<br>Latte", desc: "Experience the perfect blend of rich espresso and velvety caramel, topped with a delicate foam.", price: "$4.50" },
                { title: "Classic<br>Cappuccino", desc: "A traditional Italian favorite featuring equal parts espresso, steamed milk, and airy milk froth.", price: "$3.80" },
                { title: "Pure<br>Espresso", desc: "A concentrated shot of our finest dark roast, delivering a bold and intense flavor profile.", price: "$2.50" },
                { title: "Iced<br>Macchiato", desc: "Chilled milk poured over ice and marked with a robust shot of espresso for a refreshing lift.", price: "$4.00" },
                { title: "Mocha<br>Frappe", desc: "An indulgent frozen blend of rich chocolate, espresso, and milk, finished with whipped cream.", price: "$5.00" }
            ];
            let currentIndex = 0;
            let textAnim = null;

            const updateSliderActive = (index) => {
                if (currentIndex === index) return;
                
                if (cards[currentIndex]) {
                    cards[currentIndex].classList.remove('border-[#D5A071]', 'opacity-100');
                    cards[currentIndex].classList.add('border-transparent', 'opacity-50');
                }
                
                currentIndex = index;
                
                if (cards[currentIndex]) {
                    cards[currentIndex].classList.remove('border-transparent', 'opacity-50');
                    cards[currentIndex].classList.add('border-[#D5A071]', 'opacity-100');
                }
                
                if (titleEl && cardData[currentIndex]) {
                    const newTitle = cardData[currentIndex].title;
                    const newDesc = cardData[currentIndex].desc;
                    const newPrice = cardData[currentIndex].price;

                    if (textAnim) textAnim.kill();

                    textAnim = gsap.timeline();

                    // Animate out fast
                    textAnim.to([titleEl, descEl, priceEl], {
                        opacity: 0,
                        scale: 0.98,
                        filter: "blur(4px)",
                        duration: 0.1,
                        ease: "power1.in",
                        onComplete: () => {
                            // Swap content when fully hidden
                            if (titleEl) titleEl.innerHTML = newTitle;
                            if (descEl) descEl.innerHTML = newDesc;
                            if (priceEl) priceEl.innerHTML = newPrice;
                            // Reset filter in case GSAP leaves a remnant
                            gsap.set([titleEl, descEl, priceEl], { clearProps: "filter" });
                        }
                    })
                    // Animate in fast
                    .fromTo([titleEl, descEl, priceEl], 
                        { scale: 1.02, opacity: 0, filter: "blur(4px)" },
                        { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.15, ease: "power2.out" }
                    );
                }
            };

                // Calculate exact slide distance to ensure movement
                const getSlideDistance = () => {
                    const cardWidth = cards[0].offsetWidth;
                    const gap = parseInt(window.getComputedStyle(cardsContainer).gap) || 24;
                    return (cardWidth + gap) * (cards.length - 1);
                };

                // Clone first 3 cards to fill the empty right-side gap when reaching the last card
                const clonesCount = 3;
                for (let i = 0; i < clonesCount; i++) {
                    if (cards[i]) {
                        const clone = cards[i].cloneNode(true);
                        // Ensure clones are visually inactive
                        clone.classList.remove('border-[#D5A071]', 'opacity-100');
                        clone.classList.add('border-transparent', 'opacity-50');
                        cardsContainer.appendChild(clone);
                    }
                }

                const slideDistance = getSlideDistance();
                const scrollDistance = 2500; // Total vertical scroll allocated for the slider

                const sliderAnim = gsap.timeline({
                    scrollTrigger: {
                        trigger: sliderSection,
                        start: "top top",
                        end: "+=" + scrollDistance,
                        scrub: true,
                        pin: true,
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            let progress = self.progress;
                            if (progress === 1) progress = 0.999;
                            const index = Math.floor(progress * cards.length);
                            updateSliderActive(index);
                        }
                    }
                });

                sliderAnim.to(cardsContainer, {
                    x: -slideDistance,
                    ease: "none",
                    duration: cards.length - 1
                }, 0);

                if (bgContainer) {
                    bgs.forEach((bg, i) => {
                        if (i > 0) {
                            sliderAnim.to(bg, {
                                x: "0%",
                                ease: "none",
                                duration: 1
                            }, i - 1);
                        }
                    });
                }

                // Manual Drag to Scroll mapping
                if (sliderDragArea) {
                    let isDragging = false;
                    let dragHasMoved = false;
                    let startX;
                    let startScrollY;

                    const startDrag = (e) => {
                        isDragging = true;
                        dragHasMoved = false;
                        startX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX;
                        startScrollY = window.scrollY;
                        sliderDragArea.classList.add('cursor-grabbing');
                        sliderDragArea.classList.remove('cursor-grab');
                    };

                    const stopDrag = () => {
                        isDragging = false;
                        sliderDragArea.classList.remove('cursor-grabbing');
                        sliderDragArea.classList.add('cursor-grab');
                    };

                    const doDrag = (e) => {
                        if (!isDragging) return;
                        e.preventDefault();
                        const currentX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX;
                        
                        if (Math.abs(startX - currentX) > 5) {
                            dragHasMoved = true;
                        }
                        
                        // Exact 1:1 mapping: 1px of horizontal drag = exactly 1px of horizontal visual slide
                        const dragRatio = scrollDistance / slideDistance;
                        const walk = (startX - currentX) * dragRatio; 
                        
                        if (window.lenis) {
                            window.lenis.scrollTo(startScrollY + walk, { immediate: true });
                        } else {
                            window.scrollTo(0, startScrollY + walk);
                        }
                    };

                    sliderDragArea.addEventListener('mousedown', startDrag);
                    sliderDragArea.addEventListener('touchstart', startDrag, {passive: true});
                    
                    window.addEventListener('mouseup', stopDrag);
                    window.addEventListener('touchend', stopDrag);
                    
                    sliderDragArea.addEventListener('mousemove', doDrag);
                    sliderDragArea.addEventListener('touchmove', doDrag, {passive: false});
                    
                    // Click to Auto-Slide logic
                    cards.forEach((card, idx) => {
                        card.style.pointerEvents = 'auto';
                        card.classList.add('cursor-pointer');
                        
                        card.addEventListener('click', (e) => {
                            if (dragHasMoved) return; // Prevent click if user was dragging
                            
                            const st = sliderAnim.scrollTrigger;
                            if (st) {
                                const targetProgress = idx / (cards.length - 1);
                                const targetScroll = st.start + (targetProgress * scrollDistance);
                                
                                if (window.lenis) {
                                    window.lenis.scrollTo(targetScroll, { duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
                                } else {
                                    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
                                }
                            }
                        });
                    });
                }
        }


        // Text Color Animation
        gsap.to(".color-word", {
            scrollTrigger: {
                trigger: ".statement-text",
                start: "top 85%",
                end: "bottom 60%",
                scrub: true
            },
            color: "#33251A",
            stagger: 0.05
        });

        // Statement Section: scroll-driven full-screen zoom per pill image.
        // Uses CSS sticky + a tall wrapper div so the section stays on-screen for
        // all 3 images without conflicting with adjacent GSAP-pinned sections.
        const statementSection = document.getElementById('statement-section');
        const zoomOverlay      = document.getElementById('statement-zoom-overlay');
        const zoomImg          = document.getElementById('statement-zoom-img');
        const zoomTextContainer = document.getElementById('statement-zoom-text');
        const zoomTitle         = document.getElementById('statement-zoom-title');
        const zoomDesc          = document.getElementById('statement-zoom-desc');
        const pillWrappersList = Array.from(document.querySelectorAll('.anim-pill'));
        
        const zoomTextData = [
            { title: "PURE ORIGIN", desc: "Handpicked beans from the world's finest high-altitude coffee farms." },
            { title: "ARTISAN CRAFT", desc: "Poured with passion, every cup is a masterpiece of flavor and balance." },
            { title: "BOLD ROAST", desc: "Expertly roasted to unlock intense, unforgettable notes in every sip." }
        ];

        if (statementSection && zoomOverlay && zoomImg && pillWrappersList.length > 0) {

            const pillSrcs = pillWrappersList.map(pill => {
                const img = pill.querySelector('img');
                return img ? img.src : '';
            });

            const scrollPerImage = 1000;               // px of scroll per image cycle
            const totalScroll    = pillSrcs.length * scrollPerImage; // 3000 for 3 images

            // ── We will use GSAP's native pin instead of CSS sticky ────────────
            statementSection.style.zIndex   = '1';

            // ── Pill rects (read while section is at top of viewport) ────────
            let pillRects  = [];
            let lastPillIdx = -1;

            const eio = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

            const readPillRects = () => {
                const sRect = statementSection.getBoundingClientRect();
                pillRects = pillWrappersList.map(pill => {
                    const r = pill.getBoundingClientRect();
                    return {
                        topPct:    ((r.top - sRect.top)       / sRect.height) * 100,
                        leftPct:   ((r.left - sRect.left)     / sRect.width)  * 100,
                        bottomPct: ((sRect.bottom - r.bottom) / sRect.height) * 100,
                        rightPct:  ((sRect.right - r.right)   / sRect.width)  * 100,
                    };
                });
            };

            // ── ScrollTrigger with GSAP Pinning ─────────────────
            ScrollTrigger.create({
                trigger: statementSection,
                start:   'top top',
                end:     '+=' + totalScroll,
                pin:     true,
                scrub:   true,
                invalidateOnRefresh: true,

                onRefresh() { readPillRects(); },
                onEnter()   { readPillRects(); },

                onUpdate(self) {
                    if (!pillRects.length) readPillRects();

                    const progress = self.progress;
                    // Keep last pill in its close phase when progress = 1
                    const rawIdx  = Math.min(progress * pillSrcs.length, pillSrcs.length - 0.001);
                    const pillIdx = Math.floor(rawIdx);
                    const p       = rawIdx - pillIdx; // 0‥1 within this pill's segment

                    // Swap image source when crossing into a new pill
                    if (pillIdx !== lastPillIdx) {
                        lastPillIdx   = pillIdx;
                        zoomImg.src   = pillSrcs[pillIdx];
                        if (zoomTitle && zoomDesc && zoomTextData[pillIdx]) {
                            zoomTitle.innerText = zoomTextData[pillIdx].title;
                            zoomDesc.innerText = zoomTextData[pillIdx].desc;
                        }
                    }

                    const r = pillRects[pillIdx];
                    if (!r) return;

                    let opacity, top, left, bottom, right, scale, bRadius;

                    if (p < 0.30) {
                        // ── OPEN: clip grows from pill → full screen
                        const t = eio(p / 0.30);
                        opacity = t;
                        top     = r.topPct    * (1 - t);
                        left    = r.leftPct   * (1 - t);
                        bottom  = r.bottomPct * (1 - t);
                        right   = r.rightPct  * (1 - t);
                        scale   = 1.25 - 0.25 * t;
                        bRadius = 12 * (1 - t);

                    } else if (p < 0.70) {
                        // ── HOLD: full screen + gentle Ken Burns
                        const holdT = (p - 0.30) / 0.40;
                        opacity = 1;
                        top = left = bottom = right = 0;
                        scale   = 1.0 + 0.04 * holdT;
                        bRadius = 0;

                    } else {
                        // ── CLOSE: full screen shrinks back to pill
                        const t = eio((p - 0.70) / 0.30);
                        opacity = 1 - t;
                        top     = r.topPct    * t;
                        left    = r.leftPct   * t;
                        bottom  = r.bottomPct * t;
                        right   = r.rightPct  * t;
                        scale   = 1.04 + 0.21 * t;
                        bRadius = 12 * t;
                    }

                    zoomOverlay.style.opacity       = opacity;
                    zoomOverlay.style.webkitClipPath = `inset(${top}% ${right}% ${bottom}% ${left}% round ${bRadius}px)`;
                    zoomOverlay.style.clipPath       = `inset(${top}% ${right}% ${bottom}% ${left}% round ${bRadius}px)`;
                    zoomImg.style.transform          = `scale(${scale})`;
                    zoomOverlay.style.pointerEvents  = opacity > 0.05 ? 'auto' : 'none';
                    
                    // Add text animation during hold phase
                    if (zoomTextContainer && zoomTitle && zoomDesc) {
                        if (p >= 0.25 && p <= 0.75) {
                            let textAlpha = 0;
                            if (p < 0.35) {
                                textAlpha = (p - 0.25) / 0.10; // fade in
                            } else if (p > 0.65) {
                                textAlpha = 1 - ((p - 0.65) / 0.10); // fade out
                            } else {
                                textAlpha = 1;
                            }
                            const easeAlpha = 1 - Math.pow(1 - textAlpha, 3);
                            zoomTextContainer.style.opacity = textAlpha;
                            zoomTitle.style.transform = `translateY(${(1 - easeAlpha) * 30}px)`;
                            zoomDesc.style.transform = `translateY(${(1 - easeAlpha) * 30}px)`;
                        } else {
                            zoomTextContainer.style.opacity = 0;
                        }
                    }
                }
            });
        }

        // Pill Curtain Animations (Triggered, not scrubbed)
        const pills = document.querySelectorAll(".anim-pill");
        pills.forEach((wrapper) => {
            const line = wrapper.closest(".statement-line");
            const revealLeft = wrapper.querySelector(".anim-reveal.left");
            const revealRight = wrapper.querySelector(".anim-reveal.right");

            if (!line || !revealLeft || !revealRight) return;

            gsap.set(wrapper, { width: 0 });
            gsap.set([revealLeft, revealRight], { xPercent: 0 });

            // Create a dedicated timeline for each pill to prevent overlapping tween glitches
            const tl = gsap.timeline({ paused: true });
            tl.to(wrapper, { width: "3.5em", duration: 0.9, ease: "power3.inOut" }, 0)
              .to(revealLeft, { xPercent: -100, duration: 0.9, ease: "power3.inOut" }, 0)
              .to(revealRight, { xPercent: 100, duration: 0.9, ease: "power3.inOut" }, 0.05);

            ScrollTrigger.create({
                trigger: line,
                start: "top 95%",
                // onLeave intentionally removed — with the 3000px sticky wrapper,
                // GSAP thinks the line scrolls past "bottom 5%" and would close
                // the pill, hiding the images between zoom cycles.
                onEnter:     () => tl.play(),
                onEnterBack: () => tl.play(),
                onLeaveBack: () => tl.reverse()  // still close if scrolling back up
            });
        });

        // Bestsellers Coverflow Gallery Animation
        const gallerySection = document.getElementById('bestsellers-section');
        if (gallerySection) {
            // Preload Image Sequence for video effect
            const frameCount = 375;
            const sequenceImages = [];
            for (let i = 1; i <= frameCount; i++) {
                const img = new Image();
                img.src = `./assets/coffee_frames/${String(i).padStart(5, '0')}.webp`;
                sequenceImages.push(img);
            }
            const seqObj = { frame: 0 };
            const sequenceImg = document.getElementById('sequence-img');

            const tlGallery = gsap.timeline({
                scrollTrigger: {
                    trigger: gallerySection,
                    start: "top top",
                    end: "+=5000",
                    scrub: true,
                    pin: true,
                    invalidateOnRefresh: true
                }
            });

            // Fade out title, collapse side cards and gaps
            tlGallery.to(".gallery-title", { opacity: 0, y: -50, duration: 0.5 }, 0)
                     .to(".gallery-container", { gap: 0, duration: 0.8, ease: "power2.inOut" }, 0)
                     .to(".gallery-card:not(.center-card)", { width: 0, opacity: 0, duration: 0.8, ease: "power2.inOut" }, 0)
                     
            // Expand center card to fill the screen
                     .to(".center-card", {
                         width: "100vw",
                         height: "100vh",
                         borderRadius: "0px",
                         duration: 1,
                         ease: "power2.inOut"
                     }, 0);

            // Play the image sequence on scroll
            const expandedContent = document.querySelector('.expanded-content');
            let isGalleryTextVisible = false;
            let galleryTextsTl = null;

            if (expandedContent) {
                const centerText = expandedContent.querySelector('.text-center');
                const leftTexts = Array.from(expandedContent.children).filter(el => !el.classList.contains('text-center') && !el.classList.contains('text-right'));
                const rightTexts = Array.from(expandedContent.children).filter(el => el.classList.contains('text-right'));

                galleryTextsTl = gsap.timeline({ paused: true });
                
                if (centerText) {
                    galleryTextsTl.fromTo(centerText, 
                        { scale: 0.8, opacity: 0 }, 
                        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.5)" }
                    );
                }
                if (leftTexts.length > 0) {
                    galleryTextsTl.fromTo(leftTexts, 
                        { x: -60, opacity: 0 }, 
                        { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }, 
                        "-=0.4"
                    );
                }
                if (rightTexts.length > 0) {
                    galleryTextsTl.fromTo(rightTexts, 
                        { x: 60, opacity: 0 }, 
                        { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }, 
                        "-=0.5"
                    );
                }
            }

            if (sequenceImg) {
                tlGallery.to(seqObj, {
                    frame: frameCount - 1,
                    snap: "frame",
                    ease: "none",
                    onUpdate: () => {
                        const frameIdx = Math.round(seqObj.frame);
                        if (sequenceImages[frameIdx] && sequenceImages[frameIdx].complete && sequenceImages[frameIdx].naturalWidth > 0) {
                            sequenceImg.src = sequenceImages[frameIdx].src;
                        }
                        
                        // Show text overlay only between frames 42 and 222
                        if (expandedContent) {
                            if (frameIdx >= 41 && frameIdx <= 221) {
                                expandedContent.style.opacity = "1";
                                if (!isGalleryTextVisible && galleryTextsTl) {
                                    isGalleryTextVisible = true;
                                    galleryTextsTl.play();
                                }
                            } else {
                                expandedContent.style.opacity = "0";
                                if (isGalleryTextVisible && galleryTextsTl) {
                                    isGalleryTextVisible = false;
                                    galleryTextsTl.reverse();
                                }
                            }
                        }
                    },
                    duration: 8
                }, 1.5);
            }
        }

        // --- Generic Section Text Reveal Animations --- //
        
        // 1. Statement Section lines — "play none none none" so they stay
        //    visible throughout the sticky 3-image zoom sequence.
        //    (Using "reverse" caused text to hide after image 1 because GSAP's
        //    scroll position advanced 3000px past the trigger end.)
        const statementLines = document.querySelectorAll('.statement-line');
        statementLines.forEach((line, index) => {
            gsap.from(line, {
                scrollTrigger: {
                    trigger: line,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                x: index % 2 === 0 ? -50 : 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });
        });

        // 2. Interactive Machine Section Elements
        const machineLeft = document.querySelector('#interactive-machine-section .lg\\:w-1\\/2:first-child');
        const machineRight = document.querySelector('#interactive-machine-section .lg\\:w-1\\/2:last-child');
        
        if (machineLeft) {
            gsap.from(machineLeft, {
                scrollTrigger: { trigger: '#interactive-machine-section', start: "top 70%", toggleActions: "play reverse play reverse" },
                x: -60, opacity: 0, duration: 1, ease: "power3.out"
            });
        }
        if (machineRight) {
            gsap.from(machineRight, {
                scrollTrigger: { trigger: '#interactive-machine-section', start: "top 70%", toggleActions: "play reverse play reverse" },
                x: 60, opacity: 0, duration: 1, ease: "power3.out"
            });
        }

        // 2.5 Promo Banner Section
        const promoSection = document.getElementById('promo-banner-section');
        if (promoSection) {
            const flexContainer = promoSection.querySelector('.max-w-\\[1200px\\]');
            if (flexContainer && flexContainer.children.length >= 2) {
                const promoLeft = flexContainer.children[0];
                const promoRight = flexContainer.children[1];
                const promoBadge = promoLeft.querySelector('.w-24.h-24');

                // Animate left image container
                gsap.from(promoLeft, {
                    scrollTrigger: { trigger: promoSection, start: "top 80%", toggleActions: "play reverse play reverse" },
                    x: -80, opacity: 0, duration: 1, ease: "power3.out"
                });

                // Pop and spin the 50% off badge
                if (promoBadge) {
                    gsap.from(promoBadge, {
                        scrollTrigger: { trigger: promoSection, start: "top 75%", toggleActions: "play reverse play reverse" },
                        scale: 0, rotation: -180, opacity: 0, duration: 0.8, delay: 0.4, ease: "back.out(1.5)"
                    });
                }

                // Stagger animate the right content (text, button, contacts)
                if (promoRight) {
                    gsap.from(promoRight.children, {
                        scrollTrigger: { trigger: promoSection, start: "top 80%", toggleActions: "play reverse play reverse" },
                        x: 60, opacity: 0, duration: 0.8, stagger: 0.1, delay: 0.2, ease: "power3.out"
                    });
                }
            }
        }

        // 3. Contact Us Section
        const contactFormContainer = document.querySelector('#contact-section .lg\\:w-3\\/5');
        const contactImageContainer = document.querySelector('#contact-section .lg\\:w-2\\/5');
        
        if (contactFormContainer) {
            // Animate title and subtitle down
            gsap.from(contactFormContainer.querySelectorAll('h2, p'), {
                scrollTrigger: { trigger: contactFormContainer, start: "top 80%", toggleActions: "play reverse play reverse" },
                y: -30, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out"
            });
            // Animate form up
            gsap.from(contactFormContainer.querySelector('form'), {
                scrollTrigger: { trigger: contactFormContainer, start: "top 80%", toggleActions: "play reverse play reverse" },
                y: 50, opacity: 0, duration: 0.8, delay: 0.2, ease: "power3.out"
            });
        }
        
        if (contactImageContainer) {
            gsap.from(contactImageContainer, {
                scrollTrigger: { trigger: contactImageContainer, start: "top 80%", toggleActions: "play reverse play reverse" },
                x: 60, opacity: 0, duration: 1, ease: "power3.out"
            });
        }

        // 4. Footer Animation
        const footerCols = document.querySelectorAll('footer .grid > div');
        if (footerCols.length > 0) {
            gsap.from(footerCols, {
                scrollTrigger: { trigger: 'footer', start: "top 85%", toggleActions: "play reverse play reverse" },
                y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out"
            });
        }
        
        const footerBigText = document.querySelector('footer h1');
        if (footerBigText) {
            gsap.from(footerBigText, {
                scrollTrigger: { trigger: footerBigText, start: "top 95%", toggleActions: "play reverse play reverse" },
                y: 50, opacity: 0, scale: 0.95, duration: 1, ease: "power3.out"
            });
        }
        // --- CRITICAL FIX: Sort and Refresh ---
        // Because ScrollTriggers were created out of DOM order (bestsellers slider before statement section),
        // we must tell GSAP to sort them by their DOM position and refresh calculations.
        // This ensures pin spacers push subsequent sections down correctly.
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
    }

    // Custom Dropdown Logic
    const customDropdowns = document.querySelectorAll('.custom-dropdown');
    customDropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.custom-dropdown-btn');
        const menu = dropdown.querySelector('.dropdown-menu');
        const options = dropdown.querySelectorAll('.dropdown-option');
        const selectedText = dropdown.querySelector('.dropdown-selected-text');
        const input = dropdown.querySelector('input[type="hidden"]');
        const arrow = dropdown.querySelector('.dropdown-arrow');

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = !menu.classList.contains('opacity-0');
            
            // Close all other dropdowns first
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                m.classList.add('opacity-0', 'pointer-events-none');
                m.classList.remove('opacity-100', 'pointer-events-auto');
            });
            document.querySelectorAll('.dropdown-arrow').forEach(a => {
                a.classList.remove('rotate-180');
            });

            if (!isOpen) {
                // Calculate space for dynamic positioning
                const rect = btn.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                
                // Reset positioning classes
                menu.classList.remove('top-full', 'mt-2', 'bottom-full', 'mb-2');
                
                if (spaceBelow < 200) {
                    // If no space on bottom, show top
                    menu.classList.add('bottom-full', 'mb-2');
                } else {
                    // Show bottom
                    menu.classList.add('top-full', 'mt-2');
                }

                menu.classList.remove('opacity-0', 'pointer-events-none');
                menu.classList.add('opacity-100', 'pointer-events-auto');
                arrow.classList.add('rotate-180');
            }
        });

        options.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.getAttribute('data-value');
                selectedText.textContent = value;
                selectedText.classList.add('text-[#1A110C]');
                selectedText.classList.remove('text-[#1A110C]/60');
                input.value = value;
                
                menu.classList.add('opacity-0', 'pointer-events-none');
                menu.classList.remove('opacity-100', 'pointer-events-auto');
                arrow.classList.remove('rotate-180');
            });
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                m.classList.add('opacity-0', 'pointer-events-none');
                m.classList.remove('opacity-100', 'pointer-events-auto');
            });
            document.querySelectorAll('.dropdown-arrow').forEach(a => {
                a.classList.remove('rotate-180');
            });
        }
    });

    // Air Datepicker Initialization
    if (typeof AirDatepicker !== 'undefined') {
        new AirDatepicker('#date-picker', {
            locale: {
                days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                today: 'Today',
                clear: 'Clear',
                dateFormat: 'MMM dd, yyyy',
                timeFormat: 'hh:mm aa',
                firstDay: 0
            },
            minDate: new Date(),
            autoClose: true,
            position({$datepicker, $target, $pointer}) {
                let coords = $target.getBoundingClientRect();
                let dpHeight = $datepicker.clientHeight;
                let viewHeight = window.innerHeight;
                let spaceBelow = viewHeight - coords.bottom;
                
                // Hide pointer to simplify custom positioning
                if ($pointer) $pointer.style.display = 'none';
                
                let scrollY = window.scrollY || window.pageYOffset;
                let scrollX = window.scrollX || window.pageXOffset;
                
                let top = coords.bottom + scrollY + 10; // Default bottom
                
                if (spaceBelow < dpHeight + 20 && coords.top > dpHeight) {
                    // Show top if no space on bottom
                    top = coords.top + scrollY - dpHeight - 10;
                }
                
                $datepicker.style.left = (coords.left + scrollX) + 'px';
                $datepicker.style.top = top + 'px';
            }
        });
    }
    // Interactive Machine Section Logic
    const interactiveSection = document.getElementById('interactive-machine-section');
    if (interactiveSection) {
        const coffeeData = [
            {
                title: "Signature Espresso",
                desc: "Bold, Smooth And Unforgettable. The foundation of our coffee.",
                price: "$3.50", intensity: "Strong", roast: "Dark",
                img: "./assets/coffee_machine/cup_1.png"
            },
            {
                title: "Caramel Macchiato",
                desc: "Sweet, creamy, and topped with rich caramel drizzle.",
                price: "$4.80", intensity: "Medium", roast: "Medium",
                img: "./assets/coffee_machine/cup_2.png"
            },
            {
                title: "Vanilla Latte",
                desc: "A comforting blend of vanilla and smooth espresso.",
                price: "$4.50", intensity: "Mild", roast: "Light",
                img: "./assets/coffee_machine/cup_3.png"
            },
            {
                title: "Mocha Frappuccino",
                desc: "Chilled chocolatey perfection for warm summer days.",
                price: "$5.20", intensity: "Medium", roast: "Dark",
                img: "./assets/coffee_machine/cup_4.png"
            },
            {
                title: "Classic Americano",
                desc: "Simple, strong, and straightforward roasted flavor.",
                price: "$3.00", intensity: "Strong", roast: "Dark",
                img: "./assets/coffee_machine/cup_5.png"
            },
            {
                title: "Creamy Cappuccino",
                desc: "Perfectly frothed milk over a rich espresso base.",
                price: "$4.20", intensity: "Medium", roast: "Medium",
                img: "./assets/coffee_machine/cup_6.png"
            }
        ];

        const orbitContainer = document.getElementById('orbit-container');
        const trayImg = document.getElementById('tray-cup-img');
        const displayImg = document.getElementById('display-cup-img');
        const displayTitle = document.getElementById('display-title');
        const displayDesc = document.getElementById('display-desc');
        const displayPrice = document.getElementById('display-price');
        const displayIntensity = document.getElementById('display-intensity');
        const displayRoast = document.getElementById('display-roast');
        const machineVideo = document.getElementById('coffee-machine-video');
        
        let activeIndex = -1;
        const totalCups = coffeeData.length;

        // Create Cups
        coffeeData.forEach((coffee, index) => {
            const cupWrapper = document.createElement('div');
            cupWrapper.className = 'relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 cursor-pointer overflow-visible transform transition-all duration-300 hover:-translate-y-2 pointer-events-auto z-40';
            
            const img = document.createElement('img');
            img.src = coffee.img;
            img.className = 'w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] transition-all duration-300';
            
            cupWrapper.appendChild(img);
            orbitContainer.appendChild(cupWrapper);
            
            // Add Click Event
            cupWrapper.addEventListener('click', () => {
                setActiveCup(index);
            });
        });

        const cups = orbitContainer.querySelectorAll('div');

        let fallbackTimeout;
        let changeTimeout;

        function triggerNextCup() {
            const nextIndex = (activeIndex + 1) % totalCups;
            setActiveCup(nextIndex);
        }

        if (machineVideo) {
            machineVideo.addEventListener('ended', triggerNextCup);
        }

        function setActiveCup(index) {
            if (activeIndex === index) return;
            activeIndex = index;
            const coffee = coffeeData[index];

            // Highlight the active cup in the orbit
            if (cups && cups.length > 0) {
                cups.forEach((cup, idx) => {
                    const img = cup.querySelector('img');
                    if (idx === index) {
                        cup.classList.add('scale-110', '-translate-y-4');
                        if (img) {
                            img.classList.remove('drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]');
                            img.classList.add('drop-shadow-[0_0_20px_rgba(213,160,113,0.8)]');
                        }
                    } else {
                        cup.classList.remove('scale-110', '-translate-y-4');
                        if (img) {
                            img.classList.remove('drop-shadow-[0_0_20px_rgba(213,160,113,0.8)]');
                            img.classList.add('drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]');
                        }
                    }
                });
            }

            clearTimeout(fallbackTimeout);
            clearTimeout(changeTimeout);

            // Animate Tray (fade out old, fade in new with scale)
            trayImg.style.opacity = '0';
            trayImg.style.transform = 'scale(0.5)';
            
            // Animate Display Side Out
            displayTitle.style.opacity = '0';
            displayTitle.style.transform = 'translateY(15px)';
            displayDesc.style.opacity = '0';
            displayDesc.style.transform = 'translateY(15px)';
            displayImg.style.opacity = '0';
            displayImg.style.transform = 'scale(0.95)';
            if(displayPrice) { displayPrice.style.opacity = '0'; displayPrice.style.transform = 'translateY(15px)'; }
            if(displayIntensity) { displayIntensity.style.opacity = '0'; displayIntensity.style.transform = 'translateY(15px)'; }
            if(displayRoast) { displayRoast.style.opacity = '0'; displayRoast.style.transform = 'translateY(15px)'; }

            // Restart Video immediately on click
            if (machineVideo) {
                machineVideo.currentTime = 0;
                machineVideo.play().catch(e => {
                    console.log('Video autoplay blocked:', e);
                    fallbackTimeout = setTimeout(triggerNextCup, 4000);
                });
            }

            changeTimeout = setTimeout(() => {
                trayImg.src = coffee.img;
                displayImg.src = coffee.img;
                displayTitle.textContent = coffee.title;
                displayDesc.textContent = coffee.desc;
                if(displayPrice) displayPrice.textContent = coffee.price;
                if(displayIntensity) displayIntensity.textContent = coffee.intensity;
                if(displayRoast) displayRoast.textContent = coffee.roast;
                
                // Show Tray
                trayImg.style.opacity = '1';
                trayImg.style.transform = 'scale(1)';

                // Show Display In
                displayTitle.style.opacity = '1';
                displayTitle.style.transform = 'translateY(0)';
                displayDesc.style.opacity = '1';
                displayDesc.style.transform = 'translateY(0)';
                displayImg.style.opacity = '1';
                displayImg.style.transform = 'scale(1)';
                if(displayPrice) { displayPrice.style.opacity = '1'; displayPrice.style.transform = 'translateY(0)'; }
                if(displayIntensity) { displayIntensity.style.opacity = '1'; displayIntensity.style.transform = 'translateY(0)'; }
                if(displayRoast) { displayRoast.style.opacity = '1'; displayRoast.style.transform = 'translateY(0)'; }
                
                if (!machineVideo) {
                    fallbackTimeout = setTimeout(triggerNextCup, 4000);
                }
            }, 400); // Wait for fade out
        }

        // Set initial active cup (this will kick off the cycle)
        setActiveCup(0);
    }

    // Go To Top Button Logic
    const goToTopBtn = document.getElementById('go-to-top');
    if (goToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                goToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
                goToTopBtn.classList.add('opacity-100', 'pointer-events-auto');
            } else {
                goToTopBtn.classList.remove('opacity-100', 'pointer-events-auto');
                goToTopBtn.classList.add('opacity-0', 'pointer-events-none');
            }
        });

        goToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
