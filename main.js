// Animations and interactions
// Apple-style is subtle, so we don't want heavy JS animations.
// Mostly relying on CSS transitions.

console.log('Soft Cloud Network - Redesigned');

// Simple intersection observer for a smooth fade-up on load
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.bento-tile').forEach((tile, index) => {
    // Add base style for animation
    tile.style.opacity = '0';
    tile.style.transform = 'translateY(20px)';
    tile.style.transition = `opacity 0.6s ease, transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) ${index * 0.05}s`; // Staggered

    // Clean up styles after animation for hover effects to work cleanly without conflict
    tile.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'transform' && tile.style.opacity === '1') {
            tile.style.transition = ''; // Remove inline transition to let CSS take over for hovers
            tile.style.transform = '';
            tile.style.opacity = '';
        }
    });

    observer.observe(tile);
});

// Trigger the animation
setTimeout(() => {
    document.querySelectorAll('.bento-tile').forEach(tile => {
        tile.style.opacity = '1';
        tile.style.transform = 'translateY(0)';
    });
}, 100);
