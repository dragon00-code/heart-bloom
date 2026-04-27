const canvas = document.querySelector("[data-sky]");
const context = canvas.getContext("2d");
const petalsLayer = document.querySelector("[data-petals]");
const burstButton = document.querySelector("[data-burst]");
const heart = document.querySelector("[data-heart]");
const hint = document.querySelector("[data-hint]");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const particles = [];
const ambientStars = [];
const ambientOrbs = [];
const pointer = {
  active: false,
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
};

let width = 0;
let height = 0;
let lastFrame = performance.now();
let lastAmbientSpawn = 0;
let lastTrailSpawn = 0;
let sceneFlash = 0;
let heartFlashTimer = null;
const activePetals = [];

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, prefersReducedMotion ? 1.25 : 1.5);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  ambientStars.length = 0;
  ambientOrbs.length = 0;
  const starCount = Math.max(12, Math.floor((width * height) / 36000));
  const orbCount = Math.max(4, Math.floor((width * height) / 120000));

  for (let index = 0; index < starCount; index += 1) {
    ambientStars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.8 + Math.random() * 2.2,
      alpha: 0.14 + Math.random() * 0.3,
      drift: (Math.random() - 0.5) * 0.08,
    });
  }

  for (let index = 0; index < orbCount; index += 1) {
    ambientOrbs.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 40 + Math.random() * 110,
      alpha: 0.045 + Math.random() * 0.08,
      hue: 328 + Math.random() * 28,
      driftX: (Math.random() - 0.5) * 0.14,
      driftY: (Math.random() - 0.5) * 0.1,
      pulse: 0.6 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
    });
  }
}

function drawHeartShape(x, y, size, rotation, color, alpha) {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.scale(size, size);
  context.beginPath();
  context.moveTo(0, 0.35);
  context.bezierCurveTo(-0.55, -0.15, -1, 0.2, 0, 1);
  context.bezierCurveTo(1, 0.2, 0.55, -0.15, 0, 0.35);
  context.closePath();
  context.fillStyle = color;
  context.globalAlpha = alpha;
  context.shadowBlur = 12;
  context.shadowColor = color;
  context.fill();
  context.restore();
}

function triggerHeartFlash() {
  heart.classList.remove("heart--flaring");
  void heart.offsetWidth;
  heart.classList.add("heart--flaring");

  if (heartFlashTimer) {
    window.clearTimeout(heartFlashTimer);
  }

  heartFlashTimer = window.setTimeout(() => {
    heart.classList.remove("heart--flaring");
    heartFlashTimer = null;
  }, 420);
}

function drawSpark(x, y, size, color, alpha) {
  context.save();
  context.translate(x, y);
  context.fillStyle = color;
  context.globalAlpha = alpha;
  context.shadowBlur = 10;
  context.shadowColor = color;
  context.beginPath();
  context.arc(0, 0, size, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function spawnPetals(x, y, count, spread = 1) {
  if (!petalsLayer) {
    return;
  }

  const total = prefersReducedMotion ? Math.ceil(count * 0.4) : count;

  for (let index = 0; index < total; index += 1) {
    const petal = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = (24 + Math.random() * 96) * spread;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - (18 + Math.random() * 34);
    const scale = 0.7 + Math.random() * 0.55;
    const hue = 332 + Math.random() * 24;
    const delay = Math.random() * 60;

    petal.className = "petal";
    petal.style.left = `${x}px`;
    petal.style.top = `${y}px`;
    petal.style.setProperty("--dx", `${dx}px`);
    petal.style.setProperty("--dy", `${dy}px`);
    petal.style.setProperty("--rot", `${Math.round(Math.random() * 360)}deg`);
    petal.style.setProperty("--scale", String(scale));
    petal.style.background = `linear-gradient(180deg, hsla(${hue} 100% 96% / 0.98), hsla(${hue} 100% 72% / 0.9) 62%, hsla(${hue + 10} 100% 58% / 0.92))`;
    petal.style.animationDelay = `${delay}ms`;

    petalsLayer.appendChild(petal);

    activePetals.push({
      el: petal,
      expiresAt: performance.now() + 900 + delay,
    });
  }
}

function spawnBurst(x, y, count, spread = 1) {
  const total = prefersReducedMotion ? Math.ceil(count * 0.5) : count;
  sceneFlash = Math.min(1, sceneFlash + 0.32);
  spawnPetals(x, y, Math.max(5, Math.floor(count * 0.65)), spread * 0.9);

  for (let index = 0; index < total; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (1.2 + Math.random() * 2.7) * spread;
    const size = 4 + Math.random() * 10;
    const hue = 334 + Math.random() * 28;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.55,
      gravity: 0.022 + Math.random() * 0.024,
      drag: 0.989,
      size,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.07,
      life: 0,
      maxLife: 72 + Math.random() * 52,
      kind: "heart",
      color: `hsl(${hue} 100% ${75 + Math.random() * 10}%)`,
    });
  }

  const ringCount = prefersReducedMotion ? 4 : 8;
  for (let index = 0; index < ringCount; index += 1) {
    const angle = (Math.PI * 2 * index) / ringCount + Math.random() * 0.12;
    particles.push({
      x: x + Math.cos(angle) * 10,
      y: y + Math.sin(angle) * 10,
      vx: Math.cos(angle) * (0.5 + Math.random() * 0.8) * spread,
      vy: Math.sin(angle) * (0.5 + Math.random() * 0.8) * spread - 0.12,
      gravity: 0.008 + Math.random() * 0.01,
      drag: 0.992,
      size: 2 + Math.random() * 2.2,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.09,
      life: 0,
      maxLife: 42 + Math.random() * 20,
      kind: "spark",
      color: `hsl(${328 + Math.random() * 30} 100% ${82 + Math.random() * 10}%)`,
    });
  }

  triggerHeartFlash();
}

