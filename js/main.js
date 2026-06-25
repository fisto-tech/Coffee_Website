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
        const lenis = new Lenis({
            smooth: true,
            multiplier: 1,
            easing: (t) => t * (2 - t),
            smoothTouch: true,
            lerp: 0.05,
            duration: 1.2
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
        
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            ScrollTrigger.normalizeScroll(true);
        }
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
      .fromTo(".hero-btn-container", { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.8");

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

        // Text Color Animation
        gsap.to(".color-word", {
            scrollTrigger: {
                trigger: ".statement-text",
                start: "top 85%",
                end: "bottom 60%",
                scrub: 1
            },
            color: "#33251A",
            stagger: 0.05
        });

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
                start: "top 95%", // Play when line appears at the bottom
                end: "bottom 5%", // Reverse when line disappears at the top
                onEnter: () => tl.play(),
                onLeave: () => tl.reverse(),
                onEnterBack: () => tl.play(),
                onLeaveBack: () => tl.reverse()
            });
        });

        // Bestsellers Coverflow Gallery Animation
        const gallerySection = document.getElementById('bestsellers-section');
        if (gallerySection) {
            // Preload Image Sequence for video effect
            const frameCount = 381;
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
                    end: "+=5000", // Increased to give plenty of scrolling room for the video
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true // Recalculate on resize
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
                        
                        // Show text overlay only between frames 42 and 222 (indices 41 to 221)
                        if (expandedContent) {
                            if (frameIdx >= 41 && frameIdx <= 221) {
                                expandedContent.style.opacity = "1";
                            } else {
                                expandedContent.style.opacity = "0";
                            }
                        }
                    },
                    duration: 8
                }, 1.5); // Wait until expansion is complete before starting video
            }
        }
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
                img: "./assets/coffee_machine/cup_1.png"
            },
            {
                title: "Caramel Macchiato",
                desc: "Sweet, creamy, and topped with rich caramel drizzle.",
                img: "./assets/coffee_machine/cup_2.png"
            },
            {
                title: "Vanilla Latte",
                desc: "A comforting blend of vanilla and smooth espresso.",
                img: "./assets/coffee_machine/cup_3.png"
            },
            {
                title: "Mocha Frappuccino",
                desc: "Chilled chocolatey perfection for warm summer days.",
                img: "./assets/coffee_machine/cup_4.png"
            },
            {
                title: "Classic Americano",
                desc: "Simple, strong, and straightforward roasted flavor.",
                img: "./assets/coffee_machine/cup_5.png"
            },
            {
                title: "Creamy Cappuccino",
                desc: "Perfectly frothed milk over a rich espresso base.",
                img: "./assets/coffee_machine/cup_6.png"
            }
        ];

        const orbitContainer = document.getElementById('orbit-container');
        const trayImg = document.getElementById('tray-cup-img');
        const displayImg = document.getElementById('display-cup-img');
        const displayTitle = document.getElementById('display-title');
        const displayDesc = document.getElementById('display-desc');
        
        let activeIndex = -1;
        let rotationAngle = 0;
        const totalCups = coffeeData.length;
        
        // Responsive radii
        const getRadii = () => {
            const width = window.innerWidth;
            if (width < 640) { // sm
                return { x: 110, y: 150 };
            } else if (width < 1024) { // md and lg (tablet)
                return { x: 180, y: 240 };
            } else { // desktop
                return { x: 250, y: 320 };
            }
        };

        // Create Cups
        coffeeData.forEach((coffee, index) => {
            const cupWrapper = document.createElement('div');
            cupWrapper.className = 'absolute w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 cursor-pointer overflow-visible transform transition-all duration-300 hover:scale-125 pointer-events-auto z-40';
            
            const img = document.createElement('img');
            img.src = coffee.img;
            img.className = 'w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]';
            
            cupWrapper.appendChild(img);
            orbitContainer.appendChild(cupWrapper);
            
            // Add Click Event
            cupWrapper.addEventListener('click', () => {
                // Reset interval timer when user clicks
                clearInterval(autoCycleInterval);
                setActiveCup(index);
                startAutoCycle();
            });
        });

        const cups = orbitContainer.querySelectorAll('div');

        function updateOrbitPositions() {
            const radii = getRadii();
            cups.forEach((cup, i) => {
                const angle = rotationAngle + (i * (360 / totalCups));
                const rad = angle * (Math.PI / 180);
                const x = Math.cos(rad) * radii.x;
                const y = Math.sin(rad) * radii.y;
                
                // Adding depth sorting (closer cups should have higher z-index and be slightly larger)
                const zIndex = Math.round((Math.sin(rad) + 1) * 50) + 10;
                const scale = ((Math.sin(rad) + 1) * 0.2) + 0.8; // scale between 0.8 and 1.2
                
                cup.style.zIndex = zIndex;

                gsap.to(cup, {
                    x: x,
                    y: y,
                    scale: scale,
                    duration: 0.1,
                    ease: "none"
                });
            });
        }

        // Initialize positions
        updateOrbitPositions();

        // Handle Resize
        window.addEventListener('resize', updateOrbitPositions);

        // Animate orbit slowly
        gsap.to({ value: 0 }, {
            value: 360,
            duration: 25, // slower rotation
            repeat: -1,
            ease: "none",
            onUpdate: function() {
                rotationAngle = this.targets()[0].value;
                updateOrbitPositions();
            }
        });

        function setActiveCup(index) {
            if (activeIndex === index) return;
            activeIndex = index;
            const coffee = coffeeData[index];

            // Animate Tray (fade out old, fade in new with scale)
            trayImg.style.opacity = '0';
            trayImg.style.transform = 'scale(0.5)';
            
            // Animate Display Side
            displayTitle.style.opacity = '0';
            displayTitle.style.transform = 'translateY(15px)';
            displayDesc.style.opacity = '0';
            displayDesc.style.transform = 'translateY(15px)';
            displayImg.style.opacity = '0';
            displayImg.style.transform = 'scale(0.95)';

            setTimeout(() => {
                trayImg.src = coffee.img;
                displayImg.src = coffee.img;
                displayTitle.textContent = coffee.title;
                displayDesc.textContent = coffee.desc;
                
                // Show Tray
                trayImg.style.opacity = '1';
                trayImg.style.transform = 'scale(1)';

                // Show Display
                displayTitle.style.opacity = '1';
                displayTitle.style.transform = 'translateY(0)';
                displayDesc.style.opacity = '1';
                displayDesc.style.transform = 'translateY(0)';
                displayImg.style.opacity = '1';
                displayImg.style.transform = 'scale(1)';
            }, 400); // Wait for fade out
        }

        // Set initial active cup
        setActiveCup(0);

        // Auto Cycle
        let autoCycleInterval;
        function startAutoCycle() {
            autoCycleInterval = setInterval(() => {
                const nextIndex = (activeIndex + 1) % totalCups;
                setActiveCup(nextIndex);
            }, 4000); // Change every 4 seconds
        }
        
        startAutoCycle();
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
