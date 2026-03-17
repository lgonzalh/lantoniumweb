/**
 * REPLICA DE ALTA PRECISIÓN: MICROORGANISMOS REACTIVOS (ULTRA-STABLE)
 * Estética: Bacilos Gram, cortos, redondeados y con volumen.
 */

class Particle {
  constructor(color) {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.vx = (Math.random() - 0.5) * 0.1;
    this.vy = (Math.random() - 0.5) * 0.1;
    this.size = 7.0 + Math.random() * 7.0; // Doubled from 3.5
    this.aspect = 1.3 + Math.random() * 0.7;
    this.color = color;
    this.phase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.04 + Math.random() * 0.05;
  }
}

class ReactiveSwarm {
  constructor() {
    this.canvas = document.querySelector('.particle-canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'particle-canvas';
      // Insertar al principio para que esté detrás de todo por defecto
      document.body.insertBefore(this.canvas, document.body.firstChild);
    }

    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.dpr = window.devicePixelRatio || 1;

    this.numParticles = (window.innerWidth < 768) ? 180 : 420; // Default
    this.palette = ["rgba(164, 198, 57, 0.85)"]; // Android Green (Andy)
    this.isVisible = true;
    
    fetch('/content/site.json?t=' + Date.now())
      .then(r => r.json())
      .then(d => {
         if (d && d.settings) {
             if (d.settings.andyCount !== undefined) this.numParticles = parseInt(d.settings.andyCount);
             if (d.settings.andyColor) this.palette = [d.settings.andyColor];
             if (d.settings.andyVisible !== undefined) this.isVisible = d.settings.andyVisible;
             
             this.canvas.style.display = this.isVisible ? 'block' : 'none';
             this.createParticles();
         }
      })
      .catch(()=>{});
      
    window.updateAndys = (cfg) => {
       if (cfg.count !== undefined) this.numParticles = parseInt(cfg.count);
       if (cfg.color !== undefined) this.palette = [cfg.color];
       if (cfg.visible !== undefined) {
           this.isVisible = cfg.visible;
           this.canvas.style.display = this.isVisible ? 'block' : 'none';
       }
       this.createParticles();
    };

    this.radius = 220; // Increased interaction radius
    this.friction = 0.985;

    this.FORCE_A = 1.35;
    this.ALPHA = 0.012;
    this.BETA = 4.8;
    this.swirl = 0.22;

    this.particles = [];
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.smoothMouse = { ...this.mouse };

    this.setupEventListeners();
    this.resize();
    this.createParticles();
    this.animate();
  }

  resize() {
    this.dpr = window.devicePixelRatio || 1;
    const rect = { width: window.innerWidth, height: window.innerHeight };
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push(new Particle(this.palette[i % this.palette.length]));
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  forceField(dist, R) {
    const nd = dist / R;
    if (nd >= 1) return 0;
    return this.FORCE_A * Math.exp(-this.ALPHA * dist) * (1 - Math.exp(-this.BETA * (1 - nd)));
  }

  animate() {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.smoothMouse.x += (this.mouse.x - this.smoothMouse.x) * 0.15;
    this.smoothMouse.y += (this.mouse.y - this.smoothMouse.y) * 0.15;

    this.ctx.lineCap = "round";

    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      const dx = p.x - this.smoothMouse.x;
      const dy = p.y - this.smoothMouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const force = this.forceField(dist, this.radius);
      if (force > 0) {
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);
        p.vx += nx * force * 2.5;
        p.vy += ny * force * 2.5;
        p.vx += -ny * force * this.swirl * 4.5;
        p.vy += nx * force * this.swirl * 4.5;
      }

      p.vx *= this.friction;
      p.vy *= this.friction;
      p.x += p.vx;
      p.y += p.vy;
      p.phase += p.pulseSpeed;

      if (p.x < -30) p.x = w + 30;
      else if (p.x > w + 30) p.x = -30;
      if (p.y < -30) p.y = h + 30;
      else if (p.y > h + 30) p.y = -30;

      const pulse = 1 + Math.sin(p.phase) * 0.15;
      const angle = Math.atan2(p.vy, p.vx);
      const size = p.size * pulse;

      // DIBUJO DE PRECISIÓN: Andy (Bugdroid)
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(angle + Math.PI / 2); // Orientación frontal dinámica

      this.ctx.fillStyle = p.color;

      // 1. CABEZA
      this.ctx.beginPath();
      this.ctx.arc(0, -size * 0.2, size * 0.48, Math.PI, 0);
      this.ctx.fill();

      // 2. ANTENAS
      this.ctx.lineWidth = size * 0.08;
      this.ctx.strokeStyle = p.color;
      this.ctx.lineCap = "round";

      this.ctx.beginPath();
      this.ctx.moveTo(-size * 0.2, -size * 0.5);
      this.ctx.lineTo(-size * 0.35, -size * 0.75);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(size * 0.2, -size * 0.5);
      this.ctx.lineTo(size * 0.35, -size * 0.75);
      this.ctx.stroke();

      // 3. CUERPO
      this.ctx.beginPath();
      // Dibujamos un rectángulo con las esquinas inferiores redondeadas
      const bodyW = size * 0.95;
      const bodyH = size * 0.8;
      const r_body = size * 0.12;
      this.ctx.roundRect(-bodyW / 2, -size * 0.15, bodyW, bodyH, [0, 0, r_body, r_body]);
      this.ctx.fill();

      // 4. EXTREMIDADES
      const armW = size * 0.2;
      const armH = size * 0.65;
      const armR = armW / 2;
      const armGap = size * 0.05;

      // Brazo Izquierdo
      this.ctx.beginPath();
      this.ctx.roundRect(-bodyW / 2 - armW - armGap, -size * 0.1, armW, armH, armR);
      this.ctx.fill();

      // Brazo Derecho
      this.ctx.beginPath();
      this.ctx.roundRect(bodyW / 2 + armGap, -size * 0.1, armW, armH, armR);
      this.ctx.fill();

      // Piernas
      const legW = size * 0.2;
      const legH = size * 0.4;
      this.ctx.beginPath();
      this.ctx.roundRect(-size * 0.25, size * 0.6, legW, legH, [0, 0, legW / 2, legW / 2]);
      this.ctx.roundRect(size * 0.05, size * 0.6, legW, legH, [0, 0, legW / 2, legW / 2]);
      this.ctx.fill();

      // 5. OJOS
      this.ctx.fillStyle = "#ffffff";
      this.ctx.beginPath();
      this.ctx.arc(-size * 0.18, -size * 0.35, size * 0.08, 0, Math.PI * 2);
      this.ctx.arc(size * 0.18, -size * 0.35, size * 0.08, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    if (this.smoothMouse.x > 0) {
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.beginPath();
      this.ctx.arc(this.smoothMouse.x, this.smoothMouse.y, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = "#4c6eff";
      this.ctx.fill();
    }

    requestAnimationFrame(() => this.animate());
  }
}

// Inicialización segura
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ReactiveSwarm());
} else {
  new ReactiveSwarm();
}