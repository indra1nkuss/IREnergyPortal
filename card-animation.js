import * as THREE from 'three';

/**
 * Portal Energy - Interactive Lanyard Card (Robust Version)
 */

class LanyardCard {
    constructor() {
        this.container = document.getElementById('lanyard-container');
        this.fallback = document.getElementById('lanyard-fallback');
        if (!this.container) return;

        console.log("Initializing Lanyard Card...");

        try {
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(40, this.container.clientWidth / (this.container.clientHeight || 320), 0.1, 1000);
            this.camera.position.z = 6;

            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight || 320);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.container.appendChild(this.renderer.domElement);

            this.init();
            this.animate();
            this.addEventListeners();
        } catch (e) {
            console.error("Three.js initialization failed:", e);
            // If Three.js fails, ensure fallback is visible
            if (this.fallback) this.fallback.style.opacity = '1';
        }
    }

    init() {
        this.scene.add(new THREE.AmbientLight(0xffffff, 1.5));
        
        const loader = new THREE.TextureLoader();
        // Use the absolute path if possible or ensure relative path is correct
        const texture = loader.load('images/energiteam.png', (tex) => {
            console.log("Texture loaded successfully");
            if (this.fallback) this.fallback.style.opacity = '0';
        }, undefined, (err) => {
            console.error("Texture failed to load:", err);
            if (this.fallback) this.fallback.style.opacity = '1';
        });

        const geometry = new THREE.PlaneGeometry(4, 2.6, 20, 15);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true
        });

        this.card = new THREE.Mesh(geometry, material);
        this.scene.add(this.card);

        this.positions = geometry.attributes.position;
        this.original = this.positions.array.slice();
        this.velocities = new Float32Array(this.positions.count * 3).fill(0);
        this.mouse = new THREE.Vector3(0, 0, 0);
        this.isDragging = false;
    }

    addEventListeners() {
        const updateMouse = (e) => {
            const rect = this.container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            this.mouse.set(x * 3, y * 3, 0);
        };

        this.container.addEventListener('mousedown', (e) => { this.isDragging = true; updateMouse(e); });
        window.addEventListener('mousemove', (e) => { updateMouse(e); });
        window.addEventListener('mouseup', () => { this.isDragging = false; });
        
        this.container.addEventListener('touchstart', (e) => { this.isDragging = true; updateMouse(e.touches[0]); });
        window.addEventListener('touchmove', (e) => { updateMouse(e.touches[0]); });
        window.addEventListener('touchend', () => { this.isDragging = false; });
        
        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.clientWidth / (this.container.clientHeight || 320);
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight || 320);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const posAttr = this.card.geometry.attributes.position;
        const arr = posAttr.array;
        const time = Date.now() * 0.001;

        for (let i = 0; i < posAttr.count; i++) {
            const i3 = i * 3;
            const ox = this.original[i3];
            const oy = this.original[i3 + 1];
            const oz = this.original[i3 + 2];

            let fx = (ox - arr[i3]) * 0.1;
            let fy = (oy - arr[i3 + 1]) * 0.1;
            let fz = (oz - arr[i3 + 2]) * 0.1;

            if (this.isDragging) {
                const dx = arr[i3] - this.mouse.x;
                const dy = arr[i3 + 1] - this.mouse.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const strength = Math.exp(-dist * 2.0) * 0.5;
                fx += (this.mouse.x - arr[i3]) * strength;
                fy += (this.mouse.y - arr[i3 + 1]) * strength;
            }

            this.velocities[i3] = (this.velocities[i3] + fx) * 0.85;
            this.velocities[i3+1] = (this.velocities[i3+1] + fy) * 0.85;
            this.velocities[i3+2] = (this.velocities[i3+2] + fz) * 0.85;

            arr[i3] += this.velocities[i3];
            arr[i3+1] += this.velocities[i3+1];
            arr[i3+2] += this.velocities[i3+2];
        }

        posAttr.needsUpdate = true;
        this.card.rotation.y = Math.sin(time) * 0.05;
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('load', () => {
    setTimeout(() => { new LanyardCard(); }, 800);
});
