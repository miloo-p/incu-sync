import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  effect,
  input,
} from '@angular/core';

/** Minimum number of rings per impulse. */
const BURST_SIZE_MIN = 2;

/** Maximum number of rings per impulse. */
const BURST_SIZE_MAX = 4;

/** Minimum distance between two rings inside one impulse, in px along the horizontal axis. */
const BURST_GAP_MIN = 14;

/** Maximum distance between two rings inside one impulse, in px along the horizontal axis. */
const BURST_GAP_MAX = 28;

/** Minimum pause between two impulses, in px along the horizontal axis. */
const PAUSE_GAP_MIN = 110;

/** Maximum pause between two impulses, in px along the horizontal axis. */
const PAUSE_GAP_MAX = 200;

/** Strength of the first ring of an impulse. */
const EMISSION_STRENGTH = 1.6;

/** Random deviation of a ring's strength, relative to its nominal strength. */
const EMISSION_STRENGTH_JITTER = 0.15;

/** Strength factor applied per following ring inside an impulse, so an impulse fades like an echo. */
const ECHO_DECAY = 0.65;

/** Outward travel speed of the rings in px per second. */
const RING_SPEED = 10;

/** Number of sample points per ring, enough to bend smoothly around the cursor. */
const RING_SEGMENTS = 240;

/** Base opacity of the ring strokes; each ring varies around it via its strength. */
const RING_ALPHA = 0.14;

/** Number of random brightness points along a ring's circumference. */
const FADE_STOPS = 5;

/** Lowest brightness of a point along a ring. */
const FADE_ALPHA_MIN = 0.1;

/** Random shift of a brightness point along the ring, relative to the spacing between points. */
const FADE_STOP_JITTER = 0.4;

/** Relative strength of the jitter applied to distortions. */
const JITTER_AMOUNT = 0.6;

/** Number of jitter waves around a ring. */
const JITTER_FREQUENCY = 40;

/** Speed of the jitter in radians per second. */
const JITTER_SPEED = 9;

/** Phase shift of the jitter per px of ring radius, so neighbouring rings jitter differently. */
const JITTER_RING_PHASE = 0.1;

/** Radius around the cursor in which rings get distorted, in px. */
const DISTURB_RADIUS = 280;

/** Maximum ring displacement right at the cursor, in px. */
const DISTURB_STRENGTH = 26;

/** Radius of the soft glow around the cursor, in px. */
const GLOW_RADIUS = 340;

/** Additional ring opacity right at the cursor, fading to 0 at {@link GLOW_RADIUS}. */
const GLOW_ALPHA = 0.25;

/** Part of the glow radius the glow colors spread over; the rest fades out. */
const GLOW_COLOR_SPREAD = 0.8;

/** Per-frame easing of the glow strength towards on/off. */
const GLOW_EASE = 0.05;

/** Per-frame easing of the effect position towards the cursor. */
const POINTER_EASE = 0.1;

/** Opacity of the button-colored ring overlay at full CTA highlight, relative to the base ring. */
const CTA_BOOST = 2;

/** Per-frame easing of the CTA highlight towards on/off. */
const CTA_EASE = 0.06;

/** Number of rings per CTA pulse. */
const PULSE_RINGS = 3;

/** Delay between two rings of a CTA pulse, in seconds. */
const PULSE_STAGGER = 0.07;

/** Duration of one pulse ring from the text edge to the canvas edge, in seconds. */
const PULSE_DURATION = 0.9;

/**
 * Start radius of a pulse ring relative to half the canvas width.
 * Just below where the mask in `hero-waves.scss` starts to reveal rings (45 %).
 */
const PULSE_START = 0.42;

/** Opacity of a pulse ring at its start; it fades to 0 at the end. */
const PULSE_ALPHA = 0.35;

/** Line width of a pulse ring in px. */
const PULSE_LINE_WIDTH = 1.5;

/** Range around a pulse front in which existing rings get kicked, in px along the horizontal axis. */
const PULSE_DISTURB_WIDTH = 60;

/** Maximum kick of an existing ring right at a pulse front, in px. */
const PULSE_DISTURB_STRENGTH = 14;

