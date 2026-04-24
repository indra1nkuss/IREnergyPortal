/**
 * Portal Energy - Ultra-HD & Elegant Lanyard Card
 * Gerakan sangat tenang (Subtle) & Kualitas Visual Maksimal
 */
import * as THREE from 'three';

class LanyardCard {
    constructor() {
        this.container = document.getElementById('lanyard-container');
        this.fallback = document.getElementById('lanyard-fallback');
        if (!this.container) return;

        // RENDERER SETUP (Max HD)
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight || 320);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5)); // Extra Sharp
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.container.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(28, this.container.clientWidth / (this.container.clientHeight || 320), 0.1, 1000);
        this.camera.position.z = 6.5;

        this.mouse = { x: 0, y: 0 };
        this.lerpMouse = { x: 0, y: 0 };
        
        this.init();
        this.animate();
        this.addEventListeners();
    }

    init() {
        // LIGHTING (Soft Studio Setup)
        this.scene.add(new THREE.AmbientLight(0xffffff, 1.4));
        
        const topLight = new THREE.DirectionalLight(0xffffff, 0.8);
        topLight.position.set(0, 5, 5);
        this.scene.add(topLight);

        // Moving Glow (Slow & Elegant)
        this.glow = new THREE.PointLight(0x00ffff, 0.5, 15);
        this.scene.add(this.glow);

        // TEXTURE (Highest Quality)
        const loader = new THREE.TextureLoader();
        const texture = loader.load('images/energiteam.png', (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
            tex.magFilter = THREE.LinearFilter;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            if (this.fallback) this.fallback.style.opacity = '0';
        });

        // GEOMETRY
        const geometry = new THREE.PlaneGeometry(3.8, 2.4, 128, 128); // High segment for smoothness
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            roughness: 0.3,
            metalness: 0.2
        });

        this.card = new THREE.Mesh(geometry, material);
        this.scene.add(this.card);
    }

    addEventListeners() {
        window.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            // Sangat dikurangi sensivitasnya (Very Subtle)
            this.mouse.x = (e.clientX - (rect.left + rect.width / 2)) / rect.width * 0.4;
            this.mouse.y = (e.clientY - (rect.top + rect.height / 2)) / rect.height * 0.4;
        });

        window.addEventListener('resize', () => {
            const w = this.container.clientWidth;
            const h = this.container.clientHeight || 320;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const time = Date.now() * 0.0008;

        // LERP (Sangat lambat untuk efek elegan)
        this.lerpMouse.x += (this.mouse.x - this.lerpMouse.x) * 0.02;
        this.lerpMouse.y += (this.mouse.y - this.lerpMouse.y) * 0.02;

        // Auto Movement (Calm Floating)
        const autoX = Math.sin(time * 0.5) * 0.05;
        const autoY = Math.cos(time * 0.4) * 0.08;

        this.card.rotation.y = this.lerpMouse.x + autoX;
        this.card.rotation.x = -this.lerpMouse.y + autoY;
        
        // Glow moves with card
        this.glow.position.set(Math.sin(time) * 3, Math.cos(time) * 2, 2);

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('load', () => {
    setTimeout(() => { new LanyardCard(); }, 1200);
});
