import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';

/**
 * Represents a single 3D particle that seamlessly interpolates between
 * a chaotic origin position and an ordered 3D grid.
 */
class Particle3D {
  /** The target X coordinate in the ordered grid. */
  gridX: number;

  /** The target Z coordinate (depth) in the ordered grid. */
  gridZ: number;

  /** The random starting X coordinate in the initial chaos cloud. */
  chaosX: number;

  /** The random starting Y coordinate in the initial chaos cloud. */
  chaosY: number;

  /** The random starting Z coordinate in the initial chaos cloud. */
  chaosZ: number;

  /** The actual, currently rendered X position in space after applying inertia. */
  currentX: number;

  /** The actual, currently rendered Y position in space after applying inertia. */
  currentY: number;

  /** The actual, currently rendered Z position in space after applying inertia. */
  currentZ: number;

  /** The calculated X target position for the current frame (before perspective projection). */
  x: number = 0;

  /** The calculated Y target position for the current frame (before perspective projection). */
  y: number = 0;

  /** The calculated Z target position for the current frame (before perspective projection). */
  z: number = 0;

  /** The individual inertia factor for organic trailing (swarm effect). */
  inertia: number;

  /**
   * Initializes a new particle.
   *
   * @param gridX - The X coordinate of the particle in the target grid.
   * @param gridZ - The Z coordinate (depth) of the particle in the target grid.
   * @param chaosSpread - The radius of the initial spread for the chaos mode.
   */
  constructor(gridX: number, gridZ: number, chaosSpread: number) {
    this.gridX = gridX;
    this.gridZ = gridZ;

    this.chaosX = (Math.random() - 0.5) * chaosSpread;
    this.chaosY = (Math.random() - 0.5) * chaosSpread;
    this.chaosZ = (Math.random() - 0.5) * chaosSpread;

    this.currentX = this.chaosX;
    this.currentY = this.chaosY;
    this.currentZ = this.chaosZ;

    this.inertia = 0.1 + Math.random() * 0.15;
  }

  /**
   * Updates the particle's target position based on wave math and scroll factor,
   * and approaches the current position via linear interpolation (Lerp).
   *
   * @param scrollFactor - The normalized scroll value (0.0 = chaos, 1.0 = ordered grid).
   * @param time - The continuous time variable to animate the organic waves.
   */
  update(scrollFactor: number, time: number) {
    // 1. Calculate the undulating waves
    const wave1 = Math.sin(this.gridX * 0.02 + time * 0.8) * 12;
    const wave2 = Math.cos(this.gridZ * 0.03 + time * 1.1) * 10;
    const wave3 = Math.sin((this.gridX - this.gridZ) * 0.015 + time * 1.4) * 8;
    const waveY = wave1 + wave2 + wave3;

    // Ease-In-Out curve
    const ease =
      scrollFactor < 0.5
        ? 4 * scrollFactor * scrollFactor * scrollFactor
        : 1 - Math.pow(-2 * scrollFactor + 2, 3) / 2;

    // 2. Leichte Schwebeströme (Float) für den Chaos-Modus berechnen
    // Die 40 steuert den Radius, die Werte beim time (0.2) die Geschwindigkeit
    const floatX = Math.sin(this.chaosY * 0.01 + time * 0.4) * 60;
    const floatY = Math.cos(this.chaosX * 0.015 + time * 0.45) * 40;
    const floatZ = Math.sin(this.chaosZ * 0.01 + time * 0.25) * 60;

    // Den Float auf die Chaos-Startposition addieren
    // (klingt durch (1 - ease) sanft ab, je weiter gescrollt wird)
    const startX = this.chaosX + floatX * (1 - ease);
    const startY = this.chaosY + floatY * (1 - ease);
    const startZ = this.chaosZ + floatZ * (1 - ease);

    // 3. Das theoretische ZIEL (Target) in diesem exakten Frame berechnen
    // Hier nutzen wir jetzt startX/Y/Z statt der statischen chaosX/Y/Z
    const targetX = startX + (this.gridX - startX) * ease;
    const targetY = startY + (waveY - startY) * ease;
    const targetZ = startZ + (this.gridZ - startZ) * ease;

    // 4. Smooth trailing (Lerp on particle level)
    this.currentX += (targetX - this.currentX) * this.inertia;
    this.currentY += (targetY - this.currentY) * this.inertia;
    this.currentZ += (targetZ - this.currentZ) * this.inertia;

    // Pass values to x,y,z so the draw() method can render them
    this.x = this.currentX;
    this.y = this.currentY;
    this.z = this.currentZ;
  }
}

/**
 * Angular component for rendering an interactive, performant 3D particle background.
 * Renders the transition from a chaotic point cloud to a 3D wave based on scroll position.
 */
