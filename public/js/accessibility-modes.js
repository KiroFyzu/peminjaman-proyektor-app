// ============================================
// ACCESSIBILITY MODES JAVASCRIPT
// ============================================

class AccessibilityManager {
    constructor() {
        this.modes = {
            normal: 'normal',
            dark: 'dark-mode',
            highContrast: 'high-contrast',
            dyslexia: 'dyslexia-mode',
            colorblind: 'colorblind-mode',
            largeText: 'large-text'
        };
        
        this.currentMode = localStorage.getItem('accessibilityMode') || 'normal';
        this.init();
    }
    
    init() {
        this.loadSavedMode();
        this.createAccessibilityMenu();
        this.attachEventListeners();
        
        // Add keyboard shortcut (Alt + A)
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.toggleMenu();
            }
        });
    }
    
    loadSavedMode() {
        if (this.currentMode !== 'normal') {
            document.body.classList.add(this.currentMode);
        }
        
        // Update active button if menu exists
        setTimeout(() => {
            const activeBtn = document.querySelector(`[data-mode="${this.currentMode}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }
        }, 100);
    }
    
    createAccessibilityMenu() {
        const menuHTML = `
            <!-- Accessibility Toggle Button -->
            <button class="accessibility-toggle" id="accessibilityToggle" 
                    aria-label="Buka Menu Aksesibilitas" 
                    title="Tekan Alt+A untuk membuka menu">
                <i class="fas fa-universal-access"></i>
            </button>
            
            <!-- Accessibility Menu -->
            <div class="accessibility-menu" id="accessibilityMenu" style="display: none;">
                <h3>
                    <i class="fas fa-eye"></i> Mode Aksesibilitas
                </h3>
                
                <button data-mode="normal" title="Mode tampilan normal">
                    <i class="fas fa-circle"></i> Normal
                </button>
                
                <button data-mode="dark-mode" title="Mode gelap untuk kenyamanan mata">
                    <i class="fas fa-moon"></i> Mode Gelap
                </button>
                
                <button data-mode="high-contrast" title="Kontras tinggi untuk penglihatan rendah">
                    <i class="fas fa-adjust"></i> Kontras Tinggi
                </button>
                
                <button data-mode="dyslexia-mode" title="Font khusus untuk dyslexia">
                    <i class="fas fa-font"></i> Mode Dyslexia
                </button>
                
                <button data-mode="colorblind-mode" title="Ramah untuk buta warna">
                    <i class="fas fa-palette"></i> Mode Buta Warna
                </button>
                
                <button data-mode="large-text" title="Teks lebih besar">
                    <i class="fas fa-text-height"></i> Teks Besar
                </button>
                
                <hr style="margin: 10px 0; border-color: #e2e8f0;">
                
                <button id="resetAccessibility" style="background: #ef4444; color: white; border-color: #ef4444;">
                    <i class="fas fa-undo"></i> Reset ke Normal
                </button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', menuHTML);
    }
    
    attachEventListeners() {
        const toggle = document.getElementById('accessibilityToggle');
        const menu = document.getElementById('accessibilityMenu');
        const modeButtons = document.querySelectorAll('[data-mode]');
        const resetBtn = document.getElementById('resetAccessibility');
        
        // Toggle menu
        toggle.addEventListener('click', () => this.toggleMenu());
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                menu.style.display = 'none';
            }
        });
        
        // Mode buttons
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                this.setMode(mode);
                this.updateActiveButton(btn);
                this.showNotification(`Mode ${this.getModeName(mode)} diaktifkan`);
            });
        });
        
        // Reset button
        resetBtn.addEventListener('click', () => {
            this.setMode('normal');
            this.updateActiveButton(document.querySelector('[data-mode="normal"]'));
            this.showNotification('Mode direset ke Normal');
        });
    }
    
    toggleMenu() {
        const menu = document.getElementById('accessibilityMenu');
        const isHidden = menu.style.display === 'none';
        menu.style.display = isHidden ? 'block' : 'none';
        
        if (isHidden) {
            menu.style.animation = 'slideIn 0.3s ease';
        }
    }
    
    setMode(mode) {
        // Remove all mode classes
        Object.values(this.modes).forEach(modeClass => {
            if (modeClass !== 'normal') {
                document.body.classList.remove(modeClass);
            }
        });
        
        // Add new mode class
        if (mode !== 'normal') {
            document.body.classList.add(mode);
        }
        
        // Save to localStorage
        this.currentMode = mode;
        localStorage.setItem('accessibilityMode', mode);
        
        // Announce to screen readers
        this.announceToScreenReader(`Mode ${this.getModeName(mode)} diaktifkan`);
    }
    
    updateActiveButton(activeBtn) {
        document.querySelectorAll('[data-mode]').forEach(btn => {
            btn.classList.remove('active');
        });
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
    
    getModeName(mode) {
        const names = {
            'normal': 'Normal',
            'dark-mode': 'Gelap',
            'high-contrast': 'Kontras Tinggi',
            'dyslexia-mode': 'Dyslexia',
            'colorblind-mode': 'Buta Warna',
            'large-text': 'Teks Besar'
        };
        return names[mode] || 'Normal';
    }
    
    showNotification(message) {
        // Remove existing notification
        const existing = document.querySelector('.accessibility-notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'accessibility-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 600;
            animation: slideInFromRight 0.3s ease, fadeOut 0.3s ease 2.7s;
        `;
        notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            announcement.remove();
        }, 1000);
    }
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideInFromRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
    console.log('✅ Accessibility Manager initialized');
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading
} else {
    // DOM is already loaded
    window.accessibilityManager = new AccessibilityManager();
    console.log('✅ Accessibility Manager initialized (immediate)');
}
