// JS for Spotlight Effect
// Tracks mouse position relative to each card to update CSS variables

const cards = document.querySelectorAll('.spotlight-card');

document.addEventListener('mousemove', (e) => {
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
    });
});

console.log('SYS.INIT // VISION_OS_GLASS');
