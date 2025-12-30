
import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { AppState, TreeDisplayMode, UserPhoto } from '../types';
import { PARTICLE_COUNT, ORNAMENT_COUNT, COLORS } from '../constants';
import { getTextPoints, getTreePoints, getScatteredPoints } from '../utils/particleUtils';

interface ExperienceProps {
  appState: AppState;
  treeMode: TreeDisplayMode;
  countdownValue: string;
  userPhotos: UserPhoto[];
  focusedPhotoId: string | null;
  onTransitionComplete: (state: AppState) => void;
  onPhotoClick: (id: string) => void;
}

const Experience: React.FC<ExperienceProps> = ({ 
  appState, 
  treeMode, 
  countdownValue, 
  userPhotos, 
  focusedPhotoId,
  onTransitionComplete,
  onPhotoClick
}) => {
  const { camera } = useThree();
  const particleSystemRef = useRef<THREE.Points>(null!);
  const ornamentsRef = useRef<THREE.Group>(null!);
  const photoGroupRef = useRef<THREE.Group>(null!);
  const rotationState = useRef({ y: 0, autoRotate: true, oscillation: 0 });
  
  const positions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const basePositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const particleSizes = useMemo(() => {
    const s = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) s[i] = Math.random() * 0.12 + 0.05;
    return s;
  }, []);

  useEffect(() => {
    const initial = getScatteredPoints(PARTICLE_COUNT, 30);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      basePositions[i * 3] = initial[i].x;
      basePositions[i * 3 + 1] = initial[i].y;
      basePositions[i * 3 + 2] = initial[i].z;
      positions[i * 3] = initial[i].x;
      positions[i * 3 + 1] = initial[i].y;
      positions[i * 3 + 2] = initial[i].z;
    }
  }, []);

  const animateTo = (newPoints: THREE.Vector3[], duration: number = 1.5, ease: string = 'power3.inOut') => {
    const proxy = { t: 0 };
    const startPos = [...basePositions];
    gsap.to(proxy, {
      t: 1,
      duration,
      ease,
      onUpdate: () => {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const pt = newPoints[i] || new THREE.Vector3(0, 0, 0);
          basePositions[i * 3] = THREE.MathUtils.lerp(startPos[i * 3], pt.x, proxy.t);
          basePositions[i * 3 + 1] = THREE.MathUtils.lerp(startPos[i * 3 + 1], pt.y, proxy.t);
          basePositions[i * 3 + 2] = THREE.MathUtils.lerp(startPos[i * 3 + 2], pt.z, proxy.t);
        }
      }
    });
  };

  useEffect(() => {
    if (appState === AppState.COUNTDOWN) {
      rotationState.current.autoRotate = false;
      gsap.to(rotationState.current, {
        y: Math.round(rotationState.current.y / (Math.PI * 2)) * (Math.PI * 2),
        duration: 1.5,
        ease: 'power2.out'
      });
      const pts = getTextPoints(countdownValue, PARTICLE_COUNT);
      animateTo(pts, 0.8, 'elastic.out(1, 0.75)');
    } else if (appState === AppState.TRANSITION_TO_2026) {
      rotationState.current.autoRotate = false;
      gsap.to(rotationState.current, {
        y: Math.round(rotationState.current.y / (Math.PI * 2)) * (Math.PI * 2),
        duration: 2,
        ease: 'power4.inOut'
      });
      const pts = getTextPoints('2026', PARTICLE_COUNT, 250);
      animateTo(pts, 2, 'power4.inOut');
      setTimeout(() => onTransitionComplete(AppState.TREE_ASSEMBLE), 3500);
    } else if (appState === AppState.TREE_ASSEMBLE || (appState === AppState.INTERACTIVE_TREE && treeMode === TreeDisplayMode.COMPACT)) {
      rotationState.current.autoRotate = true;
      const pts = getTreePoints(PARTICLE_COUNT);
      animateTo(pts, 2.5, 'back.out(1.2)');
    } else if (appState === AppState.INTERACTIVE_TREE && treeMode === TreeDisplayMode.SCATTERED) {
      rotationState.current.autoRotate = true;
      const pts = getScatteredPoints(PARTICLE_COUNT, 20);
      animateTo(pts, 2, 'power2.out');
    }
  }, [appState, countdownValue, treeMode, onTransitionComplete]);

  useEffect(() => {
    if (!ornamentsRef.current) return;
    const children = ornamentsRef.current.children;
    children.forEach((child, i) => {
      let targetPos = new THREE.Vector3();
      if (appState === AppState.TREE_ASSEMBLE || (appState === AppState.INTERACTIVE_TREE && treeMode === TreeDisplayMode.COMPACT)) {
          const h = (i / children.length) * 10 - 5;
          const r = 4 * (1 - (h + 5) / 10);
          const angle = i * 0.8;
          targetPos.set(Math.cos(angle) * r, h, Math.sin(angle) * r);
      } else {
          targetPos.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
      }
      gsap.to(child.position, { x: targetPos.x, y: targetPos.y, z: targetPos.z, duration: 2, ease: 'power3.inOut' });
    });
  }, [appState, treeMode]);

  useEffect(() => {
    if (!photoGroupRef.current) return;
    photoGroupRef.current.children.forEach((photo, i) => {
        const isFocused = photo.name === focusedPhotoId;
        let targetPos = new THREE.Vector3();
        let targetRot = new THREE.Euler(0, 0, 0);
        let targetScale = new THREE.Vector3(1, 1, 1);

        if (treeMode === TreeDisplayMode.COMPACT) {
            targetScale.set(0, 0, 0);
        } else if (isFocused) {
            targetPos.set(0, 0, 8);
            targetRot.set(0, 0, 0);
            targetScale.set(4, 4, 1);
        } else if (treeMode === TreeDisplayMode.SCATTERED) {
            const seed = i * 13.37;
            targetPos.set(
              Math.sin(seed) * 10,
              Math.cos(seed * 0.8) * 8,
              Math.sin(seed * 0.5) * 8
            );
            targetScale.set(1.5, 1.5, 1);
        }

        gsap.to(photo.position, { x: targetPos.x, y: targetPos.y, z: targetPos.z, duration: 2, ease: 'power2.inOut' });
        gsap.to(photo.scale, { x: targetScale.x, y: targetScale.y, z: targetScale.z, duration: 1.5, ease: 'back.out(1.7)' });
        if (isFocused) {
          gsap.to(photo.rotation, { x: targetRot.x, y: targetRot.y, z: targetRot.z, duration: 1 });
        }
    });
  }, [userPhotos, treeMode, focusedPhotoId]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (rotationState.current.autoRotate) {
      rotationState.current.y += delta * 0.2;
    } else {
      rotationState.current.oscillation = Math.sin(t * 0.5) * 0.05;
    }

    const currentY = rotationState.current.y + rotationState.current.oscillation;

    if (particleSystemRef.current) {
      particleSystemRef.current.rotation.y = currentY;
      const posAttr = particleSystemRef.current.geometry.attributes.position;
      const shimmerIntensity = (appState === AppState.COUNTDOWN || appState === AppState.TRANSITION_TO_2026) ? 0.02 : 0.01;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;
        posAttr.array[idx] = basePositions[idx] + Math.sin(t * 2 + i) * shimmerIntensity;
        posAttr.array[idx + 1] = basePositions[idx + 1] + Math.cos(t * 1.5 + i) * shimmerIntensity;
        posAttr.array[idx + 2] = basePositions[idx + 2] + Math.sin(t * 3 + i) * shimmerIntensity;
      }
      posAttr.needsUpdate = true;
    }
    
    if (ornamentsRef.current) {
      ornamentsRef.current.rotation.y = (appState === AppState.INTERACTIVE_TREE && treeMode === TreeDisplayMode.COMPACT) ? currentY * 1.5 : currentY;
    }
    
    if (photoGroupRef.current) {
      if (treeMode === TreeDisplayMode.SCATTERED) {
        photoGroupRef.current.rotation.y = currentY * 0.5;
        // Keep individual photos facing forward relative to camera while floating
        photoGroupRef.current.children.forEach(photo => {
          if (photo.name !== focusedPhotoId) {
            photo.lookAt(camera.position);
          }
        });
      } else if (treeMode === TreeDisplayMode.PHOTO_FOCUS) {
        photoGroupRef.current.rotation.y = 0;
      }
    }
  });

  return (
    <>
      <color attach="background" args={['#000']} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color={COLORS.GOLD} />
      <spotLight position={[-10, 20, 10]} intensity={2} angle={0.3} penumbra={1} color={COLORS.WHITE} />

      <points ref={particleSystemRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={PARTICLE_COUNT} array={particleSizes} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial size={0.06} color={COLORS.GOLD} transparent opacity={0.8} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>

      <group ref={ornamentsRef}>
        {Array.from({ length: ORNAMENT_COUNT }).map((_, i) => (
          <mesh key={i} position={[(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20]}>
            {i % 3 === 0 ? <sphereGeometry args={[0.15, 16, 16]} /> : i % 3 === 1 ? <boxGeometry args={[0.2, 0.2, 0.2]} /> : <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />}
            <meshStandardMaterial color={i % 2 === 0 ? COLORS.RED : COLORS.GOLD} metalness={0.8} roughness={0.2} emissive={i % 2 === 0 ? COLORS.RED : COLORS.GOLD} emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>

      <group ref={photoGroupRef}>
        {userPhotos.map((photo) => (
          <PhotoPlane key={photo.id} photo={photo} onClick={() => onPhotoClick(photo.id)} />
        ))}
      </group>

      <fog attach="fog" args={['#000', 10, 50]} />
    </>
  );
};

const PhotoPlane: React.FC<{ photo: UserPhoto; onClick: () => void }> = ({ photo, onClick }) => {
    const texture = useMemo(() => new THREE.TextureLoader().load(photo.url), [photo.url]);
    return (
        <group name={photo.id} onClick={(e) => { e.stopPropagation(); onClick(); }}>
            <mesh>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent opacity={0.9} />
            </mesh>
            <mesh position={[0,0,-0.01]}>
                <planeGeometry args={[1.05, 1.05]} />
                <meshBasicMaterial color={COLORS.GOLD} transparent opacity={0.4} />
            </mesh>
        </group>
    );
};

export default Experience;
