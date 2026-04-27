const canvas = document.querySelector("[data-sky]");
const context = canvas.getContext("2d");
const burstButton = document.querySelector("[data-burst]");
const heart = document.querySelector("[data-heart]");
const hint = document.querySelector("[data-hint]");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const particles = [];
const ambientStars = [];
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

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  ambientStars.length = 0;
  const starCount = Math.max(18, Math.floor((width * height) / 24000));

  for (let index = 0; index < starCount; index += 1) {
    ambientStars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.8 + Math.random() * 2.6,
      alpha: 0.12 + Math.random() * 0.35,
      drift: (Math.random() - 0.5) * 0.12,
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
  context.fill();
  context.restore();
}

function spawnBurst(x, y, count, spread = 1) {
  const total = prefersReducedMotion ? Math.ceil(count * 0.35) : count;

  for (let index = 0; index < total; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (1.1 + Math.random() * 2.8) * spread;
    const size = 6 + Math.random() * 14;
    const hue = 336 + Math.random() * 22;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.4,
      gravity: 0.028 + Math.random() * 0.028,
      drag: 0.992,
      size,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.045,
      life: 0,
      maxLife: 64 + Math.random() * 40,
      color: `hsl(${hue} 100% ${72 + Math.random() * 12}%)`,
    });
  }

  heart.classList.remove("heart--bursting");
  void heart.offsetWidth;
  heart.classList.add("heart--bursting");
}

function spawnAmbientHeart() {
  particles.push({
    x: Math.random() * width,
    y: height + 40,
    vx: (Math.random() - 0.5) * 0.55,
    vy: -(0.55 + Math.random() * 0.8),
    gravity: -0.0008,
    drag: 0.997,
    size: 5 + Math.random() * 8,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.018,
    life: 0,
    maxLife: 120 + Math.random() * 90,
    color: `hsla(${332 + Math.random() * 18} 100% ${74 + Math.random() * 10}% / 1)`,
  });
}

function renderBackground() {
  context.clearRect(0, 0, width, height);

  for (const star of ambientStars) {
    star.x += star.drift;

    if (star.x < -10) {
      star.x = width + 10;
    } else if (star.x > width + 10) {
      star.x = -10;
    }

    context.beginPath();
    context.fillStyle = `rgba(255, 220, 234, ${star.alpha})`;
    context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    context.fill();
  }

  const glow = context.createRadialGradient(
    pointer.x,
    pointer.y,
    0,
    pointer.x,
    pointer.y,
    Math.max(width, height) * 0.28,
  );
  glow.addColorStop(0, "rgba(255, 109, 164, 0.15)");
  glow.addColorStop(1, "rgba(255, 109, 164, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);
}

function updateParticles() {
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
    const alpha = 1 - progress;
    const scale = particle.size * (0.9 + progress * 0.45);
    drawHeartShape(particle.x, particle.y, scale, particle.rotation, particle.color, alpha);
  }
}

function animate(now) {
  const elapsed = now - lastFrame;
  lastFrame = now;

  renderBackground();
  updateParticles();

  if (!prefersReducedMotion && now - lastAmbientSpawn > 110) {
    spawnAmbientHeart();
    lastAmbientSpawn = now;
  }

  if (pointer.active && now - lastTrailSpawn > 36) {
    spawnBurst(pointer.x, pointer.y, 4, 0.45);
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

burstButton.addEventListener("click", launchFromCenter);

window.addEventListener("pointerdown", (event) => {
  pointer.active = true;
  setPointerPosition(event.clientX, event.clientY);
  spawnBurst(event.clientX, event.clientY, 24, 0.95);
});

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