/** Time constant in seconds in which a kicked ring settles again. */
const PULSE_DISTURB_DECAY = 0.7;

/** Wobble speed of a kicked ring while it settles, in radians per second. */
const PULSE_WOBBLE_SPEED = 14;

/** Phase shift of the wobble per px of ring radius, so neighbouring rings wobble differently. */
const PULSE_WOBBLE_RING_PHASE = 0.05;

/** Kick below which a ring is treated as settled, in px. */
const PULSE_KICK_MIN = 0.05;

/** Value below which an eased effect is treated as off. */
const EFFECT_EPSILON = 0.001;

/** CSS custom properties holding the button colors, in gradient order. */
const BUTTON_COLOR_VARS = ['--clr-ear-left', '--primary-700', '--clr-ear-right'];

/** Angle of the `.btn-primary` background gradient in degrees (see `hero.scss`). */
const BUTTON_GRADIENT_ANGLE = 144;

/** A single wave ring traveling outward from the text centre. */
interface Ring {
  /** Horizontal radius in px; the vertical radius follows the canvas aspect ratio. */
  r: number;
  /** Opacity factor so rings differ in presence. */
  strength: number;
  /** Random brightness course along the ring. */
  fade: CanvasGradient;
  /** Start angle of {@link Ring.fade} in radians, kept to rebuild the gradient on resize. */
  fadeAngle: number;
  /** Color stops of {@link Ring.fade}, kept to rebuild the gradient on resize. */
  fadeStops: [offset: number, color: string][];
  /** Current wobble amplitude in px from a passing CTA pulse; decays over time. */
  kick: number;
}

/** Spacing and strength of a ring that is about to be emitted. */
interface Emission {
  /** Distance in px the ring travels before the next ring is emitted. */
  gap: number;
  /** Opacity factor of the emitted ring. */
  strength: number;
}

/** Position and fade of a running CTA pulse ring. */
interface PulseFront {
  /** Horizontal radius in px. */
  r: number;
  /** Remaining visibility from 1 (start) to 0 (end). */
  fade: number;
}

/**
 * Returns a random number within a range.
 *
 * @param min - Lower bound (inclusive).
 * @param max - Upper bound (exclusive).
 * @returns A random number between `min` and `max`.
 */
const randomBetween = (min: number, max: number): number => min + Math.random() * (max - min);

/**
 * Returns a random integer within a range.
 *
 * @param min - Lower bound (inclusive).
 * @param max - Upper bound (inclusive).
 * @returns A random integer between `min` and `max`.
 */
const randomInt = (min: number, max: number): number => Math.floor(randomBetween(min, max + 1));

/**
 * Converts an opacity to a two-digit hex alpha suffix for `#rrggbb` colors.
 *
 * @param alpha - Opacity between 0 and 1.
 * @returns The alpha as a two-digit hex string.
 */
const toHexAlpha = (alpha: number): string =>
  Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');

/**
 * Animated sound-wave background behind the hero text.
 *
 * Elliptic rings travel outward in short impulses. The cursor distorts and lights up nearby
 * rings; while the CTA is active all rings are tinted in the button colors, and activating it
 * sends a pulse that briefly kicks the existing rings. The animation pauses while off-screen.
 */
@Component({
  selector: 'app-hero-waves',
  templateUrl: './hero-waves.html',
  styleUrl: './hero-waves.scss',
})
export class HeroWaves implements AfterViewInit, OnDestroy {
  /** Whether the hero CTA is hovered or focused. */
  readonly ctaActive = input(false);

