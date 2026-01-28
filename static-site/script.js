// Site Configuration & Main Script
let config = {};
let currentLang = 'pt';

// Load configuration
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        config = await response.json();
        currentLang = localStorage.getItem('lang') || config.site?.language || 'pt';
        initSite();
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

// Initialize the site
function initSite() {
    populateContent();
    setupNavigation();
    setupLanguageSelector();
    setupMobileMenu();
    setupAnimations();
    lucide.createIcons();
}

// Get translated text
function getText(field) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[currentLang] || field.pt || '';
}

// Populate all content from config
function populateContent() {
    // Logo
    document.getElementById('logo-img').src = config.site?.logo || '';
    document.getElementById('footer-logo').src = config.site?.logo || '';
    
    // Hero
    document.getElementById('hero-video').querySelector('source').src = config.hero?.video_url || '';
    document.getElementById('hero-video').load();
    document.getElementById('hero-title').textContent = getText(config.hero?.title);
    document.getElementById('hero-subtitle').textContent = getText(config.hero?.subtitle);
    document.getElementById('hero-cta').textContent = getText(config.hero?.cta_text);
    
    // About
    document.getElementById('about-title').textContent = getText(config.about?.title);
    document.getElementById('about-p1').textContent = getText(config.about?.paragraph1);
    document.getElementById('about-p2').textContent = getText(config.about?.paragraph2);
    document.getElementById('about-img').src = config.about?.image || '';
    
    // Differentials
    const diffGrid = document.getElementById('differentials-grid');
    diffGrid.innerHTML = '';
    (config.differentials || []).forEach(diff => {
        const iconName = diff.icon || 'star';
        diffGrid.innerHTML += `
            <div class="differential-card">
                <div class="differential-icon">
                    <i data-lucide="${iconName}"></i>
                </div>
                <h3>${getText(diff.title)}</h3>
                <p>${getText(diff.description)}</p>
            </div>
        `;
    });
    
    // Areas
    const areasGrid = document.getElementById('areas-grid');
    areasGrid.innerHTML = '';
    (config.areas || []).forEach(area => {
        const badgeClass = area.is_specialty ? 'specialty' : '';
        const badgeText = area.is_specialty ? translations[currentLang]['areas.specialty'] : translations[currentLang]['areas.sector'];
        areasGrid.innerHTML += `
            <div class="area-card">
                <img src="${area.image}" alt="${getText(area.title)}">
                <div class="area-card-overlay"></div>
                <div class="area-card-content">
                    <span class="area-badge ${badgeClass}">${badgeText}</span>
                    <h3>${getText(area.title)}</h3>
                    <p>${getText(area.description)}</p>
                </div>
            </div>
        `;
    });
    
    // Stats
    const statsGrid = document.getElementById('stats-grid');
    statsGrid.innerHTML = '';
    (config.stats || []).forEach(stat => {
        statsGrid.innerHTML += `
            <div class="stat-item">
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${getText(stat.label)}</div>
            </div>
        `;
    });
    
    // Contact Info
    document.getElementById('contact-address').textContent = config.contact?.address || '';
    document.getElementById('contact-phone').textContent = config.contact?.phone || '';
    document.getElementById('contact-email').textContent = config.contact?.email || '';
    
    // Social Links
    const linkedin = config.contact?.linkedin || '';
    const instagram = config.contact?.instagram || '';
    const facebook = config.contact?.facebook || '';
    
    document.getElementById('social-linkedin').href = linkedin;
    document.getElementById('social-instagram').href = instagram;
    document.getElementById('social-facebook').href = facebook;
    document.getElementById('footer-linkedin').href = linkedin;
    document.getElementById('footer-instagram').href = instagram;
    document.getElementById('footer-facebook').href = facebook;
    
    // WhatsApp
    const whatsapp = config.contact?.whatsapp || '';
    document.getElementById('whatsapp-btn').href = `https://wa.me/${whatsapp.replace(/\D/g, '')}`;
    
    // Update static translations
    updateTranslations();
    
    // Re-create Lucide icons
    lucide.createIcons();
}

// Update static translations
function updateTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });
    
    // Update language button
    const flags = { pt: '🇧🇷', en: '🇺🇸', es: '🇪🇸' };
    document.querySelector('.lang-flag').textContent = flags[currentLang];
    document.querySelector('.lang-code').textContent = currentLang.toUpperCase();
}

// Setup navigation scroll effect
function setupNavigation() {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
            // Close mobile menu
            document.getElementById('nav-menu').classList.remove('open');
        });
    });
}

// Setup language selector
function setupLanguageSelector() {
    const btn = document.getElementById('lang-btn');
    const dropdown = document.getElementById('lang-dropdown');
    
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });
    
    document.addEventListener('click', () => {
        dropdown.classList.remove('open');
    });
}

// Change language
function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    populateContent();
    document.getElementById('lang-dropdown').classList.remove('open');
}

// Setup mobile menu
function setupMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('nav-menu');
    
    btn.addEventListener('click', () => {
        menu.classList.toggle('open');
    });
}

// Setup scroll animations
function setupAnimations() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Animate cards on scroll
    setTimeout(() => {
        document.querySelectorAll('.differential-card, .area-card, .stat-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }, 500);
    
    // Animate stat numbers
    const statsSection = document.querySelector('.stats');
    let statsAnimated = false;
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                animateStats();
            }
        });
    }, { threshold: 0.3 });
    
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
}

// Animate stat numbers
function animateStats() {
    document.querySelectorAll('.stat-value').forEach(el => {
        const text = el.textContent;
        const numMatch = text.match(/(\d+)/);
        if (numMatch) {
            const target = parseInt(numMatch[1]);
            const suffix = text.replace(/\d+/, '');
            let current = 0;
            const increment = Math.ceil(target / 50);
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                el.textContent = current + suffix;
            }, 30);
        }
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', loadConfig);
