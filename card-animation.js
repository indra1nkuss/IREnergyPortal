/**
 * Portal Energy - Premium 3D Tilt Lanyard Card
 * Mengganti efek tarik lama dengan efek Tilt & Floating yang lebih HD
 */
import * as THREE from 'three';

class LanyardCard {
    constructor() {
        this.container = document.getElementById('lanyard-container');
        this.fallback = document.getElementById('lanyard-fallback');
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(35, this.container.clientWidth / (this.container.clientHeight || 320), 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight || 320);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // HD Cap
        this.container.appendChild(this.renderer.domElement);

        this.mouse = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };
        
        this.init();
        this.animate();
        this.addEventListeners();
    }

    init() {
        // LIGHTING (Premium HD Setup)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x00ffff, 1, 10);
        pointLight.position.set(2, 2, 2);
        this.scene.add(pointLight);

        const spotLight = new THREE.SpotLight(0xffffff, 1.5);
        spotLight.position.set(-2, 3, 5);
        this.scene.add(spotLight);

        // TEXTURE LOADING
        const loader = new THREE.TextureLoader();
        const texture = loader.load('images/energiteam.png', (tex) => {
            tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy(); // HD Filtering
            if (this.fallback) this.fallback.style.opacity = '0';
        });

        // CARD GEOMETRY
        const geometry = new THREE.PlaneGeometry(3.5, 2.2, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            shininess: 100,
            specular: 0x444444
        });

        this.card = new THREE.Mesh(geometry, material);
        this.scene.add(this.card);

        // BORDER/FRAME (Optional for depth)
        const frameGeom = new THREE.PlaneGeometry(3.6, 2.3);
        const frameMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, side: THREE.DoubleSide, transparent: true, opacity: 0.1 });
        const frame = new THREE.Mesh(frameGeom, frameMat);
        frame.position.z = -0.01;
        this.card.add(frame);
    }

    addEventListeners() {
        window.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Normalize mouse position -1 to 1
            this.mouse.x = (e.clientX - centerX) / (rect.width / 2);
            this.mouse.y = (e.clientY - centerY) / (rect.height / 2);
            
            // Map to rotation angles
            this.targetRotation.y = this.mouse.x * 0.5; // Max 0.5 rad
            this.targetRotation.x = -this.mouse.y * 0.4;
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

        // Smooth Interpolation (Lerp)
        this.card.rotation.y += (this.targetRotation.y - this.card.rotation.y) * 0.05;
        this.card.rotation.x += (this.targetRotation.x - this.card.rotation.x) * 0.05;

        // Floating Motion
        this.card.position.y = Math.sin(time * 0.5) * 0.1;
        this.card.position.z = Math.cos(time * 0.3) * 0.05;

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('load', () => {
    setTimeout(() => { new LanyardCard(); }, 800);
});
