import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import valentinePhoto from '@/assets/valentine-photo.png';

const ValentinePage: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [showMessage, setShowMessage] = useState(false);
  const mousePosRef = useRef({ x: 0, y: 0 });

  // Store effect creators in refs so the button can access them
  const effectsRef = useRef<{
    createFirework: (pos: THREE.Vector3) => void;
    createConfetti: (pos: THREE.Vector3, count?: number) => void;
    createBlastWave: (pos: THREE.Vector3) => void;
    createHeartExplosion: (pos: THREE.Vector3) => void;
    addScreenShake: (intensity: number) => void;
  } | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mousePosRef.current = {
      x: (e.clientX / window.innerWidth) - 0.5,
      y: (e.clientY / window.innerHeight) - 0.5,
    };
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0015, 5, 25);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xff69b4, 0.4);
    scene.add(ambientLight);
    const pointLight1 = new THREE.PointLight(0xff1493, 2, 20);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0xff69b4, 1.5, 20);
    pointLight2.position.set(-5, -5, 3);
    scene.add(pointLight2);
    const spotLight = new THREE.SpotLight(0xffc0cb, 1);
    spotLight.position.set(0, 10, 10);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Heart shape
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    heartShape.moveTo(x + 0.5, y + 0.5);
    heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    heartShape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
    heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

    // Floating hearts
    const hearts: THREE.Mesh[] = [];
    const heartMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff1493, metalness: 0.2, roughness: 0.3,
      transparent: true, opacity: 0.9, side: THREE.DoubleSide,
      emissive: 0xff69b4, emissiveIntensity: 0.3,
    });

    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.ExtrudeGeometry(heartShape, {
        depth: 0.3, bevelEnabled: true, bevelSegments: 5, steps: 2, bevelSize: 0.1, bevelThickness: 0.1,
      });
      geometry.center();
      const heart = new THREE.Mesh(geometry, heartMaterial.clone());
      heart.scale.set(0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5, 0.5);
      heart.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
      heart.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      heart.userData.rotationSpeed = { x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.02, z: (Math.random() - 0.5) * 0.02 };
      heart.userData.floatSpeed = Math.random() * 0.5 + 0.5;
      heart.userData.floatOffset = Math.random() * Math.PI * 2;
      scene.add(heart);
      hearts.push(heart);
    }

    // Particles
    const particleCount = 1500;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 30;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      particleVelocities.push({ x: (Math.random() - 0.5) * 0.02, y: Math.random() * 0.01 + 0.005, z: (Math.random() - 0.5) * 0.02 });
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xff69b4, size: 0.08, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Central heart
    const centralHeartGeo = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.5, bevelEnabled: true, bevelSegments: 8, steps: 2, bevelSize: 0.15, bevelThickness: 0.15,
    });
    centralHeartGeo.center();
    const centralHeartMat = new THREE.MeshPhysicalMaterial({
      color: 0xff0066, metalness: 0.3, roughness: 0.2, transparent: true, opacity: 0.95,
      side: THREE.DoubleSide, emissive: 0xff1493, emissiveIntensity: 0.5,
      clearcoat: 1, clearcoatRoughness: 0.1,
    });
    const centralHeart = new THREE.Mesh(centralHeartGeo, centralHeartMat);
    centralHeart.scale.set(1.2, 1.2, 1.2);
    centralHeart.castShadow = true;
    scene.add(centralHeart);

    // Effect containers
    const confettiParticles: THREE.Mesh[] = [];
    const confettiGroup = new THREE.Group();
    scene.add(confettiGroup);
    const fireworksGroup = new THREE.Group();
    scene.add(fireworksGroup);
    const fireworksList: THREE.Points[] = [];
    const blastRings: THREE.Mesh[] = [];
    const heartExplosionsList: THREE.Mesh[] = [];

    const createConfetti = (position: THREE.Vector3, count = 50) => {
      for (let i = 0; i < count; i++) {
        const geometry = new THREE.BoxGeometry(0.1, 0.2, 0.02);
        const colors = [0xff1493, 0xff69b4, 0xffc0cb, 0xff0066, 0xffb6c1, 0xffd700, 0xff4500];
        const material = new THREE.MeshPhongMaterial({
          color: colors[Math.floor(Math.random() * colors.length)],
          shininess: 100, emissive: colors[Math.floor(Math.random() * colors.length)], emissiveIntensity: 0.3,
        });
        const confetti = new THREE.Mesh(geometry, material);
        confetti.position.copy(position);
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.3 + 0.2;
        confetti.userData.velocity = new THREE.Vector3(Math.cos(angle) * speed, Math.random() * 0.5 + 0.3, Math.sin(angle) * speed);
        confetti.userData.rotationSpeed = new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3);
        confetti.userData.life = 1;
        confettiGroup.add(confetti);
        confettiParticles.push(confetti);
      }
    };

    const createFirework = (position: THREE.Vector3) => {
      const fwCount = 100;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(fwCount * 3);
      const colors = new Float32Array(fwCount * 3);
      const velocities: { x: number; y: number; z: number }[] = [];
      const baseColor = new THREE.Color(Math.random() > 0.5 ? 0xff1493 : 0xff69b4);
      for (let i = 0; i < fwCount; i++) {
        positions[i * 3] = position.x;
        positions[i * 3 + 1] = position.y;
        positions[i * 3 + 2] = position.z;
        colors[i * 3] = baseColor.r; colors[i * 3 + 1] = baseColor.g; colors[i * 3 + 2] = baseColor.b;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const spd = Math.random() * 0.15 + 0.1;
        velocities.push({ x: Math.sin(phi) * Math.cos(theta) * spd, y: Math.sin(phi) * Math.sin(theta) * spd, z: Math.cos(phi) * spd });
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const material = new THREE.PointsMaterial({ size: 0.15, vertexColors: true, transparent: true, opacity: 1, blending: THREE.AdditiveBlending });
      const firework = new THREE.Points(geometry, material);
      firework.userData.velocities = velocities;
      firework.userData.life = 1;
      firework.userData.gravity = -0.003;
      fireworksGroup.add(firework);
      fireworksList.push(firework);
    };

    const createBlastWave = (position: THREE.Vector3) => {
      const ringGeometry = new THREE.TorusGeometry(0.1, 0.05, 16, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xff1493, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(position);
      ring.userData.life = 1;
      ring.userData.maxScale = 8;
      scene.add(ring);
      blastRings.push(ring);
    };

    const createHeartExplosion = (position: THREE.Vector3) => {
      const miniHeartCount = 12;
      for (let i = 0; i < miniHeartCount; i++) {
        const miniHeartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 });
        miniHeartGeo.center();
        const miniHeartMat = new THREE.MeshPhongMaterial({
          color: Math.random() > 0.5 ? 0xff1493 : 0xff69b4,
          transparent: true, opacity: 0.9, emissive: 0xff69b4, emissiveIntensity: 0.5,
        });
        const miniHeart = new THREE.Mesh(miniHeartGeo, miniHeartMat);
        miniHeart.position.copy(position);
        miniHeart.scale.set(0.15, 0.15, 0.15);
        const angle = (i / miniHeartCount) * Math.PI * 2;
        miniHeart.userData.velocity = new THREE.Vector3(Math.cos(angle) * 0.15, Math.random() * 0.2, Math.sin(angle) * 0.15);
        miniHeart.userData.rotationSpeed = new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2);
        miniHeart.userData.life = 1;
        scene.add(miniHeart);
        heartExplosionsList.push(miniHeart);
      }
    };

    let shakeIntensity = 0;
    const addScreenShake = (intensity: number) => { shakeIntensity = Math.max(shakeIntensity, intensity); };

    effectsRef.current = { createFirework, createConfetti, createBlastWave, createHeartExplosion, addScreenShake };

    // Random explosions
    const triggerRandomExplosion = () => {
      const position = new THREE.Vector3((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
      const effects = [createConfetti, createFirework, createBlastWave, createHeartExplosion];
      effects[Math.floor(Math.random() * effects.length)](position);
    };
    const explosionInterval = setInterval(() => { if (Math.random() > 0.3) triggerRandomExplosion(); }, 800);

    let time = 0;
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.01;

      hearts.forEach((heart) => {
        heart.rotation.x += heart.userData.rotationSpeed.x;
        heart.rotation.y += heart.userData.rotationSpeed.y;
        heart.rotation.z += heart.userData.rotationSpeed.z;
        heart.position.y += Math.sin(time * heart.userData.floatSpeed + heart.userData.floatOffset) * 0.01;
      });

      centralHeart.rotation.y = time * 0.5;
      centralHeart.rotation.z = Math.sin(time) * 0.1;
      centralHeart.position.y = Math.sin(time * 2) * 0.3;
      const scale = 1.2 + Math.sin(time * 3) * 0.1;
      centralHeart.scale.set(scale, scale, scale);

      const pPositions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pPositions[i * 3] += particleVelocities[i].x;
        pPositions[i * 3 + 1] += particleVelocities[i].y;
        pPositions[i * 3 + 2] += particleVelocities[i].z;
        if (pPositions[i * 3 + 1] > 15) pPositions[i * 3 + 1] = -15;
        if (Math.abs(pPositions[i * 3]) > 15) pPositions[i * 3] = (Math.random() - 0.5) * 30;
        if (Math.abs(pPositions[i * 3 + 2]) > 15) pPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Update confetti
      for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const c = confettiParticles[i];
        c.position.add(c.userData.velocity);
        c.userData.velocity.y -= 0.01;
        c.rotation.x += c.userData.rotationSpeed.x;
        c.rotation.y += c.userData.rotationSpeed.y;
        c.rotation.z += c.userData.rotationSpeed.z;
        c.userData.life -= 0.01;
        (c.material as THREE.MeshPhongMaterial).opacity = c.userData.life;
        if (c.userData.life <= 0) { confettiGroup.remove(c); c.geometry.dispose(); (c.material as THREE.Material).dispose(); confettiParticles.splice(i, 1); }
      }

      // Update fireworks
      for (let i = fireworksList.length - 1; i >= 0; i--) {
        const fw = fireworksList[i];
        const fPos = fw.geometry.attributes.position.array as Float32Array;
        const vels = fw.userData.velocities;
        for (let j = 0; j < vels.length; j++) {
          fPos[j * 3] += vels[j].x; fPos[j * 3 + 1] += vels[j].y; fPos[j * 3 + 2] += vels[j].z;
          vels[j].y += fw.userData.gravity;
        }
        fw.geometry.attributes.position.needsUpdate = true;
        fw.userData.life -= 0.012;
        (fw.material as THREE.PointsMaterial).opacity = fw.userData.life;
        if (fw.userData.life <= 0) { fireworksGroup.remove(fw); fw.geometry.dispose(); (fw.material as THREE.Material).dispose(); fireworksList.splice(i, 1); }
      }

      // Update blast rings
      for (let i = blastRings.length - 1; i >= 0; i--) {
        const ring = blastRings[i];
        ring.userData.life -= 0.02;
        const progress = 1 - ring.userData.life;
        const cs = progress * ring.userData.maxScale;
        ring.scale.set(cs, cs, cs);
        (ring.material as THREE.MeshBasicMaterial).opacity = ring.userData.life * 0.8;
        if (ring.userData.life <= 0) { scene.remove(ring); ring.geometry.dispose(); (ring.material as THREE.Material).dispose(); blastRings.splice(i, 1); }
      }

      // Update heart explosions
      for (let i = heartExplosionsList.length - 1; i >= 0; i--) {
        const h = heartExplosionsList[i];
        h.position.add(h.userData.velocity);
        h.userData.velocity.y -= 0.008;
        h.rotation.x += h.userData.rotationSpeed.x;
        h.rotation.y += h.userData.rotationSpeed.y;
        h.rotation.z += h.userData.rotationSpeed.z;
        h.userData.life -= 0.015;
        (h.material as THREE.MeshPhongMaterial).opacity = h.userData.life * 0.9;
        if (h.userData.life <= 0) { scene.remove(h); h.geometry.dispose(); (h.material as THREE.Material).dispose(); heartExplosionsList.splice(i, 1); }
      }

      if (shakeIntensity > 0) {
        camera.position.x += (Math.random() - 0.5) * shakeIntensity;
        camera.position.y += (Math.random() - 0.5) * shakeIntensity;
        shakeIntensity *= 0.9;
        if (shakeIntensity < 0.001) shakeIntensity = 0;
      }

      pointLight1.position.x = Math.sin(time * 0.7) * 8;
      pointLight1.position.z = Math.cos(time * 0.7) * 8;
      pointLight2.position.x = Math.cos(time * 0.5) * 8;
      pointLight2.position.z = Math.sin(time * 0.5) * 8;

      camera.position.x += (mousePosRef.current.x * 2 - camera.position.x) * 0.05;
      camera.position.y += (-mousePosRef.current.y * 2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    setTimeout(() => setShowMessage(true), 2000);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(explosionInterval);
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      confettiParticles.forEach(c => { c.geometry.dispose(); (c.material as THREE.Material).dispose(); });
      fireworksList.forEach(f => { f.geometry.dispose(); (f.material as THREE.Material).dispose(); });
      blastRings.forEach(r => { r.geometry.dispose(); (r.material as THREE.Material).dispose(); });
      heartExplosionsList.forEach(h => { h.geometry.dispose(); (h.material as THREE.Material).dispose(); });
      renderer.dispose();
    };
  }, []);

  const handleButtonClick = () => {
    const messages = [
      "You light up my world! ✨",
      "Every moment with you is magical! 💫",
      "You're the reason I smile! 😊",
      "My heart beats for you! 💓",
      "You're absolutely amazing! 🌟",
    ];
    alert(messages[Math.floor(Math.random() * messages.length)]);

    if (effectsRef.current) {
      const { createFirework, createConfetti, createBlastWave, createHeartExplosion, addScreenShake } = effectsRef.current;
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const randomPos = new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
          createFirework(randomPos);
          createConfetti(randomPos, 80);
          createBlastWave(randomPos);
          createHeartExplosion(randomPos);
        }, i * 100);
      }
      addScreenShake(0.3);
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-background"
      onMouseMove={handleMouseMove}
    >
      {/* Three.js canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Overlay content */}
      {showMessage && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          {/* Photo */}
          <div className="animate-fade-in-up mb-6 pointer-events-auto">
            <div className="w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-valentine-pink animate-pulse-glow shadow-2xl">
              <img
                src={valentinePhoto}
                alt="My Valentine"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light tracking-wide text-foreground valentine-text-glow animate-fade-in-up-delay select-none">
            Be Mine
          </h1>

          {/* Subtitle */}
          <p className="font-body text-lg md:text-2xl text-valentine-rose mt-4 tracking-widest animate-fade-in-up-delay-2 select-none">
            You make my heart soar ♡
          </p>

          {/* Button */}
          <button
            onClick={handleButtonClick}
            className="mt-8 px-8 py-3 rounded-full bg-primary text-primary-foreground font-body text-lg tracking-wide
              shadow-[0_10px_30px_hsl(var(--valentine-pink)/0.4),0_0_20px_hsl(var(--valentine-rose)/0.3)]
              hover:shadow-[0_15px_40px_hsl(var(--valentine-pink)/0.6),0_0_30px_hsl(var(--valentine-rose)/0.5)]
              hover:-translate-y-1 hover:scale-105
              transition-all duration-300 ease-out
              pointer-events-auto animate-fade-in-up-delay-3 animate-float"
          >
            Click if you feel it too
          </button>
        </div>
      )}
    </div>
  );
};

export default ValentinePage;
