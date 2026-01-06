// Zero-Gravity Lightweight Physics Engine
// No external libraries, pure JS verlet-like integration

const PHYSICS_CONFIG = {
    friction: 0.98,
    restitution: 0.8,
    gravity: 0, // Zero gravity!
    mouseRepulsion: 150,
    mouseForce: 1.5,
    maxSpeed: 30
};

const world = document.getElementById('physics-world');
const elements = Array.from(document.querySelectorAll('.phys-obj'));

// Physics state for each element
const bodies = elements.map(el => {
    const rect = el.getBoundingClientRect();
    // Random initial positions near center but scattered
    const maxW = window.innerWidth - rect.width;
    const maxH = window.innerHeight - rect.height;

    return {
        el: el,
        width: rect.width,
        height: rect.height,
        radius: Math.max(rect.width, rect.height) / 2, // Approximation for circular collisions
        x: Math.random() * (maxW * 0.6) + (maxW * 0.2),
        y: Math.random() * (maxH * 0.6) + (maxH * 0.2),
        vx: (Math.random() - 0.5) * 4, // Initial slight drift
        vy: (Math.random() - 0.5) * 4,
        isDragging: false
    };
});

let mouse = { x: -1000, y: -1000, isDown: false };
let dragBody = null;
let lastMouseX = 0;
let lastMouseY = 0;

// Init
function init() {
    resize();
    window.addEventListener('resize', resize);

    // Mouse / Touch Events
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchend', onUp);

    requestAnimationFrame(loop);
}

function resize() {
    // Keep bodies within bounds if resized
}

function onMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (dragBody) {
        // Throwing mechanic: calculate velocity based on drag speed
        dragBody.vx = (Math.min(mouse.x - lastMouseX, 50)); // Clamp max throw speed
        dragBody.vy = (Math.min(mouse.y - lastMouseY, 50));

        dragBody.x = mouse.x;
        dragBody.y = mouse.y;
    }

    lastMouseX = mouse.x;
    lastMouseY = mouse.y;
}

function onDown(e) {
    mouse.isDown = true;
    const target = e.target.closest('.phys-obj');
    if (target) {
        const body = bodies.find(b => b.el === target);
        if (body) {
            dragBody = body;
            body.isDragging = true;
            body.vx = 0;
            body.vy = 0;
            // Prevent link navigation if dragging starts
            e.preventDefault();
        }
    }
}

function onUp() {
    mouse.isDown = false;
    if (dragBody) {
        dragBody.isDragging = false;
        // Check if it was a click (little movement) to allow link following
        // Logic: if movement during click was minimal, programmatically click?
        // Actually, easiest is: links work on mouseup if dropped on same spot.
        // For now, standard behavior is fine, user clicks quickly for link, holds for drag.
        dragBody = null;
    }
}

function onTouchMove(e) {
    e.preventDefault(); // Stop scroll
    onMove(e.touches[0]);
}

function onTouchStart(e) {
    onDown(e.touches[0]);
}

// Physics Loop
function loop() {
    bodies.forEach(body => {
        if (body.isDragging) return;

        // 1. Mouse Repulsion (Force Field)
        const dx = body.x - mouse.x;
        const dy = body.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < PHYSICS_CONFIG.mouseRepulsion) {
            const force = (PHYSICS_CONFIG.mouseRepulsion - dist) / PHYSICS_CONFIG.mouseRepulsion;
            const angle = Math.atan2(dy, dx);
            body.vx += Math.cos(angle) * force * PHYSICS_CONFIG.mouseForce;
            body.vy += Math.sin(angle) * force * PHYSICS_CONFIG.mouseForce;
        }

        // 2. Body-Body Collisions (Simple Circle Approx for fun bouncing)
        bodies.forEach(other => {
            if (body === other) return;
            const dx = body.x - other.x;
            const dy = body.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = body.radius + other.radius + 10; // Extra padding

            if (dist < minDist) {
                const angle = Math.atan2(dy, dx);
                const push = (minDist - dist) * 0.05; // Gentle push apart

                body.vx += Math.cos(angle) * push;
                body.vy += Math.sin(angle) * push;
            }
        });

        // 3. Movement & Friction
        body.x += body.vx;
        body.y += body.vy;

        body.vx *= PHYSICS_CONFIG.friction;
        body.vy *= PHYSICS_CONFIG.friction;

        // Clamp bounds
        const bounds = { w: window.innerWidth, h: window.innerHeight };
        const radiusX = body.width / 2;
        const radiusY = body.height / 2;

        if (body.x < radiusX) { body.x = radiusX; body.vx *= -PHYSICS_CONFIG.restitution; }
        if (body.x > bounds.w - radiusX) { body.x = bounds.w - radiusX; body.vx *= -PHYSICS_CONFIG.restitution; }
        if (body.y < radiusY) { body.y = radiusY; body.vy *= -PHYSICS_CONFIG.restitution; }
        if (body.y > bounds.h - radiusY) { body.y = bounds.h - radiusY; body.vy *= -PHYSICS_CONFIG.restitution; }

        // Render relative to center of mass (since we use translate -50, -50 in CSS)
        // Actually CSS transform translate uses top/left origin of element if not careful, 
        // but we set .phys-obj { transform: translate(-50%, -50%); position: absolute; }
        // So x/y should represent center.
        body.el.style.left = `${body.x}px`;
        body.el.style.top = `${body.y}px`;

        // Tilt based on velocity for extra flair
        const tiltX = body.vy * 0.5;
        const tiltY = -body.vx * 0.5;
        body.el.style.transform = `translate(-50%, -50%) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    requestAnimationFrame(loop);
}

// Go
init();
console.log('SYS.INIT // ZERO_GRAVITY_ENGINE');