  /** Canvas the sound-wave rings are drawn on. */
  @ViewChild('waveCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  /** 2D rendering context of the wave canvas. */
  private ctx!: CanvasRenderingContext2D;

  /** Id of the pending animation frame, or 0 while the loop is paused. */
  private frameId = 0;

  /** Pauses the animation while the canvas is off-screen. */
  private visibilityObserver?: IntersectionObserver;

  /** Canvas width at the last resize, used to scale the rings along with it. */
  private lastWidth = 0;

  /** Timestamp of the previous animation frame in ms, or 0 after a (re)start. */
  private lastTime = 0;

  /** Rings ordered from inside to outside. */
  private rings: Ring[] = [];

  /** Distance the innermost ring must travel before the next ring is emitted. */
  private nextGap = 0;

  /** Position of the next ring inside the current impulse. */
  private burstIndex = 0;

  /** Number of rings in the current impulse. */
  private burstSize = randomInt(BURST_SIZE_MIN, BURST_SIZE_MAX);

  /** Whether the user prefers reduced motion; rings and pulses then stand still. */
  private reducedMotion = false;

  /** Neutral ring color as `#rrggbb`. */
  private strokeColor = '';

  /** Button colors as `#rrggbb`, in gradient order; also used for the cursor glow. */
  private buttonColors: string[] = [];

  /** Gradient across the canvas matching the `.btn-primary` background. */
  private ctaStyle: CanvasGradient | null = null;

  /** Cursor position in canvas px, or `null` while the pointer is outside the canvas. */
  private pointerTarget: { x: number; y: number } | null = null;

  /** Smoothed cursor position the distortion and glow are centred on. */
  private pointer = { x: 0, y: 0 };

  /** Strength of the cursor effects from 0 to 1, eased in and out. */
  private glow = 0;

  /** Eased CTA highlight from 0 to 1. */
  private ctaHighlight = 0;

  /** CTA state of the previous change, to detect activation. */
  private wasCtaActive = false;

  /** Elapsed time in seconds of each running CTA pulse ring; negative values have not started yet. */
  private pulses: number[] = [];

  /** Current CTA pulse fronts, recomputed every frame. */
  private pulseFronts: PulseFront[] = [];

  /** Sends a pulse whenever the CTA becomes active. */
  constructor() {
    effect(() => {
      const active = this.ctaActive();
      if (active && !this.wasCtaActive) this.startPulse();
      this.wasCtaActive = active;
    });
  }

  /** Reads the colors from the CSS custom properties, sizes the canvas and starts the animation. */
  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const styles = getComputedStyle(canvas);
    this.strokeColor = styles.getPropertyValue('--tinted-gray-100').trim();
    this.buttonColors = BUTTON_COLOR_VARS.map((name) => styles.getPropertyValue(name).trim());

    this.resizeCanvas();

    if ('IntersectionObserver' in window) {
      this.visibilityObserver = new IntersectionObserver(([entry]) =>
        entry.isIntersecting ? this.start() : this.stop(),
      );
      this.visibilityObserver.observe(canvas);
    } else {
      this.start();
    }
  }

  /** Stops the animation and the visibility observer. */
  ngOnDestroy(): void {
    this.stop();
    this.visibilityObserver?.disconnect();
  }

  /**
   * Matches the drawing buffer to the canvas' CSS size (sharp on HiDPI screens).
   * Existing rings are kept and scaled instead of being regenerated, so resizing does not flicker.
   */
  @HostListener('window:resize')
  resizeCanvas(): void {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const width = canvas.clientWidth;
    if (!width) return;

    if (this.rings.length && this.lastWidth) {
      const scale = width / this.lastWidth;
      for (const ring of this.rings) {
        ring.r *= scale;
        ring.fade = this.buildFade(ring.fadeAngle, ring.fadeStops);
      }
    } else {
      this.fillRings();
    }
    this.lastWidth = width;
    this.ctaStyle = this.createButtonGradient();
  }

  /**
   * Tracks the cursor on the whole window, because the rings reach beyond the hero section.
   *
   * @param event - The pointer move event.
   */
  @HostListener('window:pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
    this.pointerTarget = inside ? { x, y } : null;
  }

  /**
   * Turns the cursor effects off when the pointer leaves the browser window.
   *
   * @param event - The pointer out event; its `relatedTarget` is `null` when the window is left.
   */
  @HostListener('window:pointerout', ['$event'])
  onPointerLeave(event: PointerEvent): void {
    if (!event.relatedTarget) this.pointerTarget = null;
  }

  /** Starts the animation loop unless it is already running. */
  private start(): void {
    if (this.frameId) return;
    this.lastTime = 0;
    this.frameId = requestAnimationFrame(this.loop);
  }

