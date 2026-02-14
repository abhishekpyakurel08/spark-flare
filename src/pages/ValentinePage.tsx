import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import valentinePhoto from '@/assets/valentine-photo.png';
import { toast } from "sonner";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const ValentinePage: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
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

  const startMusic = () => {
    setHasInteracted(true);
  };

  useEffect(() => {
    if (hasInteracted) {
      // Load YouTube IFrame API
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = () => {
        new window.YT.Player('youtube-player', {
          height: '100',
          width: '100',
          videoId: 'Cb6wuzOurPc',
          playerVars: {
            'autoplay': 1,
            'loop': 1,
            'playlist': 'Cb6wuzOurPc',
            'controls': 0,
            'modestbranding': 1,
            'rel': 0,
          },
          events: {
            'onReady': (event: any) => {
              event.target.setVolume(30);
              event.target.playVideo();
            }
          }
        });
      };

      // If already loaded
      if (window.YT && window.YT.Player) {
        window.onYouTubeIframeAPIReady();
      }
    }
  }, [hasInteracted]);

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
    const ambientLight = new THREE.AmbientLight(0xffb6c1, 0.5); // More pink ambient
    scene.add(ambientLight);
    const pointLight1 = new THREE.PointLight(0xff1493, 2, 25);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0xff69b4, 1.5, 25);
    pointLight2.position.set(-5, -5, 3);
    scene.add(pointLight2);
    const spotLight = new THREE.SpotLight(0xffc0cb, 1.5);
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

    // Floating hearts - INCREASED COUNT AND PULSING ANIMATION
    const hearts: THREE.Mesh[] = [];
    const heartColors = [0xff1493, 0xff69b4, 0xff0066, 0xffb6c1, 0xffc0cb]; // All pink variants

    for (let i = 0; i < 20; i++) { // Even more hearts
      const geometry = new THREE.ExtrudeGeometry(heartShape, {
        depth: 0.3, bevelEnabled: true, bevelSegments: 5, steps: 2, bevelSize: 0.1, bevelThickness: 0.1,
      });
      geometry.center();
      const hColor = heartColors[Math.floor(Math.random() * heartColors.length)];
      const heartMaterial = new THREE.MeshPhysicalMaterial({
        color: hColor, metalness: 0.2, roughness: 0.3,
        transparent: true, opacity: 0.7, side: THREE.DoubleSide,
        emissive: hColor, emissiveIntensity: 0.4,
      });
      const heart = new THREE.Mesh(geometry, heartMaterial);
      const baseScale = 0.3 + Math.random() * 0.5;
      heart.scale.set(baseScale, baseScale, baseScale);
      heart.position.set((Math.random() - 0.5) * 25, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 12);
      heart.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      heart.userData = {
        rotationSpeed: { x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.02, z: (Math.random() - 0.5) * 0.02 },
        floatSpeed: Math.random() * 0.5 + 0.5,
        floatOffset: Math.random() * Math.PI * 2,
        baseScale: baseScale,
        pulseSpeed: 2 + Math.random() * 2
      };
      scene.add(heart);
      hearts.push(heart);
    }

    // Particles
    const particleCount = 2000;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 40;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      particleVelocities.push({ x: (Math.random() - 0.5) * 0.02, y: Math.random() * 0.01 + 0.005, z: (Math.random() - 0.5) * 0.02 });
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xff69b4, size: 0.06, transparent: true, opacity: 0.6,
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
      color: 0xff1493, metalness: 0.3, roughness: 0.2, transparent: true, opacity: 0.95,
      side: THREE.DoubleSide, emissive: 0xff0066, emissiveIntensity: 0.6,
      clearcoat: 1, clearcoatRoughness: 0.1,
    });
    const centralHeart = new THREE.Mesh(centralHeartGeo, centralHeartMat);
    centralHeart.scale.set(1.4, 1.4, 1.4);
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
        const colors = [0xff1493, 0xff69b4, 0xffc0cb, 0xff0066, 0xffb6c1, 0xffd700];
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
      const fwCount = 120;
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
      const material = new THREE.PointsMaterial({ size: 0.18, vertexColors: true, transparent: true, opacity: 1, blending: THREE.AdditiveBlending });
      const firework = new THREE.Points(geometry, material);
      firework.userData.velocities = velocities;
      firework.userData.life = 1;
      firework.userData.gravity = -0.003;
      fireworksGroup.add(firework);
      fireworksList.push(firework);
    };

    const createBlastWave = (position: THREE.Vector3) => {
      const ringGeometry = new THREE.TorusGeometry(0.1, 0.05, 16, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
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
        const hColor = heartColors[Math.floor(Math.random() * heartColors.length)];
        const miniHeartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 });
        miniHeartGeo.center();
        const miniHeartMat = new THREE.MeshPhongMaterial({
          color: hColor, transparent: true, opacity: 0.9, emissive: hColor, emissiveIntensity: 0.5,
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
      const position = new THREE.Vector3((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8);
      const effects = [createConfetti, createFirework, createBlastWave, createHeartExplosion];
      effects[Math.floor(Math.random() * effects.length)](position);
    };
    const explosionInterval = setInterval(() => { if (Math.random() > 0.4) triggerRandomExplosion(); }, 800);

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

        // Pulse Effect
        const pulse = 1 + Math.sin(time * heart.userData.pulseSpeed + heart.userData.floatOffset) * 0.15;
        const currentScale = heart.userData.baseScale * pulse;
        heart.scale.set(currentScale, currentScale, currentScale);
      });

      centralHeart.rotation.y = time * 0.5;
      centralHeart.rotation.z = Math.sin(time) * 0.1;
      centralHeart.position.y = Math.sin(time * 2) * 0.3;
      const cScale = 1.4 + Math.sin(time * 3) * 0.15;
      centralHeart.scale.set(cScale, cScale, cScale);

      const pPositions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pPositions[i * 3] += particleVelocities[i].x;
        pPositions[i * 3 + 1] += particleVelocities[i].y;
        pPositions[i * 3 + 2] += particleVelocities[i].z;
        if (pPositions[i * 3 + 1] > 20) pPositions[i * 3 + 1] = -20;
        if (Math.abs(pPositions[i * 3]) > 20) pPositions[i * 3] = (Math.random() - 0.5) * 40;
        if (Math.abs(pPositions[i * 3 + 2]) > 20) pPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
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
        const scaleVal = progress * ring.userData.maxScale;
        ring.scale.set(scaleVal, scaleVal, scaleVal);
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

    setTimeout(() => setShowMessage(true), 1500);

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
      "You make my heart skip a beat! ✨",
      "I can't stop thinking about you! 💫",
      "Your smile is my favorite thing in the world! 😊",
      "I get butterflies every time you're near! 💓",
      "I wish I could tell you how much you mean to me 🌹",
    ];

    toast(messages[Math.floor(Math.random() * messages.length)], {
      position: "top-center",
      duration: 3000,
      style: {
        background: "rgba(255, 105, 180, 0.9)",
        color: "white",
        border: "none",
        fontSize: "1.2rem",
        fontFamily: "serif",
      }
    });

    if (effectsRef.current) {
      const { createFirework, createConfetti, createBlastWave, createHeartExplosion, addScreenShake } = effectsRef.current;
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          const randomPos = new THREE.Vector3((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
          createFirework(randomPos);
          createConfetti(randomPos, 100);
          createBlastWave(randomPos);
          createHeartExplosion(randomPos);
        }, i * 150);
      }
      addScreenShake(0.4);
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-background"
      onMouseMove={handleMouseMove}
    >
      {/* Three.js canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40 pointer-events-none z-10" />

      {/* Overlay content */}
      {showMessage && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none px-4">
          {/* Photo */}
          <div className="animate-fade-in-up mb-6 pointer-events-auto">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-valentine-rose animate-pulse-glow shadow-[0_0_50px_rgba(255,20,147,0.6)]">
              <img
                src={valentinePhoto}
                alt="My Crush"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light tracking-wide text-foreground valentine-text-glow animate-fade-in-up-delay select-none text-center">
            You Stole My Heart
          </h1>

          {/* Subtitle */}
          <p className="font-body text-xl md:text-2xl text-valentine-rose mt-4 tracking-wide animate-fade-in-up-delay-2 select-none text-center italic opacity-90">
            Every time I see you, my world lights up ♡
          </p>

          {/* Button */}
          <button
            onClick={() => {
              handleButtonClick();
              if (!hasInteracted) startMusic();
            }}
            className="mt-12 px-10 py-4 rounded-full bg-primary text-primary-foreground font-body text-xl tracking-wide
              shadow-[0_10px_40px_rgba(255,105,180,0.5),0_0_20px_rgba(255,20,147,0.3)]
              hover:shadow-[0_15px_50px_rgba(255,105,180,0.7),0_0_30px_rgba(255,20,147,0.5)]
              hover:-translate-y-1 hover:scale-105
              transition-all duration-300 ease-out
              pointer-events-auto animate-fade-in-up-delay-3 animate-float"
          >
            💌 Click for a Surprise
          </button>
        </div>
      )}

      {/* Start Overlay for Music */}
      {!hasInteracted && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md transition-opacity duration-1000">
          <button
            onClick={startMusic}
            className="px-12 py-5 rounded-full bg-primary text-primary-foreground font-display text-3xl tracking-widest
              shadow-[0_0_60px_rgba(255,105,180,0.7)] hover:scale-110 transition-all duration-500 animate-pulse
              pointer-events-auto"
          >
            Enter Our World 💖
          </button>
        </div>
      )}

      {/* Background Music (YouTube) */}
      <div id="youtube-player" className="fixed -top-[1000px] -left-[1000px] opacity-0 pointer-events-none"></div>
    </div>
  );
};

export default ValentinePage;
