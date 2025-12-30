
import * as THREE from 'three';

/**
 * Samples text to get particle coordinates
 */
export const getTextPoints = (text: string, count: number, size: number = 200) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  
  canvas.width = 1000;
  canvas.height = 1000;
  
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size}px Serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 500, 500);
  
  const imageData = ctx.getImageData(0, 0, 1000, 1000);
  const points: THREE.Vector3[] = [];
  
  // Collect all non-empty pixels
  const pixels: {x: number, y: number}[] = [];
  for (let y = 0; y < 1000; y += 4) {
    for (let x = 0; x < 1000; x += 4) {
      const alpha = imageData.data[(y * 1000 + x) * 4 + 3];
      if (alpha > 128) {
        pixels.push({ x, y });
      }
    }
  }
  
  // Sample from collected pixels
  for (let i = 0; i < count; i++) {
    const p = pixels[Math.floor(Math.random() * pixels.length)];
    if (!p) {
        // Fallback to random if no pixels found (safety)
        points.push(new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, 0));
        continue;
    }
    // Center and scale
    points.push(new THREE.Vector3(
      (p.x - 500) * 0.05,
      -(p.y - 500) * 0.05,
      (Math.random() - 0.5) * 0.5 // Slight Z jitter
    ));
  }
  
  return points;
};

/**
 * Generates cone points for the tree
 */
export const getTreePoints = (count: number, height: number = 10, radius: number = 4) => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    const angle = Math.random() * Math.PI * 2;
    const h = Math.random() * height;
    
    // Cone logic: radius decreases as height increases
    const currentRadius = radius * (1 - h / height);
    const spiral = h * 1.5; // Optional spiral effect
    
    points.push(new THREE.Vector3(
      Math.cos(angle + spiral) * currentRadius * Math.sqrt(Math.random()),
      h - height / 2,
      Math.sin(angle + spiral) * currentRadius * Math.sqrt(Math.random())
    ));
  }
  return points;
};

/**
 * Generates scattered points
 */
export const getScatteredPoints = (count: number, range: number = 15) => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    points.push(new THREE.Vector3(
      (Math.random() - 0.5) * range,
      (Math.random() - 0.5) * range,
      (Math.random() - 0.5) * range
    ));
  }
  return points;
};