  /** Pauses the animation loop. */
  private stop(): void {
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }

  /** Queues a staggered CTA pulse. */
  private startPulse(): void {
    if (this.reducedMotion) return;
    for (let i = 0; i < PULSE_RINGS; i++) this.pulses.push(-i * PULSE_STAGGER);
  }

  /**
   * Creates a linear gradient across the canvas matching the `.btn-primary` background.
   * A CSS gradient angle points up at 0deg and turns clockwise; the gradient line covers the corners.
   *
   * @returns The gradient in the button colors.
   */
  private createButtonGradient(): CanvasGradient {
    const canvas = this.canvasRef.nativeElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const angle = (BUTTON_GRADIENT_ANGLE * Math.PI) / 180;
    const dx = Math.sin(angle);
    const dy = -Math.cos(angle);
    const half = Math.abs((w / 2) * dx) + Math.abs((h / 2) * dy);
    const gradient = this.ctx.createLinearGradient(
      w / 2 - dx * half,
      h / 2 - dy * half,
      w / 2 + dx * half,
      h / 2 + dy * half,
    );
    const [start, middle, end] = this.buttonColors;
    gradient.addColorStop(0, start);
    gradient.addColorStop(0.5, middle);
    gradient.addColorStop(1, end);
    return gradient;
  }

  /** Pre-fills the canvas with rings in the same rhythm as the running state, so it does not start empty. */
  private fillRings(): void {
    const maxR = this.canvasRef.nativeElement.clientWidth / 2 + PAUSE_GAP_MAX;
    const emissions: Emission[] = [];
    for (let total = 0; total < maxR; ) {
      const emission = this.nextEmission();
      emissions.push(emission);
      total += emission.gap;
    }

    this.rings = [];
    let r = 0;
    for (const { gap, strength } of emissions.reverse()) {
      r += gap;
      this.rings.push(this.createRing(r, strength));
    }
    this.nextGap = emissions[0].gap;
  }

  /**
   * Determines spacing and strength of the next ring. Rings come in impulses of a few close
   * rings, each weaker than the one before, followed by a longer pause.
   *
   * @returns The emission for the next ring.
   */
  private nextEmission(): Emission {
    const strength =
      EMISSION_STRENGTH *
      ECHO_DECAY ** this.burstIndex *
      randomBetween(1 - EMISSION_STRENGTH_JITTER, 1 + EMISSION_STRENGTH_JITTER);
    this.burstIndex++;
    if (this.burstIndex < this.burstSize) {
      return { gap: randomBetween(BURST_GAP_MIN, BURST_GAP_MAX), strength };
    }
    this.burstIndex = 0;
    this.burstSize = randomInt(BURST_SIZE_MIN, BURST_SIZE_MAX);
    return { gap: randomBetween(PAUSE_GAP_MIN, PAUSE_GAP_MAX), strength };
  }

  /**
   * Creates a ring with a random brightness course around its circumference.
   * First and last color stop share one value so the course closes without a seam.
   *
   * @param r - Horizontal start radius in px.
   * @param strength - Opacity factor of the ring.
   * @returns The new ring.
   */
  private createRing(r: number, strength: number): Ring {
    const randomColor = () => `${this.strokeColor}${toHexAlpha(randomBetween(FADE_ALPHA_MIN, 1))}`;
    const edge = randomColor();
    const fadeStops: [number, string][] = [[0, edge]];
    for (let i = 1; i < FADE_STOPS; i++) {
      const offset = (i + randomBetween(-FADE_STOP_JITTER, FADE_STOP_JITTER)) / FADE_STOPS;
      fadeStops.push([offset, randomColor()]);
    }
    fadeStops.push([1, edge]);

    const fadeAngle = randomBetween(0, Math.PI * 2);
    return {
      r,
      strength,
      fade: this.buildFade(fadeAngle, fadeStops),
      fadeAngle,
      fadeStops,
      kick: 0,
    };
  }

