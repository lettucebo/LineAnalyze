/**
 * Animation utilities for LINE Chat Analyzer
 * Adds interactive elements and animations to improve user experience
 */

class AnimationUtility {
    /**
     * Initialize animations 
     */
    static initAnimations() {
        // Add scroll animation for cards
        AnimationUtility.setupScrollAnimations();
        
        // Add hover effects for cards
        AnimationUtility.setupCardHoverEffects();
        
        // Add custom tooltip initialization
        AnimationUtility.setupCustomTooltips();
    }
    
    /**
     * Set up animations for elements as they scroll into view
     */
    static setupScrollAnimations() {
        // Add animation classes to elements that should animate on scroll
        document.querySelectorAll('.card, .section-title, .chart-container').forEach((el, index) => {
            el.classList.add('animate-on-scroll');
            el.style.animationDelay = `${index * 0.1}s`;
            el.style.opacity = '0';
        });
        
        // Function to check if element is in viewport
        const isInViewport = (el) => {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
                rect.bottom >= 0
            );
        };
        
        // Check elements on scroll
        const handleScroll = () => {
            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                if (isInViewport(el) && el.style.opacity === '0') {
                    el.style.opacity = '1';
                    el.classList.add('fadeInUp');
                }
            });
        };
        
        // Initial check and add scroll listener
        handleScroll();
        window.addEventListener('scroll', handleScroll);
    }
    
    /**
     * Set up hover effects for cards
     */
    static setupCardHoverEffects() {
        document.querySelectorAll('.stat-card').forEach(card => {
            // Add glow effect on hover
            card.addEventListener('mouseenter', function() {
                this.classList.add('card-hover-glow');
            });
            
            card.addEventListener('mouseleave', function() {
                this.classList.remove('card-hover-glow');
            });
            
            // Add pulse animation on first appearance
            card.classList.add('pulse-once');
            setTimeout(() => {
                card.classList.remove('pulse-once');
            }, 1000);
        });
    }
    
    /**
     * Set up custom tooltips
     */
    static setupCustomTooltips() {
        document.querySelectorAll('[data-custom-tooltip]').forEach(el => {
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = el.getAttribute('data-custom-tooltip');
            
            el.appendChild(tooltip);
            
            el.addEventListener('mouseenter', function() {
                tooltip.classList.add('show-tooltip');
            });
            
            el.addEventListener('mouseleave', function() {
                tooltip.classList.remove('show-tooltip');
            });
        });
    }
    
    /**
     * Add confetti effect when analysis is complete
     */
    static celebrateAnalysisComplete() {
        // Create confetti canvas if it doesn't exist
        let confettiCanvas = document.getElementById('confetti-canvas');
        
        if (!confettiCanvas) {
            confettiCanvas = document.createElement('canvas');
            confettiCanvas.id = 'confetti-canvas';
            confettiCanvas.style.position = 'fixed';
            confettiCanvas.style.top = '0';
            confettiCanvas.style.left = '0';
            confettiCanvas.style.width = '100%';
            confettiCanvas.style.height = '100%';
            confettiCanvas.style.pointerEvents = 'none';
            confettiCanvas.style.zIndex = '9999';
            document.body.appendChild(confettiCanvas);
        }
        
        // Simple confetti implementation
        const ctx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        
        const pieces = [];
        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#54a0ff', '#ff9ff3'];
        
        // Create confetti pieces
        for (let i = 0; i < 100; i++) {
            pieces.push({
                x: Math.random() * confettiCanvas.width,
                y: -20 - Math.random() * 100,
                size: 5 + Math.random() * 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 2,
                speedX: (Math.random() - 0.5) * 5,
                speedY: 1 + Math.random() * 5,
                opacity: 1
            });
        }
        
        // Animation loop
        let animationFrame;
        function animate() {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            
            let activePieces = 0;
            
            pieces.forEach(piece => {
                ctx.save();
                ctx.translate(piece.x, piece.y);
                ctx.rotate((piece.rotation * Math.PI) / 180);
                ctx.globalAlpha = piece.opacity;
                ctx.fillStyle = piece.color;
                ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
                ctx.restore();
                
                // Update position
                piece.x += piece.speedX;
                piece.y += piece.speedY;
                piece.rotation += piece.rotationSpeed;
                
                // Fade out as it falls
                if (piece.y > confettiCanvas.height * 0.7) {
                    piece.opacity -= 0.02;
                }
                
                // Reset if it goes off screen or fades out
                if (piece.y > confettiCanvas.height || piece.opacity <= 0) {
                    piece.y = -20;
                    piece.x = Math.random() * confettiCanvas.width;
                    piece.opacity = 1;
                    activePieces++;
                } else {
                    activePieces++;
                }
            });
            
            // Keep animation going until all pieces are gone
            if (activePieces > 0) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                // Remove canvas when done
                confettiCanvas.remove();
            }
        }
        
        // Start animation
        animate();
        
        // Stop animation after 3 seconds
        setTimeout(() => {
            cancelAnimationFrame(animationFrame);
            confettiCanvas.remove();
        }, 3000);
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationUtility;
}
