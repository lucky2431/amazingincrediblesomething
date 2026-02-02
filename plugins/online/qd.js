// Quality+Mod.js - Покращена версія
// Оновлено для кращої продуктивності та додаткових функцій
// GitHub: https://github.com/ko31k/LMP

class QualityMod {
    constructor() {
        this.name = 'Quality+Mod Enhanced';
        this.version = '2.1';
        this.author = 'Enhanced by Community';
        
        // Конфігурація
        this.config = {
            enabled: true,
            showOnPosters: true,
            showOnCards: true,
            position: 'bottom-right', // 'bottom-right', 'top-right', 'bottom-left', 'top-left'
            size: 'normal', // 'small', 'normal', 'large'
            opacity: 0.9,
            showResolution: true,
            showCodec: true,
            showHDR: true,
            showAudio: false,
            customColors: {
                '4k': '#FF6B00',
                '1080p': '#00A8FF',
                '720p': '#00D166',
                '480p': '#9C27B0',
                '360p': '#FFC107',
                'hdr': '#FF4081',
                'dolby vision': '#9C27B0',
                'dolby atmos': '#00BCD4',
                '5.1': '#4CAF50'
            },
            animation: true,
            borderRadius: '4px',
            fontSize: '12px',
            padding: '2px 6px',
            margin: '4px'
        };
        
        // Словник якості
        this.qualityDict = {
            'uhd': '4K',
            '4k': '4K',
            '2160': '4K',
            '1440': '2K',
            '1080': '1080p',
            '720': '720p',
            '480': '480p',
            '360': '360p',
            'hdr': 'HDR',
            'dv': 'DV',
            'dolby vision': 'DV',
            'dolby atmos': 'DA',
            'atmos': 'DA',
            '5.1': '5.1',
            '7.1': '7.1',
            'hevc': 'HEVC',
            'avc': 'AVC',
            'vp9': 'VP9',
            'av1': 'AV1'
        };
        
        this.initialized = false;
        this.observer = null;
        
        console.log(`[${this.name}] v${this.version} завантажено`);
    }
    
    // Ініціалізація
    init() {
        if (this.initialized) return;
        
        this.injectStyles();
        this.setupObserver();
        this.processExistingElements();
        
        this.initialized = true;
        console.log(`[${this.name}] Ініціалізовано`);
    }
    