  /**
   * Builds a conic gradient around the canvas centre.
   *
   * @param angle - Start angle in radians.
   * @param stops - Color stops as `[offset, color]` pairs.
   * @returns The conic gradient.
   */
  private buildFade(angle: number, stops: [number, string][]): CanvasGradient {
    const canvas = this.canvasRef.nativeElement;
    const fade = this.ctx.createConicGradient(
      angle,
      canvas.clientWidth / 2,
      canvas.clientHeight / 2,
    );
    for (const [offset, color] of stops) fade.addColorStop(offset, color);
    return fade;
  }

  /**
   * Moves the rings outward, emits new ones in the impulse rhythm and drops those past the edge.
   *
   * @param dt - Time since the previous frame in seconds.
   */
  private updateRings(dt: number): void {
    const maxR = this.canvasRef.nativeElement.clientWidth / 2 + PAUSE_GAP_MAX;
    for (const ring of this.rings) ring.r += RING_SPEED * dt;

    const innermost = this.rings[0]?.r ?? Infinity;
    if (innermost >= this.nextGap) {
      const { gap, strength } = this.nextEmission();
      this.rings.unshift(this.createRing(0, strength));
      this.nextGap = gap;
    }

    while (this.rings.length && this.rings[this.rings.length - 1].r > maxR) this.rings.pop();
  }

  /**
   * Animation frame callback: advances the simulation and draws the frame.
   *
   * @param now - Current timestamp in ms, provided by `requestAnimationFrame`.
   */
  private loop = (now: number): void => {
    const dt = this.lastTime ? (now - this.lastTime) / 1000 : 0;
    this.lastTime = now;

    if (!this.reducedMotion) this.updateRings(dt);

    this.pulses = this.pulses.map((t) => t + dt).filter((t) => t < PULSE_DURATION);
    this.updatePulseFronts();
    this.updateKicks(dt);

    if (this.pointerTarget) {
      const ease = this.glow < 0.01 ? 1 : POINTER_EASE;
      this.pointer.x += (this.pointerTarget.x - this.pointer.x) * ease;
      this.pointer.y += (this.pointerTarget.y - this.pointer.y) * ease;
    }
    this.glow += ((this.pointerTarget ? 1 : 0) - this.glow) * GLOW_EASE;
    this.ctaHighlight += ((this.ctaActive() ? 1 : 0) - this.ctaHighlight) * CTA_EASE;

    this.draw(now / 1000);
    this.frameId = requestAnimationFrame(this.loop);
  };

  /** Computes position and fade of the running CTA pulse rings with an ease-out cubic. */
  private updatePulseFronts(): void {
    const halfWidth = this.canvasRef.nativeElement.clientWidth / 2;
    this.pulseFronts = this.pulses
      .filter((t) => t > 0)
      .map((t) => {
        const progress = t / PULSE_DURATION;
        const eased = 1 - (1 - progress) ** 3;
        return {
          r: halfWidth * (PULSE_START + (1 - PULSE_START) * eased),
          fade: (1 - progress) ** 2,
        };
      });
  }

  /**
   * Lets the pulse fronts kick the rings they pass; afterwards each kick decays.
   *
   * @param dt - Time since the previous frame in seconds.
   */
  private updateKicks(dt: number): void {
    const decay = Math.exp(-dt / PULSE_DISTURB_DECAY);
    for (const ring of this.rings) {
      ring.kick *= decay;
      for (const front of this.pulseFronts) {
        const distance = Math.abs(ring.r - front.r);
        if (distance < PULSE_DISTURB_WIDTH) {
          const strike =
            PULSE_DISTURB_STRENGTH * (1 - distance / PULSE_DISTURB_WIDTH) ** 3 * front.fade;
          ring.kick = Math.max(ring.kick, strike);
        }
      }
    }
  }

