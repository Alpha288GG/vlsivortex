/**
 * three-bg.js — Tech Vortex
 * Three.js animated background — Creamy Blue + White particle palette.
 */
(function () {
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // Subtle Digital Signature per user request
    console.log("%c✦ Background Globe Architecture by SSCODEHUB ✦", "color:#b8d4e8; background:#000; font-size:11px; font-weight:bold; font-family:monospace; padding:4px 8px; border:1px solid #b8d4e8; border-radius:4px;");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    // ── Outer wireframe icosahedron ──
    const mainGeo = new THREE.IcosahedronGeometry(1.8, 2);
    const mainMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,   // Pure White
        wireframe: true,
        transparent: true,
        opacity: 0.16,      // Increased opacity
    });
    const mainMesh = new THREE.Mesh(mainGeo, mainMat);
    scene.add(mainMesh);

    // ── Inner sphere ──
    const innerGeo = new THREE.SphereGeometry(1.0, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,   // Pure White
        wireframe: true,
        transparent: true,
        opacity: 0.12,      // Increased opacity
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // ── Watermark Signature ──
    const sigCanvas = document.createElement('canvas');
    sigCanvas.width = 512;
    sigCanvas.height = 128;
    const sigCtx = sigCanvas.getContext('2d');
    sigCtx.fillStyle = '#b8d4e8'; // Solid creamy blue
    sigCtx.font = 'bold 36px "Courier New", monospace';
    sigCtx.textAlign = 'center';
    sigCtx.textBaseline = 'middle';
    sigCtx.fillText('SSCODEHUB', 256, 64);
    
    const sigTex = new THREE.CanvasTexture(sigCanvas);
    sigTex.needsUpdate = true;
    const sigMat = new THREE.MeshBasicMaterial({
        map: sigTex,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    });
    const sigGeo = new THREE.PlaneGeometry(2.0, 0.5);
    const sigMesh = new THREE.Mesh(sigGeo, sigMat);
    // Shift it down and to the right, out from behind the main heading
    sigMesh.position.set(1.5, -1.2, 0.0);
    scene.add(sigMesh);

    // ── Particle field — creamy blue + white ──
    const particleCount = 700;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cBlue = new THREE.Color(0xb8d4e8);
    const cWhite = new THREE.Color(0xf0f4f8);
    const cDeep = new THREE.Color(0x5080a0);

    for (let i = 0; i < particleCount; i++) {
        const r = 2.8 + Math.random() * 3.2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
        const rnd = Math.random();
        const c = rnd > 0.65 ? cBlue : rnd > 0.3 ? cWhite : cDeep;
        colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    // Create a circular soft-dot canvas texture
    const dotCanvas = document.createElement('canvas');
    dotCanvas.width = 64; dotCanvas.height = 64;
    const ctx = dotCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0,   'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.8)');
    grad.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const dotTexture = new THREE.CanvasTexture(dotCanvas);

    const pMat = new THREE.PointsMaterial({
        size: 0.06,
        map: dotTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        alphaTest: 0.01,
        depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── State ──
    let scrollY = 0;
    let mouseX = 0, mouseY = 0;
    let camX = 0, camY = 0;

    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5);
        mouseY = -(e.clientY / window.innerHeight - 0.5);
    }, { passive: true });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        
        // Skip rendering on mobile devices where the canvas is hidden
        if (window.innerWidth <= 640) return;

        const t = clock.getElapsedTime();
        const scrollFrac = scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1);

        // ── Watermark Animation ──
        // 4 second cycle: 1s enter, 1s stay, 1s exit, 1s hidden
        const cycle = t % 4;
        let sigX = 0, sigY = 0.35; // Positioned between Vortex and description
        let sigOp = 0.6; 
        
        if (cycle < 1) {
            // Entering from right
            const progress = cycle / 1;
            const ease = 1 - Math.pow(1 - progress, 3);
            sigX = 4 * (1 - ease); 
            sigY = -1.05 + 0.25 * ease; // animates to -0.8
            sigOp = 0.6 * progress;
        } else if (cycle < 2) {
            // Staying in position (under description)
            sigX = 0;
            sigY = -0.8;
            sigOp = 0.6;
        } else if (cycle < 3) {
            // Exiting to left
            const progress = (cycle - 2) / 1;
            const ease = Math.pow(progress, 3);
            sigX = -4 * ease;
            sigY = -0.8 - 0.25 * ease;
            sigOp = 0.6 * (1 - progress);
        } else {
            // Hidden
            sigX = 10; 
            sigOp = 0;
        }
        
        sigMesh.position.set(sigX, sigY, 0);
        sigMat.opacity = sigOp;

        // Smooth camera drift
        camX += (mouseX * 0.35 - camX) * 0.03;
        camY += (mouseY * 0.25 - camY) * 0.03;

        mainMesh.rotation.y = t * 0.04 + camX * 0.6 + scrollFrac * Math.PI * 1.5;
        mainMesh.rotation.x = t * 0.025 + camY * 0.4;

        innerMesh.rotation.y = -t * 0.06 + scrollFrac * Math.PI;
        innerMesh.rotation.z = t * 0.03;

        particles.rotation.y = t * 0.015 + scrollFrac * 0.8;
        particles.rotation.x = 0.1 + scrollFrac * 0.3;

        camera.position.x += (camX * 0.25 - camera.position.x) * 0.04;
        camera.position.y += (camY * 0.18 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }
    animate();
})();