    // Ін'єкція CSS стилів
    injectStyles() {
        const styleId = 'quality-mod-styles';
        if (document.getElementById(styleId)) return;
        
        const styles = `
            .quality-badge {
                position: absolute;
                z-index: 10;
                background: rgba(0, 0, 0, ${this.config.opacity});
                color: white;
                font-weight: bold;
                font-size: ${this.config.fontSize};
                padding: ${this.config.padding};
                margin: ${this.config.margin};
                border-radius: ${this.config.borderRadius};
                pointer-events: none;
                user-select: none;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                gap: 2px;
                line-height: 1;
                ${this.config.animation ? 'transition: transform 0.2s ease, opacity 0.2s ease;' : ''}
            }
            
            .quality-badge:hover {
                ${this.config.animation ? 'transform: scale(1.05); opacity: 1 !important;' : ''}
            }
            
            .quality-badge.bottom-right {
                bottom: 0;
                right: 0;
            }
            
            .quality-badge.top-right {
                top: 0;
                right: 0;
            }
            
            .quality-badge.bottom-left {
                bottom: 0;
                left: 0;
            }
            
            .quality-badge.top-left {
                top: 0;
                left: 0;
            }
            
            .quality-badge.small {
                font-size: 10px;
                padding: 1px 4px;
            }
            
            .quality-badge.large {
                font-size: 14px;
                padding: 3px 8px;
            }
            
            .quality-badge.quality-4k {
                background: ${this.config.customColors['4k']} !important;
            }
            
            .quality-badge.quality-1080p {
                background: ${this.config.customColors['1080p']} !important;
            }
            
            .quality-badge.quality-720p {
                background: ${this.config.customColors['720p']} !important;
            }
            
            .quality-badge.quality-480p {
                background: ${this.config.customColors['480p']} !important;
            }
            
            .quality-badge.quality-360p {
                background: ${this.config.customColors['360p']} !important;
            }
            
            .quality-badge.quality-hdr {
                background: ${this.config.customColors['hdr']} !important;
            }
            
            .quality-badge.quality-dv {
                background: ${this.config.customColors['dolby vision']} !important;
            }
            
            .quality-badge.quality-da {
                background: ${this.config.customColors['dolby atmos']} !important;
            }
            
            .quality-badge.quality-51 {
                background: ${this.config.customColors['5.1']} !important;
            }
            
            .quality-icon {
                font-size: 0.9em;
            }
            
            .poster-container, .card-container {
                position: relative;
            }
            
            /* Адаптація для темної/світлої теми */
            @media (prefers-color-scheme: light) {
                .quality-badge {
                    text-shadow: none;
                    border: 1px solid rgba(255,255,255,0.2);
                }
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }
    
    // Налаштування MutationObserver
    setupObserver() {
        if (this.observer) this.observer.disconnect();
        
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Елемент
                        this.processNode(node);
                    }
                });
            });
        });
        
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Обробка існуючих елементів
    processExistingElements() {
        const posters = document.querySelectorAll('.poster, .card, [class*="poster"], [class*="card"]');
        posters.forEach(poster => this.processPoster(poster));
    }
    
    // Обробка нового вузла
    processNode(node) {
        // Шукаємо постера в доданих елементах
        const posters = node.querySelectorAll?.('.poster, .card, [class*="poster"], [class*="card"]') || [];
        posters.forEach(poster => this.processPoster(poster));
        
        // Якщо сам node є постером
        if (node.classList && 
            (node.classList.contains('poster') || 
             node.classList.contains('card') ||
             Array.from(node.classList).some(c => c.includes('poster') || c.includes('card')))) {
            this.processPoster(node);
        }
    }
    
    // Обробка конкретного постера
    processPoster(poster) {
        if (!this.config.enabled) return;
        if (!poster || poster.querySelector('.quality-badge')) return;
        
        // Знаходимо інформацію про якість
        const qualityInfo = this.extractQualityInfo(poster);
        if (!qualityInfo.length) return;
        
        // Створюємо бейдж
        this.createBadge(poster, qualityInfo);
    }
    
    // Витягнення інформації про якість
    extractQualityInfo(element) {
        const info = [];
        
        // Аналізуємо текст всього елемента
        const text = element.textContent.toLowerCase();
        
        // Перевіряємо роздільну здатність
        for (const [key, value] of Object.entries(this.qualityDict)) {
            if (text.includes(key.toLowerCase())) {
                // Уникаємо дублікатів
                if (!info.includes(value)) {
                    info.push(value);
                }
            }
        }
        
        // Перевіряємо атрибути data-
        Array.from(element.attributes).forEach(attr => {
            if (attr.name.startsWith('data-') && attr.value) {
                const attrValue = attr.value.toLowerCase();
                for (const [key, value] of Object.entries(this.qualityDict)) {
                    if (attrValue.includes(key.toLowerCase()) && !info.includes(value)) {
                        info.push(value);
                    }
                }
            }
        });
        
        // Перевіряємо дочірні елементи
        const childElements = element.querySelectorAll('[class*="quality"], [class*="resolution"], [class*="hd"]');
        childElements.forEach(child => {
            const childText = child.textContent.toLowerCase();
            for (const [key, value] of Object.entries(this.qualityDict)) {
                if (childText.includes(key.toLowerCase()) && !info.includes(value)) {
                    info.push(value);
                }
            }
        });
        
        // Сортуємо за пріоритетом
        return this.sortQualityInfo(info);
    }
    
    // Сортування інформації про якість
    sortQualityInfo(info) {
        const priority = ['4K', 'DV', 'HDR', 'DA', '2K', '1080p', '720p', '480p', '360p', 'HEVC', 'AV1', 'VP9', 'AVC', '5.1', '7.1'];
        return info.sort((a, b) => {
            const indexA = priority.indexOf(a);
            const indexB = priority.indexOf(b);
            
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            
            return indexA - indexB;
        });
    }
    
    // Створення бейджа
    createBadge(poster, qualityInfo) {
        // Знаходимо контейнер для постера
        let container = poster;
        while (container && !container.style.position && container !== document.body) {
            container = container.parentElement;
        }
        
        if (!container.style.position) {
            container.style.position = 'relative';
        }
        
        // Створюємо елемент бейджа
        const badge = document.createElement('div');
        badge.className = `quality-badge ${this.config.position} ${this.config.size}`;
        
        // Додаємо класи для кожної якості
        qualityInfo.forEach(q => {
            const cssClass = `quality-${q.toLowerCase().replace(/\s+/g, '')}`;
            badge.classList.add(cssClass);
        });
        
        // Додаємо іконки та текст
        qualityInfo.forEach((quality, index) => {
            const span = document.createElement('span');
            span.textContent = quality;
            
            // Додаємо іконку для певних типів якості
            if (quality === 'HDR' || quality === 'DV' || quality === 'DA') {
                span.classList.add('quality-icon');
            }
            
            badge.appendChild(span);
            
            // Додаємо роздільник (крім останнього)
            if (index < qualityInfo.length - 1) {
                const separator = document.createElement('span');
                separator.textContent = '·';
                separator.style.opacity = '0.7';
                separator.style.margin = '0 2px';
                badge.appendChild(separator);
            }
        });
        
        // Додаємо бейдж на постер
        poster.appendChild(badge);
        
        // Оптимізація: приховуємо бейдж при наведенні на навігаційні елементи
        this.setupHoverBehavior(poster, badge);
    }
    
    // Налаштування поведінки при наведенні
    setupHoverBehavior(poster, badge) {
        let hideTimeout;
        
        poster.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
            badge.style.opacity = '1';
        });
        
        poster.addEventListener('mouseleave', () => {
            badge.style.opacity = '0.8';
        });
        
        // Приховуємо бейдж при фокусі на навігаційних елементах
        const navElements = poster.querySelectorAll('button, a, [tabindex]');
        navElements.forEach(nav => {
            nav.addEventListener('focus', () => {
                hideTimeout = setTimeout(() => {
                    badge.style.opacity = '0.6';
                }, 300);
            });
            
            nav.addEventListener('blur', () => {
                clearTimeout(hideTimeout);
                badge.style.opacity = '0.8';
            });
        });
    }
    
    // Оновлення конфігурації
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        
        // Перезастосовуємо стилі
        const styleElement = document.getElementById('quality-mod-styles');
        if (styleElement) {
            styleElement.remove();
        }
        this.injectStyles();
        
        // Оновлюємо всі бейджи
        this.updateAllBadges();
        
        console.log(`[${this.name}] Конфігурація оновлена`);
    }
    
    // Оновлення всіх бейджів
    updateAllBadges() {
        const badges = document.querySelectorAll('.quality-badge');
        badges.forEach(badge => badge.remove());
        
        this.processExistingElements();
    }
    
    // Деструктор
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        const badges = document.querySelectorAll('.quality-badge');
        badges.forEach(badge => badge.remove());
        
        const styleElement = document.getElementById('quality-mod-styles');
        if (styleElement) {
            styleElement.remove();
        }
        
        this.initialized = false;
        console.log(`[${this.name}] Видалено`);
    }
    
    // Утиліта: перевірка підтримки
    static isSupported() {
        return typeof MutationObserver !== 'undefined';
    }
}

// Автоматична ініціалізація
if (typeof window !== 'undefined' && QualityMod.isSupported()) {
    // Затримка для завантаження DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.qualityMod = new QualityMod();
            window.qualityMod.init();
        });
    } else {
        window.qualityMod = new QualityMod();
        window.qualityMod.init();
    }
    
    // API для керування плагіном
    window.QualityModAPI = {
        getInstance: () => window.qualityMod,
        enable: () => window.qualityMod?.updateConfig({ enabled: true }),
        disable: () => window.qualityMod?.updateConfig({ enabled: false }),
        updateConfig: (config) => window.qualityMod?.updateConfig(config),
        destroy: () => window.qualityMod?.destroy()
    };
} else {
    console.warn('Quality+Mod: MutationObserver не підтримується');
}

// Експорт для модульних систем
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QualityMod;
}