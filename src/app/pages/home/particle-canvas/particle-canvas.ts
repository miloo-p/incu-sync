import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';

/**
 * Represents an individual 3D particle operating within an interpolated coordinate system,
 * transitioning smoothly from a randomized chaos cloud to an undulating grid structure.
 */
class Particle3D {
  /** Target horizontal position within the ordered grid. */
  gridX: number;

  /** Target depth position within the ordered grid. */
  gridZ: number;

  /** Stochastic origin offset along the horizontal axis. */
  chaosX: number;

  /** Stochastic origin offset along the vertical axis. */
  chaosY: number;

  /** Stochastic origin offset along the depth axis. */
  chaosZ: number;

  /** Current intermediate horizontal world coordinate after inertia calculation. */
  currentX: number;

  /** Current intermediate vertical world coordinate after inertia calculation. */
  currentY: number;

  /** Current intermediate depth world coordinate after inertia calculation. */
  currentZ: number;

  /** Rendered coordinate along the horizontal axis prior to projection. */
  x: number = 0;

  /** Rendered coordinate along the vertical axis prior to projection. */
  y: number = 0;

  /** Rendered coordinate along the depth axis prior to projection. */
  z: number = 0;

  /** Inertia resistance factor applied during linear interpolation step. */
  inertia: number;

  /**
   * Instantiates a single 3D particle with bounded random initial positioning.
   *
   * @param gridX - Grid-relative horizontal target coordinate.
   * @param gridZ - Grid-relative depth target coordinate.
   * @param chaosSpread - Maximum radial scattering distance for initial positioning.
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
   * Computes mathematical wave oscillation, non-linear progression easing,
   * ambient floating offsets, and frame-by-frame interpolation.
   *
   * @param scrollFactor - Normalized page scroll progress ranging from 0.0 to 1.0.
   * @param time - Continuous elapsed time counter governing trigonometric wave movements.
   */
  update(scrollFactor: number, time: number): void {
    const wave1 = Math.sin(this.gridX * 0.02 + time * 0.8) * 12;
    const wave2 = Math.cos(this.gridZ * 0.03 + time * 1.1) * 10;
    const wave3 = Math.sin((this.gridX - this.gridZ) * 0.015 + time * 1.4) * 8;
    const waveY = wave1 + wave2 + wave3;

    const ease =
      scrollFactor < 0.5
        ? 4 * scrollFactor * scrollFactor * scrollFactor
        : 1 - Math.pow(-2 * scrollFactor + 2, 3) / 2;

    const floatX = Math.sin(this.chaosY * 0.01 + time * 0.4) * 60;
    const floatY = Math.cos(this.chaosX * 0.015 + time * 0.45) * 40;
    const floatZ = Math.sin(this.chaosZ * 0.01 + time * 0.25) * 60;

    const startX = this.chaosX + floatX * (1 - ease);
    const startY = this.chaosY + floatY * (1 - ease);
    const startZ = this.chaosZ + floatZ * (1 - ease);

    const targetX = startX + (this.gridX - startX) * ease;
    const targetY = startY + (waveY - startY) * ease;
    const targetZ = startZ + (this.gridZ - startZ) * ease;

    this.currentX += (targetX - this.currentX) * this.inertia;
    this.currentY += (targetY - this.currentY) * this.inertia;
    this.currentZ += (targetZ - this.currentZ) * this.inertia;

    this.x = this.currentX;
    this.y = this.currentY;
    this.z = this.currentZ;
  }
}

/**
 * High-performance standalone component managing a 3D perspective projection particle canvas.
 * Implements camera projection, responsive grid scaling, and scroll-driven opacity transitions.
 */
@Component({
  selector: 'app-particle-canvas',
  standalone: true,
  templateUrl: './particle-canvas.html',
  styleUrl: './particle-canvas.scss',
})
export class ParticleCanvas implements AfterViewInit, OnDestroy {
  /** DOM element reference pointing to the native HTML5 rendering canvas. */
  @ViewChild('particleCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  /** Two-dimensional canvas graphics rendering pipeline. */
  private ctx!: CanvasRenderingContext2D;

  /** Identifier token used to terminate the recursive animation frame loop. */
  private animationFrameId: number = 0;

  /** Normalized interpolation factor derived from scroll progression. */
  private scrollFactor: number = 0;

  /** Global opacity scalar applied across the complete particle collective. */
  private fadeOpacity: number = 1;

  /** Internal monotonic tick counter tracking wave phase progression. */
  private time: number = 0;

  /** Collection of allocated active 3D particle entities. */
  private particles: Particle3D[] = [];

  /** Horizontal dimension count for ordered point array synthesis. */
  private cols = 100;

  /** Longitudinal dimension count providing scene depth representation. */
  private rows = 150;

  /** Equidistant spacing constant separating discrete particle nodes. */
  private spacing = 7;

  /**
   * Initializes canvas drawing context, resolves base viewport dimensions,
   * populates the coordinate matrix, and commences frame iteration.
   */
  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    this.initParticles();
    this.startLoop();
  }

