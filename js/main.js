const startTime = Date.now();

document.addEventListener("DOMContentLoaded", () => {
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
});