@Component({
  selector: 'app-particle-canvas',
  standalone: true,
  templateUrl: './particle-canvas.html',
  styleUrl: './particle-canvas.scss',
})
export class ParticleCanvas implements AfterViewInit, OnDestroy {
  /** Reference to the native HTML canvas element. */
  @ViewChild('particleCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number = 0;
  private scrollFactor: number = 0;
  private time: number = 0;
  private particles: Particle3D[] = [];

  // Matrix settings
  private cols = 150; // Significantly fewer columns (makes the grid narrower)
  private rows = 150; // More rows for extreme depth backwards
  private spacing = 7; // Move particles slightly closer together

  /**
   * Lifecycle hook: Called after the component view has been initialized.
   * Configures the canvas context, generates particles, and starts the render loop.
   */
  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    this.initParticles();
    this.startLoop();
  }

  /**
   * Lifecycle hook: Called just before the component is destroyed.
   * Stops the recursive render loop to prevent memory leaks.
   */
  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrameId);
  }

  /**
   * Dynamically adjusts the canvas resolution when the browser window is resized.
   */
  @HostListener('window:resize')
  resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /**
   * Captures the global scroll event and calculates the normalized transition factor.
   */
  @HostListener('window:scroll')
  onScroll() {
    const scrollDistanceForTransition = 900;
    this.scrollFactor = Math.min(window.scrollY / scrollDistanceForTransition, 1);
  }

  /**
   * Generates the initial 3D grid and instantiates all particle objects.
   */
  private initParticles() {
    this.particles = [];
    const chaosSpread = 2500;

    // Prüfen, ob der Bildschirm schmaler als ein Tablet ist (Mobile)
    const isMobile = window.innerWidth < 768;

    // Raster auf mobilen Geräten halbieren (viertelt die Gesamtanzahl der Partikel)
    const currentCols = isMobile ? Math.floor(this.cols / 2) : this.cols;
    const currentRows = isMobile ? Math.floor(this.rows / 2) : this.rows;

    // Abstand auf Mobile leicht erhöhen, damit das Netz optisch ähnlich breit wirkt
    const currentSpacing = isMobile ? this.spacing * 1.5 : this.spacing;

    for (let z = 0; z < currentRows; z++) {
      for (let x = 0; x < currentCols; x++) {
        // Weltkoordinaten mit den dynamischen Werten berechnen
        const gridX = (x - currentCols / 2) * currentSpacing;
        const gridZ = z * currentSpacing;

        this.particles.push(new Particle3D(gridX, gridZ, chaosSpread));
      }
    }
  }

  /**
   * The recursive main render loop for continuous canvas updates.
   */
  private startLoop = () => {
    this.time += 0.004; // Wave speed
    this.update();
    this.draw();
    this.animationFrameId = requestAnimationFrame(this.startLoop);
  };

  /**
   * Updates the positions of all particles and performs Z-depth sorting for correct rendering.
   */
  private update() {
    this.particles.forEach((p) => p.update(this.scrollFactor, this.time));
    // Sort particles by Z-depth (back to front for correct overlap/sizing)
    this.particles.sort((a, b) => b.z - a.z);
  }

  /**
   * Draws all particles with perspective projection (focal length) onto the 2D canvas.
   * Includes a render switch between detailed circles and performant squares for FPS optimization.
   */
  private draw() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2 - 250;
    const centerY = canvas.height / 2 + 200; // Shift wave slightly downwards

    // Camera setup
    const focalLength = 500;
    const cameraZ = 600; // Distance from camera to wave

    this.ctx.fillStyle = 'rgba(236, 236, 236, 0.9)';

    this.particles.forEach((p) => {
      const zPos = p.z + cameraZ;
      if (zPos <= 0) return;

      const scale = focalLength / zPos;
      const screenX = centerX + p.x * scale;
      const screenY = centerY + p.y * scale - p.z * 0.3;

      // Calculate radius
      const radius = Math.max(0.1, 1.2 * scale);

      // Opacity decreases the further we scroll (from 1.0 in fog to 0.25 in the wave)
      let densityAlpha: number;

      if (this.scrollFactor < 0.5) {
        // Phase 1: Die erste Hälfte des Scroll-Weges (0.0 bis 0.5)
        // localProgress läuft von 0.0 bis 1.0 in dieser Phase
        const localProgress = this.scrollFactor * 2;

        // Startet bei 0.4 (40%) und sinkt um 0.2 auf 0.2 (20%)
        densityAlpha = 0.3 - 0.2 * localProgress;
      } else {
        // Phase 2: Die zweite Hälfte des Scroll-Weges (0.5 bis 1.0)
        // localProgress läuft wieder von 0.0 bis 1.0 für diese Phase
        const localProgress = (this.scrollFactor - 0.5) * 2;

        // Startet bei 0.2 (20%) und steigt um 0.8 auf 1.0 (100%)
        densityAlpha = 0.1 + 0.8 * localProgress;
      }

      // Combine density value with depth blur (scale)
      this.ctx.globalAlpha = Math.max(0, Math.min(1, scale * densityAlpha));

      // THE RENDER SWITCH
      if (this.scrollFactor < 0.005 || radius > 3.0) {
        // High quality: Real circles
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // High performance: Simple squares for the dense wave
        this.ctx.fillRect(screenX - radius, screenY - radius, radius * 2, radius * 2);
      }
    });

    this.ctx.globalAlpha = 1;
  }
}