  /**
   * Draws all rings and CTA pulse rings, including CTA tint and cursor glow.
   *
   * @param time - Current time in seconds, drives the jitter and wobble.
   */
  private draw(time: number): void {
    const canvas = this.canvasRef.nativeElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const cx = w / 2;
    const cy = h / 2;
    const aspect = w / h;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;

    const glowStyle = this.createGlowStyle();

    for (const { r, strength, fade, kick } of this.rings) {
      const path = this.ringPath(r, kick, cx, cy, aspect, time);

      ctx.globalAlpha = RING_ALPHA * strength;
      ctx.strokeStyle = fade;
      ctx.stroke(path);

      if (this.ctaStyle && this.ctaHighlight > EFFECT_EPSILON) {
        ctx.globalAlpha = RING_ALPHA * strength * CTA_BOOST * this.ctaHighlight;
        ctx.strokeStyle = this.ctaStyle;
        ctx.stroke(path);
      }

      if (glowStyle) {
        ctx.globalAlpha = GLOW_ALPHA * strength * this.glow;
        ctx.strokeStyle = glowStyle;
        ctx.stroke(path);
      }
    }

    if (this.ctaStyle) {
      for (const { r, fade: fadeOut } of this.pulseFronts) {
        const path = this.ringPath(r, 0, cx, cy, aspect, time);

        ctx.lineWidth = PULSE_LINE_WIDTH;
        ctx.globalAlpha = PULSE_ALPHA * fadeOut;
        ctx.strokeStyle = this.ctaStyle;
        ctx.stroke(path);

        if (glowStyle) {
          ctx.lineWidth = 1;
          ctx.globalAlpha = GLOW_ALPHA * this.glow * fadeOut;
          ctx.strokeStyle = glowStyle;
          ctx.stroke(path);
        }
      }
    }
  }

  /**
   * Creates the radial glow gradient around the cursor in the button colors. The colors spread
   * over {@link GLOW_COLOR_SPREAD} of the radius; the last color fades out to transparent at the edge.
   *
   * @returns The glow gradient, or `null` while the cursor effects are off.
   */
  private createGlowStyle(): CanvasGradient | null {
    if (this.glow <= EFFECT_EPSILON) return null;

    const { x, y } = this.pointer;
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, GLOW_RADIUS);
    const colors = this.buttonColors;
    colors.forEach((color, i) =>
      gradient.addColorStop((i / (colors.length - 1)) * GLOW_COLOR_SPREAD, color),
    );
    gradient.addColorStop(1, `${colors[colors.length - 1]}00`);
    return gradient;
  }

  /**
   * Builds the path of one elliptic ring. Points near the cursor are pushed away with a jitter;
   * a pulse kick lets the whole ring wobble in and out with the same jitter.
   *
   * @param r - Horizontal radius in px.
   * @param kick - Current wobble amplitude in px from a CTA pulse.
   * @param cx - Horizontal centre of the canvas in px.
   * @param cy - Vertical centre of the canvas in px.
   * @param aspect - Canvas width divided by height, defines the ellipse shape.
   * @param time - Current time in seconds, drives the jitter and wobble.
   * @returns The ring path.
   */
  private ringPath(
    r: number,
    kick: number,
    cx: number,
    cy: number,
    aspect: number,
    time: number,
  ): Path2D {
    const wobble =
      kick > PULSE_KICK_MIN
        ? kick * Math.sin(time * PULSE_WOBBLE_SPEED + r * PULSE_WOBBLE_RING_PHASE)
        : 0;

    const path = new Path2D();
    for (let i = 0; i <= RING_SEGMENTS; i++) {
      const angle = (i / RING_SEGMENTS) * Math.PI * 2;
      const jitter =
        1 +
        JITTER_AMOUNT *
          Math.sin(angle * JITTER_FREQUENCY + time * JITTER_SPEED + r * JITTER_RING_PHASE);
      const radius = r + wobble * jitter;
      let x = cx + Math.cos(angle) * radius;
      let y = cy + Math.sin(angle) * (radius / aspect);

      if (this.glow > EFFECT_EPSILON) {
        const dx = x - this.pointer.x;
        const dy = y - this.pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < DISTURB_RADIUS) {
          const falloff = (1 - dist / DISTURB_RADIUS) ** 2;
          const push = DISTURB_STRENGTH * falloff * this.glow * jitter;
          x += (dx / dist) * push;
          y += (dy / dist) * push;
        }
      }

      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
    return path;
  }
}