function spawnAmbientHeart() {
  particles.push({
    x: Math.random() * width,
    y: height + 40,
    vx: (Math.random() - 0.5) * 0.55,
    vy: -(0.55 + Math.random() * 0.7),
    gravity: -0.0006,
    drag: 0.997,
    size: 4 + Math.random() * 6,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.016,
    life: 0,
    maxLife: 100 + Math.random() * 70,
    kind: "heart",
    color: `hsla(${332 + Math.random() * 18} 100% ${78 + Math.random() * 10}% / 1)`,
  });
}

function renderBackground() {
  const time = performance.now() * 0.001;
  context.clearRect(0, 0, width, height);

  for (const star of ambientStars) {
    star.x += star.drift;

    if (star.x < -10) {
      star.x = width + 10;
    } else if (star.x > width + 10) {
      star.x = -10;
    }

    context.beginPath();
    context.fillStyle = `rgba(255, 224, 238, ${star.alpha})`;
    context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    context.fill();
  }

  context.save();
  context.globalCompositeOperation = "screen";

  for (const orb of ambientOrbs) {
    orb.x += orb.driftX;
    orb.y += orb.driftY;

    if (orb.x < -orb.radius) {
      orb.x = width + orb.radius;
    } else if (orb.x > width + orb.radius) {
      orb.x = -orb.radius;
    }

    if (orb.y < -orb.radius) {
      orb.y = height + orb.radius;
    } else if (orb.y > height + orb.radius) {
      orb.y = -orb.radius;
    }

    const pulse = 0.72 + Math.sin(time * orb.pulse + orb.phase) * 0.18;
    const gradient = context.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
    gradient.addColorStop(0, `hsla(${orb.hue} 100% 84% / ${orb.alpha * 1.05 * pulse})`);
    gradient.addColorStop(0.35, `hsla(${orb.hue} 100% 74% / ${orb.alpha * 0.55 * pulse})`);
    gradient.addColorStop(1, "hsla(0 0% 100% / 0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    context.fill();
  }

  const glow = context.createRadialGradient(
    pointer.x,
    pointer.y,
    0,
    pointer.x,
    pointer.y,
    Math.max(width, height) * 0.34,
  );
  glow.addColorStop(0, "rgba(255, 188, 219, 0.12)");
  glow.addColorStop(0.32, "rgba(255, 109, 164, 0.06)");
  glow.addColorStop(1, "rgba(255, 109, 164, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  const veil = context.createRadialGradient(
    width * 0.18,
    height * 0.82,
    0,
    width * 0.18,
    height * 0.82,
    Math.max(width, height) * 0.7,
  );
  veil.addColorStop(0, "rgba(255, 173, 203, 0.05)");
  veil.addColorStop(0.45, "rgba(255, 114, 167, 0.02)");
  veil.addColorStop(1, "rgba(255, 114, 167, 0)");
  context.fillStyle = veil;
  context.fillRect(0, 0, width, height);

  context.restore();

  if (sceneFlash > 0.001) {
    const flash = context.createRadialGradient(
      pointer.x,
      pointer.y,
      0,
      pointer.x,
      pointer.y,
      Math.max(width, height) * 0.45,
    );
    flash.addColorStop(0, `rgba(255, 241, 248, ${sceneFlash * 0.34})`);
    flash.addColorStop(0.22, `rgba(255, 116, 166, ${sceneFlash * 0.18})`);
    flash.addColorStop(1, "rgba(255, 116, 166, 0)");
    context.fillStyle = flash;
    context.fillRect(0, 0, width, height);
    sceneFlash *= 0.92;
  }
}

function updateParticles() {
  context.save();
  context.globalCompositeOperation = "lighter";

  for (let index = particles.length - 1; index >= 0; index -= 1) {
    const particle = particles[index];
    particle.life += 1;

    if (particle.life >= particle.maxLife) {
      particles.splice(index, 1);
      continue;
    }

    particle.vx *= particle.drag;
    particle.vy = particle.vy * particle.drag + particle.gravity;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.rotation += particle.spin;

    const progress = particle.life / particle.maxLife;
    const alpha = Math.max(0, 1 - progress);
    const scale = particle.size * (particle.kind === "spark" ? 0.85 + progress * 0.2 : 0.92 + progress * 0.5);

    if (particle.kind === "spark") {
      drawSpark(particle.x, particle.y, scale, particle.color, alpha * 0.95);
    } else {
      drawHeartShape(particle.x, particle.y, scale, particle.rotation, particle.color, alpha);
    }
  }

  context.restore();
}

function updatePetals(now) {
  for (let index = activePetals.length - 1; index >= 0; index -= 1) {
    const petal = activePetals[index];

    if (now >= petal.expiresAt) {
      petal.el.remove();
      activePetals.splice(index, 1);
    }
  }
}

function animate(now) {
  const elapsed = now - lastFrame;
  lastFrame = now;

  renderBackground();
  updateParticles();
  updatePetals(now);

  if (!prefersReducedMotion && now - lastAmbientSpawn > 180) {
    spawnAmbientHeart();
    lastAmbientSpawn = now;
  }

  if (pointer.active && now - lastTrailSpawn > 52) {
    spawnBurst(pointer.x, pointer.y, 3, 0.32);
    lastTrailSpawn = now;
  }

  if (elapsed >= 0) {
    window.requestAnimationFrame(animate);
  }
}

function setPointerPosition(clientX, clientY) {
  pointer.x = clientX;
  pointer.y = clientY;
}

function launchFromCenter() {
  const rect = heart.getBoundingClientRect();
  spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 36, 1.1);
  hint.textContent = "再点一次，或者滑动屏幕，让爱心一路开花。";
}

