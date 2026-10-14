import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
  inject,
} from '@angular/core';
import { EqCalc } from '../../../core/services/eq-calc';

/** Number of gaps between the 7 audiogram frequency bands. */
const FREQ_SEGMENTS = 6;

/** Upper bound of the audiogram scale in dB HL. */
const MAX_DB = 120;

/** Maximum terrain elevation in world units, reached at MAX_DB. */
const CURVE_AMPLITUDE = 300;

/** Normalized depth (0 = front, 1 = back) of the right ear ridge crest. */
const RIGHT_EAR_DEPTH = 0.2;

/** Normalized depth (0 = front, 1 = back) of the left ear ridge crest. */
const LEFT_EAR_DEPTH = 0.5;

/** Normalized distance from a ridge crest to where its terrain flattens out. */
const EAR_RIDGE_WIDTH = 0.2;

/** Particles with a larger radius in px are drawn as circles; smaller ones as squares, which look the same. */
const CIRCLE_MIN_RADIUS = 1.5;

/** Number of brightness steps particles are grouped into, so each step needs only one fill call. */
const ALPHA_STEPS = 32;

/** Eases a 0–1 value along an S-curve (smooth start and end). */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Eases the scroll progress of the cloud-to-grid transition: barely moves at first, then fast.
 *
 * @param t - Scroll progress from 0 to 1.
 * @returns The eased progress from 0 to 1.
 */
function easeTransition(t: number): number {
  return t ** 4;
}

/**
 * Represents an individual 3D particle operating within an interpolated coordinate system,
 * transitioning smoothly from a randomized chaos cloud to an undulating grid structure.
 */
class Particle3D {
  /** Target horizontal position within the ordered grid. */
  gridX: number;

  /** Target depth position within the ordered grid. */
  gridZ: number;

  /** Index of the left neighbouring frequency band (0–5). */
  freqIndex: number;

  /** Fraction of the way to right neighbouring frequency band (0-1). */
  freqFrac: number;

  /** Influence of the right ear curve at this depth (0–1). */
  rightEarWeight: number;

  /** Influence of the left ear curve at this depth (0–1). */
  leftEarWeight: number;

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
  constructor(gridX: number, gridZ: number, chaosSpread: number, normX: number, normZ: number) {
    this.gridX = gridX;
    this.gridZ = gridZ;

    const freqPos = normX * FREQ_SEGMENTS;
    this.freqIndex = Math.min(Math.floor(freqPos), FREQ_SEGMENTS - 1);
    this.freqFrac = smoothstep(freqPos - this.freqIndex);

    this.rightEarWeight = smoothstep(
      Math.max(0, 1 - Math.abs(normZ - RIGHT_EAR_DEPTH) / EAR_RIDGE_WIDTH),
    );
    this.leftEarWeight = smoothstep(
      Math.max(0, 1 - Math.abs(normZ - LEFT_EAR_DEPTH) / EAR_RIDGE_WIDTH),
    );

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
  update(scrollFactor: number, time: number, rightDb: number[], leftDb: number[]): void {
    const rightLeftPost = rightDb[this.freqIndex];
    const rightRightPost = rightDb[this.freqIndex + 1];
    const rightHere = rightLeftPost + (rightRightPost - rightLeftPost) * this.freqFrac;

    const leftLeftPost = leftDb[this.freqIndex];
    const leftRightPost = leftDb[this.freqIndex + 1];
    const leftHere = leftLeftPost + (leftRightPost - leftLeftPost) * this.freqFrac;

    const curveDb = rightHere * this.rightEarWeight + leftHere * this.leftEarWeight;
    const curveY = -(curveDb / MAX_DB) * CURVE_AMPLITUDE;

    const wave1 = Math.sin(this.gridX * 0.005 + time * 0.2) * 6;
    const wave2 = Math.cos(this.gridZ * 0.005 + time * 0.5) * 2;
    const wave3 = Math.sin((this.gridX - this.gridZ) * 0.015 + time * 1.4) * 8;
    const waveY = wave1 + wave2 + wave3 + curveY;

    const ease = easeTransition(scrollFactor);

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
  private eqService = inject(EqCalc);
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

  /** Whether the user prefers reduced motion; the ambient movement then stands still. */
  private reducedMotion = false;

  /** Whether the canvas has been cleared after fading out, so idle frames can skip all work. */
  private cleared = false;

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
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
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

    const fadeStart = 1350;
    const fadeEnd = 1500;

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
      const normZ = z / (currentRows - 1);
      for (let x = 0; x < currentCols; x++) {
        const gridX = (x - currentCols / 2) * currentSpacing;
        const normX = x / (currentCols - 1);
        const gridZ = z * currentSpacing;
        this.particles.push(new Particle3D(gridX, gridZ, chaosSpread, normX, normZ));
      }
    }
  }

  /**
   * Recursive animation routine driving coordinate mutation and rendering.
   * While fully faded out, the canvas is cleared once and all further work is skipped.
   */
  private startLoop = (): void => {
    if (this.fadeOpacity > 0) {
      if (!this.reducedMotion) this.time += 0.004;
      this.update();
      this.draw();
      this.cleared = false;
    } else if (!this.cleared) {
      this.draw();
      this.cleared = true;
    }
    this.animationFrameId = requestAnimationFrame(this.startLoop);
  };

  /**
   * Steps the state of each particle forward.
   */
  private update(): void {
    this.particles.forEach((p) =>
      p.update(this.scrollFactor, this.time, this.eqService.rightEarDb, this.eqService.leftEarDb),
    );
  }

  /**
   * Projects 3D spatial points onto the 2D surface using perspective division
   * and executes draw operations based on distance and visual density thresholds.
   *
   * Particles are grouped into {@link ALPHA_STEPS} brightness steps with one path and one fill
   * per step. No depth sorting is needed: all particles share one colour and only differ in
   * opacity, so the blended result does not depend on the draw order.
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

    const progress = easeTransition(this.scrollFactor);
    const densityAlpha =
      progress < 0.5 ? 0.3 - 0.2 * (progress * 2) : 0.1 + 0.8 * ((progress - 0.5) * 2);

    const steps = Array.from({ length: ALPHA_STEPS }, () => new Path2D());
    const used = new Array<boolean>(ALPHA_STEPS).fill(false);

    for (const p of this.particles) {
      const zPos = p.z + cameraZ;
      if (zPos <= 0) continue;

      const scale = focalLength / zPos;
      const alpha = Math.min(1, scale * densityAlpha);
      if (alpha <= 0) continue;

      const screenX = centerX + p.x * scale;
      const screenY = centerY + p.y * scale - p.z * 0.3;
      const radius = Math.max(0.1, 1.2 * scale);

      const step = Math.min(ALPHA_STEPS - 1, Math.floor(alpha * ALPHA_STEPS));
      const path = steps[step];
      used[step] = true;

      if (radius > CIRCLE_MIN_RADIUS) {
        path.moveTo(screenX + radius, screenY);
        path.arc(screenX, screenY, radius, 0, Math.PI * 2);
      } else {
        path.rect(screenX - radius, screenY - radius, radius * 2, radius * 2);
      }
    }

    steps.forEach((path, step) => {
      if (!used[step]) return;
      this.ctx.globalAlpha = ((step + 0.5) / ALPHA_STEPS) * this.fadeOpacity;
      this.ctx.fill(path);
    });

    this.ctx.globalAlpha = 1;
  }
}
