import * as THREE from 'three';

/**
 * Portal Energy - Three.js Particle Network Background
 * Created to provide a premium, interactive energy-themed background.
 */

class EnergyNetwork {
    constructor() {
        this.container = document.getElementById('three-bg');
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.z = 1000;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.particleCount = 120;
        this.maxDistance = 250;
        this.particles = [];
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.mouse = new THREE.Vector2(0, 0);
        this.targetMouse = new THREE.Vector2(0, 0);

        this.init();
        this.animate();
        this.addEventListeners();
    }

    init() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);

        const colorCyan = new THREE.Color(0x00ffff);
        const colorGold = new THREE.Color(0xd4af37);

        for (let i = 0; i < this.particleCount; i++) {
            const x = Math.random() * 2000 - 1000;
            const y = Math.random() * 2000 - 1000;
            const z = Math.random() * 2000 - 1000;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            this.particles.push({
                pos: new THREE.Vector3(x, y, z),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 1.5,
                    (Math.random() - 0.5) * 1.5,
                    (Math.random() - 0.5) * 1.5
                )
            });

            // Randomly pick cyan or gold
            const mixedColor = Math.random() > 0.5 ? colorCyan : colorGold;
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 4,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.points = new THREE.Points(geometry, material);
        this.group.add(this.points);

        // Lines setup
        const lineGeometry = new THREE.BufferGeometry();
        this.linePositions = new Float32Array(this.particleCount * this.particleCount * 3);
        this.lineColors = new Float32Array(this.particleCount * this.particleCount * 3);
        
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
        lineGeometry.setAttribute('color', new THREE.BufferAttribute(this.lineColors, 3));

        const lineMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });

        this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.group.add(this.lines);
    }

    addEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(e) {
        this.targetMouse.x = (e.clientX - window.innerWidth / 2);
        this.targetMouse.y = -(e.clientY - window.innerHeight / 2);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth mouse movement
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

        this.group.rotation.y = this.mouse.x * 0.0002;
        this.group.rotation.x = -this.mouse.y * 0.0002;

        const positions = this.points.geometry.attributes.position.array;
        let lineIdx = 0;

        for (let i = 0; i < this.particleCount; i++) {
            const p = this.particles[i];
            
            p.pos.add(p.velocity);

            // Bounce back
            if (p.pos.x < -1000 || p.pos.x > 1000) p.velocity.x *= -1;
            if (p.pos.y < -1000 || p.pos.y > 1000) p.velocity.y *= -1;
            if (p.pos.z < -1000 || p.pos.z > 1000) p.velocity.z *= -1;

            positions[i * 3] = p.pos.x;
            positions[i * 3 + 1] = p.pos.y;
            positions[i * 3 + 2] = p.pos.z;

            // Connect lines
            for (let j = i + 1; j < this.particleCount; j++) {
                const p2 = this.particles[j];
                const dist = p.pos.distanceTo(p2.pos);

                if (dist < this.maxDistance) {
                    const alpha = 1.0 - (dist / this.maxDistance);

                    this.linePositions[lineIdx * 3] = p.pos.x;
                    this.linePositions[lineIdx * 3 + 1] = p.pos.y;
                    this.linePositions[lineIdx * 3 + 2] = p.pos.z;

                    this.linePositions[(lineIdx + 1) * 3] = p2.pos.x;
                    this.linePositions[(lineIdx + 1) * 3 + 1] = p2.pos.y;
                    this.linePositions[(lineIdx + 1) * 3 + 2] = p2.pos.z;

                    // Fade lines based on distance
                    this.lineColors[lineIdx * 3] = 0x00 / 255 * alpha;
                    this.lineColors[lineIdx * 3 + 1] = 0xff / 255 * alpha;
                    this.lineColors[lineIdx * 3 + 2] = 0xff / 255 * alpha;

                    this.lineColors[(lineIdx + 1) * 3] = 0xd4 / 255 * alpha;
                    this.lineColors[(lineIdx + 1) * 3 + 1] = 0xaf / 255 * alpha;
                    this.lineColors[(lineIdx + 1) * 3 + 2] = 0x37 / 255 * alpha;

                    lineIdx += 2;
                }
            }
        }

        this.points.geometry.attributes.position.needsUpdate = true;
        this.lines.geometry.attributes.position.needsUpdate = true;
        this.lines.geometry.attributes.color.needsUpdate = true;
        this.lines.geometry.setDrawRange(0, lineIdx);

        this.renderer.render(this.scene, this.camera);
    }
}

// Start animation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EnergyNetwork();
});
