// Navigation Menu Toggle and Active State

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('button.lg\\:hidden');
    const navMenu = document.querySelector('nav');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            if (navMenu.classList.contains('hidden')) {
                navMenu.classList.remove('hidden');
                navMenu.classList.add('flex', 'flex-col', 'absolute', 'top-full', 'left-0', 'w-full', 'bg-white', 'dark:bg-background-dark', 'border-b-4', 'border-slate-900', 'p-6', 'gap-6', 'shadow-xl');
                navMenu.classList.remove('lg:flex', 'ml-8', 'border-l-2', 'pl-8');
            } else {
                navMenu.classList.add('hidden');
                navMenu.classList.remove('flex', 'flex-col', 'absolute', 'top-full', 'left-0', 'w-full', 'bg-white', 'dark:bg-background-dark', 'border-b-4', 'border-slate-900', 'p-6', 'gap-6', 'shadow-xl');
                navMenu.classList.add('lg:flex', 'ml-8', 'border-l-2', 'pl-8');
            }
        });
    }

    // 2. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (navMenu && !navMenu.classList.contains('hidden') && window.innerWidth < 1024) {
                    navMenu.classList.add('hidden');
                    navMenu.classList.remove('flex', 'flex-col', 'absolute', 'top-full');
                    navMenu.classList.add('lg:flex');
                }
                
                // Scroll with offset for fixed header
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
                window.scrollTo({
                     top: offsetPosition,
                     behavior: "smooth"
                });
            }
        });
    });

    // 3. Scroll Spy (Highlight active section)
    const sections = document.querySelectorAll("main > div[id]");
    const navLinks = document.querySelectorAll("nav a[href^='#']");

    const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                
                navLinks.forEach(link => {
                    link.classList.remove('text-slate-900', 'dark:text-white', 'border-b-4', 'border-accent-gold');
                    link.classList.add('text-slate-500', 'dark:text-slate-400', 'hover:text-primary', 'dark:hover:text-accent-gold', 'py-1');
                    
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.remove('text-slate-500', 'dark:text-slate-400', 'hover:text-primary', 'dark:hover:text-accent-gold');
                        link.classList.add('text-slate-900', 'dark:text-white', 'border-b-4', 'border-accent-gold');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
});