  /**
   * Halts active animation sequences to prevent browser thread leaks upon component destruction.
   */
  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
  }

  /**
   * Resets rendering buffer dimensions to correspond directly to client viewport size.
   */
  @HostListener('window:resize')
  resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /**
   * Tracks window displacement metrics to compute non-linear grid progression
   * and terminal fade-out decay thresholds.
   */
  @HostListener('window:scroll')
  onScroll(): void {
    const scrollY = window.scrollY;

    const scrollDistanceForTransition = 900;
    this.scrollFactor = Math.min(scrollY / scrollDistanceForTransition, 1);

    const fadeStart = 1200;
    const fadeEnd = fadeStart + 400;

    if (scrollY <= fadeStart) {
      this.fadeOpacity = 1;
    } else {
      this.fadeOpacity = Math.max(0, 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart));
    }
  }

  /**
   * Constructs particle objects into an array, applying viewport density adjustments
   * when rendering under limited mobile display dimensions.
   */
  private initParticles(): void {
    this.particles = [];
    const chaosSpread = 2500;
    const isMobile = window.innerWidth < 768;

    const currentCols = isMobile ? Math.floor(this.cols / 2) : this.cols;
    const currentRows = isMobile ? Math.floor(this.rows / 2) : this.rows;
    const currentSpacing = isMobile ? this.spacing * 1.5 : this.spacing;

    for (let z = 0; z < currentRows; z++) {
      for (let x = 0; x < currentCols; x++) {
        const gridX = (x - currentCols / 2) * currentSpacing;
        const gridZ = z * currentSpacing;
        this.particles.push(new Particle3D(gridX, gridZ, chaosSpread));
      }
    }
  }

  /**
   * Recursive animation routine driving coordinate mutation, depth sorting, and rendering.
   */
  private startLoop = (): void => {
    this.time += 0.004;
    this.update();
    this.draw();
    this.animationFrameId = requestAnimationFrame(this.startLoop);
  };

  /**
   * Steps the state of each particle forward and sorts instances back-to-front by Z-depth.
   */
  private update(): void {
    this.particles.forEach((p) => p.update(this.scrollFactor, this.time));
    this.particles.sort((a, b) => b.z - a.z);
  }

  /**
   * Projects 3D spatial points onto the 2D surface using perspective division
   * and executes draw operations based on distance and visual density thresholds.
   */
  private draw(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.fadeOpacity === 0) return;

    const centerX = canvas.width / 2 - 350;
    const centerY = canvas.height / 2 + 200;
    const focalLength = 500;
    const cameraZ = 600;

    this.ctx.fillStyle = 'rgba(236, 236, 236, 0.9)';

    this.particles.forEach((p) => {
      const zPos = p.z + cameraZ;
      if (zPos <= 0) return;

      const scale = focalLength / zPos;
      const screenX = centerX + p.x * scale;
      const screenY = centerY + p.y * scale - p.z * 0.3;
      const radius = Math.max(0.1, 1.2 * scale);

      let densityAlpha: number;
      if (this.scrollFactor < 0.5) {
        const localProgress = this.scrollFactor * 2;
        densityAlpha = 0.3 - 0.2 * localProgress;
      } else {
        const localProgress = (this.scrollFactor - 0.5) * 2;
        densityAlpha = 0.1 + 0.8 * localProgress;
      }

      this.ctx.globalAlpha = Math.max(0, Math.min(1, scale * densityAlpha)) * this.fadeOpacity;

      if (this.scrollFactor < 0.005 || radius > 3.0) {
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillRect(screenX - radius, screenY - radius, radius * 2, radius * 2);
      }
    });

    this.ctx.globalAlpha = 1;
  }
}
