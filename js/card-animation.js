/**
 * Portal Energy - Ultra-Smooth HD Lanyard Card
 * Fokus pada keanggunan (Elegance) dan kualitas visual (HD)
 */
import * as THREE from 'three';

class LanyardCard {
    constructor() {
        this.container = document.getElementById('lanyard-container');
        this.fallback = document.getElementById('lanyard-fallback');
        if (!this.container) return;

        // RENDERER SETUP (HD & Color Correct)
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight || 320);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace; // Membuat warna lebih HD
        this.container.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(30, this.container.clientWidth / (this.container.clientHeight || 320), 0.1, 1000);
        this.camera.position.z = 6;

        this.mouse = { x: 0, y: 0 };
        this.lerpMouse = { x: 0, y: 0 };
        
        this.init();
        this.animate();
        this.addEventListeners();
    }

    init() {
        // LIGHTING (Studio Setup)
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        this.scene.add(ambientLight);

        // Rim Light (Membuat tepi kartu bercahaya)
        const rimLight = new THREE.SpotLight(0x00ffff, 2);
        rimLight.position.set(5, 5, 5);
        this.scene.add(rimLight);

        // Moving Shine (Efek kilauan mewah)
        this.shineLight = new THREE.PointLight(0xffffff, 1, 10);
        this.scene.add(this.shineLight);

        // TEXTURE LOADING (HD Optimization)
        const loader = new THREE.TextureLoader();
        const texture = loader.load('images/energiteam.png', (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
            if (this.fallback) this.fallback.style.opacity = '0';
        });

        // CARD GEOMETRY (Lebih melengkung sedikit agar elegan)
        const geometry = new THREE.PlaneGeometry(3.8, 2.4, 64, 64);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            shininess: 80,
            specular: 0x222222,
            reflectivity: 1
        });

        this.card = new THREE.Mesh(geometry, material);
        this.scene.add(this.card);
    }

    addEventListeners() {
        window.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Subtle influence (Diperkecil agar tidak terlalu interaktif)
            this.mouse.x = (e.clientX - centerX) / (rect.width);
            this.mouse.y = (e.clientY - centerY) / (rect.height);
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.clientWidth / (this.container.clientHeight || 320);
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight || 320);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // ULTRA SMOOTH LERP (Pergerakan sangat lambat & elegan)
        this.lerpMouse.x += (this.mouse.x - this.lerpMouse.x) * 0.03;
        this.lerpMouse.y += (this.mouse.y - this.lerpMouse.y) * 0.03;

        // Auto Floating (Gerakan mengambang natural)
        const floatY = Math.sin(time * 0.4) * 0.05;
        const floatX = Math.cos(time * 0.3) * 0.03;

        // Combine Mouse Tilt + Auto Float
        this.card.rotation.y = (this.lerpMouse.x * 0.3) + floatX;
        this.card.rotation.x = (-this.lerpMouse.y * 0.2) + floatY;
        
        // Shine Position (Kilauan mengikuti gerakan)
        this.shineLight.position.set(this.lerpMouse.x * 5, this.lerpMouse.y * 5, 2);

        this.renderer.render(this.scene, this.camera);
    }
}

// Inisialisasi dengan delay halus
window.addEventListener('load', () => {
    setTimeout(() => { new LanyardCard(); }, 1000);
});
