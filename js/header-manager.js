// Header Management System for GiyaPay
class HeaderManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.checkAuthStatus();
        this.setupMainNavigation();
        this.updateSecondaryNavigation();
        this.bindEvents();
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                this.currentUser = await response.json();
            }
        } catch (error) {
            console.log('User not authenticated');
        }
    }

    setupMainNavigation() {
        const navbar = document.querySelector('.navbar .nav-menu-2');
        if (!navbar) return;

        // Always show the same main navigation regardless of authentication status
        navbar.innerHTML = `
            <a href="index.html" class="nav-hover w-nav-link">Home</a>
            <a href="index.html#features" class="nav-hover w-nav-link">Features</a>
            <a href="index.html#pricing" class="nav-hover w-nav-link">Pricing</a>
            <a href="blog.html" class="nav-hover w-nav-link">Blog</a>
            <a href="faq.html" class="nav-hover w-nav-link">FAQ</a>
            <a href="contact.html" class="nav-hover w-nav-link">Contact</a>
            <a href="https://calendly.com/salesbimstech/60min-1?back=1&amp;month=2021-10" target="_blank" class="button-6 w-button">Get A Demo</a>
            ${!this.currentUser ? '<a href="login.html" class="nav-hover w-nav-link" style="background: #667eea; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; margin-left: 10px;">Admin Login</a>' : ''}
        `;

        // Add current page highlighting
        this.highlightCurrentPage();
    }

    updateSecondaryNavigation() {
        // Remove existing secondary navigation
        const existingSecondaryNav = document.querySelector('.admin-secondary-nav');
        if (existingSecondaryNav) {
            existingSecondaryNav.remove();
        }

        if (this.currentUser) {
            // Create secondary navigation for authenticated users
            const secondaryNav = document.createElement('div');
            secondaryNav.className = 'admin-secondary-nav';
            
            // Get current path to determine correct link paths
            const currentPath = window.location.pathname;
            const isInAdminFolder = currentPath.includes('/admin/');
            const pathPrefix = isInAdminFolder ? '../' : '';
            
            secondaryNav.innerHTML = `
                <div class="admin-nav-container">
                    <div class="admin-nav-links">
                        <a href="${pathPrefix}dashboard.html" class="admin-nav-link">📊 Dashboard</a>
                        <a href="${pathPrefix}admin/create-post.html" class="admin-nav-link">✏️ Create Post</a>
                        <a href="${pathPrefix}admin/manage-posts.html" class="admin-nav-link">📝 Manage Posts</a>
                        <a href="${pathPrefix}analysis.html" class="admin-nav-link">📈 Analysis</a>
                        <a href="javascript:void(0)" onclick="logoutUser()" class="admin-nav-link logout">🚪 Logout</a>
                    </div>
                </div>
            `;

            // Insert secondary navigation after the main navbar
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                navbar.insertAdjacentElement('afterend', secondaryNav);
            }

            // Add styles if not already present
            this.addSecondaryNavStyles();
            
            // Show secondary nav immediately without delay to prevent blinking
            requestAnimationFrame(() => {
                secondaryNav.classList.add('show');
            });
        }
    }

    addSecondaryNavStyles() {
        // Check if styles are already added
        if (document.querySelector('#admin-secondary-nav-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'admin-secondary-nav-styles';
        styles.textContent = `
            /* Hide secondary nav initially to prevent blinking */
            .admin-secondary-nav {
                background: linear-gradient(135deg, #fa9f42 0%, #f03b6e 100%);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid rgba(255,255,255,0.1);
                padding: 12px 0;
                position: fixed;
                top: 85px;
                left: 0;
                right: 0;
                z-index: 998;
                box-shadow: 0 4px 20px rgba(250, 159, 66, 0.2);
                font-family: 'Inter', sans-serif;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.2s ease-out;
            }
            
            .admin-secondary-nav.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .admin-nav-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 20px;
            }
            
            .admin-nav-links {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .admin-nav-link {
                color: white;
                text-decoration: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 500;
                font-size: 14px;
                transition: all 0.3s ease;
                position: relative;
                white-space: nowrap;
                border: 1px solid transparent;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .admin-nav-link:hover {
                color: #fff;
                text-decoration: none;
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.3);
                transform: translateY(-1px);
                box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
            }
            
            .admin-nav-link.current {
                color: #fa9f42;
                background: rgba(255, 255, 255, 0.95);
                border-color: rgba(255, 255, 255, 0.3);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                font-weight: 600;
            }
            
            .admin-nav-link.logout {
                color: #fff;
                background: rgba(220, 53, 69, 0.8);
                border: 1px solid rgba(220, 53, 69, 0.3);
                margin-left: 16px;
            }
            
            .admin-nav-link.logout:hover {
                background: #dc3545;
                color: #fff;
                border-color: #dc3545;
                transform: translateY(-1px);
                box-shadow: 0 3px 8px rgba(220, 53, 69, 0.3);
            }

            /* Adjust body padding when secondary nav is present */
            body.has-secondary-nav {
                padding-top: 135px;
                transition: padding-top 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .admin-secondary-nav {
                    padding: 8px 0;
                    top: 70px;
                }
                
                .admin-nav-container {
                    padding: 0 15px;
                }
                
                .admin-nav-links {
                    gap: 8px;
                    justify-content: flex-start;
                    overflow-x: auto;
                    padding-bottom: 2px;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                
                .admin-nav-links::-webkit-scrollbar {
                    display: none;
                }
                
                .admin-nav-link {
                    font-size: 12px;
                    padding: 6px 12px;
                    border-radius: 5px;
                }
                
                .admin-nav-link.logout {
                    margin-left: 8px;
                }
                
                body.has-secondary-nav {
                    padding-top: 115px;
                }
            }

            /* Professional loading animation */
            @keyframes fadeInSlide {
                from {
                    opacity: 0;
                    transform: translateY(-100%);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        
        document.head.appendChild(styles);
        
        // Add class to body to adjust padding
        if (this.currentUser) {
            document.body.classList.add('has-secondary-nav');
        } else {
            document.body.classList.remove('has-secondary-nav');
        }
    }

    highlightCurrentPage() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-hover');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (currentPath.includes(href) || (href === 'index.html' && currentPath === '/'))) {
                link.classList.add('w--current');
            }
        });
    }

    bindEvents() {
        // No special events needed for secondary navigation
        // All functionality is handled through direct links and onclick handlers
        
        // Highlight current page in secondary nav
        this.highlightCurrentPageInSecondaryNav();
    }

    highlightCurrentPageInSecondaryNav() {
        const currentPath = window.location.pathname;
        const adminNavLinks = document.querySelectorAll('.admin-nav-link');
        
        adminNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('current'); // Remove current class from all links
            
            if (href && href !== '#' && href !== 'javascript:void(0)') {
                // Check for exact matches or dashboard special case
                if (currentPath.includes(href) || 
                    (href === 'dashboard.html' && currentPath.includes('dashboard')) ||
                    (href.includes('create-post') && currentPath.includes('create-post')) ||
                    (href.includes('manage-posts') && currentPath.includes('manage-posts')) ||
                    (href.includes('analysis') && currentPath.includes('analysis'))) {
                    link.classList.add('current');
                }
            }
        });
    }
}

// Global logout function
async function logoutUser() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = 'login.html';
    }
}

// Initialize header manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HeaderManager();
});

// Refresh header after login/logout
window.refreshHeader = async function() {
    const headerManager = new HeaderManager();
    await headerManager.init();
};

// Update header when authentication status changes
window.updateHeaderForAuth = async function() {
    const headerManager = new HeaderManager();
    await headerManager.checkAuthStatus();
    headerManager.setupMainNavigation();
    headerManager.updateSecondaryNavigation();
    headerManager.bindEvents();
}; 