function spawnClickBloom(x, y) {
  spawnBurst(x, y, 24, 0.95);

  window.setTimeout(() => {
    spawnBurst(x, y, 10, 0.62);
  }, 90);
}

burstButton.addEventListener("click", launchFromCenter);

window.addEventListener("pointerdown", (event) => {
  pointer.active = true;
  setPointerPosition(event.clientX, event.clientY);

  if (event.pointerType === "mouse") {
    spawnClickBloom(event.clientX, event.clientY);
  } else {
    spawnBurst(event.clientX, event.clientY, 32, 1);
  }
});

if (!window.PointerEvent) {
  window.addEventListener("mousedown", (event) => {
    pointer.active = true;
    setPointerPosition(event.clientX, event.clientY);
    spawnClickBloom(event.clientX, event.clientY);
  });
  window.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      pointer.active = true;
      setPointerPosition(touch.clientX, touch.clientY);
      spawnBurst(touch.clientX, touch.clientY, 20, 0.95);
    },
    { passive: true },
  );
}

window.addEventListener("pointermove", (event) => {
  setPointerPosition(event.clientX, event.clientY);
});

window.addEventListener("pointerup", () => {
  pointer.active = false;
});

window.addEventListener("pointercancel", () => {
  pointer.active = false;
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
launchFromCenter();
window.requestAnimationFrame(animate);
