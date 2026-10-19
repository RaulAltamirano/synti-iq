<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
import { useMediaQuery, useResizeObserver } from '@vueuse/core';
import { MEDIA_BELOW_MD } from '@/modules/shared/constants/viewport-media';

export type BeamsIntensity = 'subtle' | 'medium' | 'strong';

const props = withDefaults(
  defineProps<{
    intensity?: BeamsIntensity;
  }>(),
  {
    intensity: 'strong',
  },
);

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

const MINIMUM_BEAMS = 20;
const BEAM_COUNT = Math.floor(MINIMUM_BEAMS * 1.5);

const opacityMap: Record<BeamsIntensity, number> = {
  subtle: 0.7,
  medium: 0.85,
  strong: 1,
};

const RENDER_SCALE = 0.5;

const canvasRef = ref<HTMLCanvasElement | null>(null);
const beamsRootRef = ref<HTMLElement | null>(null);
const beams = shallowRef<Beam[]>([]);
let ctx: CanvasRenderingContext2D | null = null;
let rafId = 0;
let isUnmounted = false;
let canvasWidth = 0;
let canvasHeight = 0;

const motionPreferenceQuery =
  typeof globalThis.matchMedia === 'function'
    ? globalThis.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

const prefersReducedMotion = ref(motionPreferenceQuery?.matches ?? false);

const isMobileViewport = useMediaQuery(MEDIA_BELOW_MD);

const runCanvasBeams = computed(
  () => !prefersReducedMotion.value && !isMobileViewport.value,
);

function readMotionPreference(): void {
  prefersReducedMotion.value = motionPreferenceQuery?.matches ?? false;
}

function stopCanvasLoop(): void {
  globalThis.cancelAnimationFrame(rafId);
  rafId = 0;
}

const intensityFactor = computed(() => opacityMap[props.intensity]);

function createBeam(width: number, height: number): Beam {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle,
    speed: 0.6 + Math.random() * 1.2,
    opacity: 0.12 + Math.random() * 0.16,
    hue: 190 + Math.random() * 70,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

function resetBeam(beam: Beam, index: number, totalBeams: number, cw: number, ch: number): void {
  const column = index % 3;
  const spacing = cw / 3;
  beam.y = ch + 100;
  beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
  beam.width = 100 + Math.random() * 100;
  beam.speed = 0.5 + Math.random() * 0.4;
  beam.hue = 190 + (index * 70) / totalBeams;
  beam.opacity = 0.2 + Math.random() * 0.1;
}

function drawBeam(context: CanvasRenderingContext2D, beam: Beam, factor: number): void {
  context.save();
  context.translate(beam.x, beam.y);
  context.rotate((beam.angle * Math.PI) / 180);

  const pulsingOpacity =
    beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2) * factor;

  const gradient = context.createLinearGradient(0, 0, 0, beam.length);
  gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
  gradient.addColorStop(0.1, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
  gradient.addColorStop(0.4, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
  gradient.addColorStop(0.6, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
  gradient.addColorStop(0.9, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
  gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);

  context.fillStyle = gradient;
  context.fillRect(-beam.width / 2, 0, beam.width, beam.length);
  context.restore();
}

function syncCanvasSize(): void {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const cw = canvas.clientWidth;
  const ch = canvas.clientHeight;
  if (cw === 0 || ch === 0) return;

  canvasWidth = cw;
  canvasHeight = ch;

  canvas.width = Math.round(cw * RENDER_SCALE);
  canvas.height = Math.round(ch * RENDER_SCALE);

  ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);

  beams.value = Array.from({ length: BEAM_COUNT }, () => createBeam(cw, ch));
}

function animate(): void {
  if (!ctx || !runCanvasBeams.value) return;

  const cw = canvasWidth;
  const ch = canvasHeight;
  const factor = intensityFactor.value;

  ctx.clearRect(0, 0, cw, ch);

  const list = beams.value;
  const n = list.length;
  for (let i = 0; i < n; i++) {
    const beam = list[i];
    if (!beam) continue;
    beam.y -= beam.speed;
    beam.pulse += beam.pulseSpeed;
    if (beam.y + beam.length < -100) {
      resetBeam(beam, i, n, cw, ch);
    }
    drawBeam(ctx, beam, factor);
  }

  rafId = globalThis.requestAnimationFrame(animate);
}

function startLoop(): void {
  stopCanvasLoop();
  if (!runCanvasBeams.value) return;
  rafId = globalThis.requestAnimationFrame(animate);
}

watch(
  runCanvasBeams,
  (enabled) => {
    if (enabled) {
      void nextTick(() => {
        if (isUnmounted) return;
        syncCanvasSize();
        startLoop();
      });
    } else {
      stopCanvasLoop();
    }
  },
  { flush: 'post', immediate: true },
);

onMounted(() => {
  motionPreferenceQuery?.addEventListener('change', readMotionPreference);
  readMotionPreference();
});

onUnmounted(() => {
  isUnmounted = true;
  motionPreferenceQuery?.removeEventListener('change', readMotionPreference);
  stopCanvasLoop();
  ctx = null;
  beams.value = [];
});

useResizeObserver(beamsRootRef, () => {
  if (!runCanvasBeams.value) return;
  syncCanvasSize();
  startLoop();
});

</script>

<template>
  <div
    class="fixed inset-0 -z-10 overflow-hidden"
    :class="{ 'animated-bg--lite': isMobileViewport }"
    aria-hidden="true"
  >
    <div
      class="abs-fill layer-fade transition-opacity duration-500 ease-in-out opacity-100 dark:opacity-0 dark:pointer-events-none"
    >
      <div
        class="abs-fill"
        style="
        background: linear-gradient(150deg,
          #ffffff       0%,
          #f5f8ff      30%,
          #eef4ff      60%,
          #f9fbff     100%
        );
      "
      />

      <div class="orb orb-light-1 animate-drift-a" />
      <div class="orb orb-light-2 animate-drift-b" />
      <div class="orb orb-light-3 animate-drift-c" />

      <div class="abs-fill noise-overlay" style="opacity: 0.028" />
    </div>

    <div
      class="abs-fill layer-fade transition-opacity duration-500 ease-in-out opacity-0 dark:opacity-100 pointer-events-none dark:pointer-events-auto"
    >
      <div
        class="abs-fill"
        style="
        background: linear-gradient(160deg,
          #08101f       0%,
          #030712      40%,
          #060e1c      75%,
          #030712     100%
        );
      "
      />

      <div v-if="runCanvasBeams" ref="beamsRootRef" class="abs-fill beams-stack">
        <canvas ref="canvasRef" class="abs-fill beams-canvas pointer-events-none" />
        <div class="abs-fill beams-veil pointer-events-none" />
      </div>

      <div
        class="abs-fill"
        style="
        background: radial-gradient(ellipse 70% 45% at 50% -5%,
          rgba(29, 78, 216, 0.13)  0%,
          rgba(30, 58, 138, 0.05) 55%,
          transparent             100%
        );
      "
      />

      <div class="orb orb-dark-1 animate-drift-a" />
      <div class="orb orb-dark-2 animate-drift-b" />

      <div class="abs-fill noise-overlay" style="opacity: 0.045" />
    </div>
  </div>
</template>

<style scoped>
.abs-fill {
  position: absolute;
  inset: 0;
}

.layer-fade {
  position: absolute;
  inset: 0;
}

.beams-stack {
  overflow: hidden;
}

.beams-canvas {
  filter: blur(38px);
}

.animated-bg--lite .noise-overlay {
  display: none;
}

.animated-bg--lite .animate-drift-a,
.animated-bg--lite .animate-drift-b,
.animated-bg--lite .animate-drift-c {
  animation: none;
}

.animated-bg--lite .orb-light-1 {
  filter: blur(40px);
  opacity: 0.55;
}

.animated-bg--lite .orb-light-2 {
  filter: blur(36px);
  opacity: 0.65;
}

.animated-bg--lite .orb-light-3 {
  filter: blur(32px);
  opacity: 0.28;
}

.animated-bg--lite .orb-dark-1 {
  filter: blur(48px);
  opacity: 0.12;
}

.animated-bg--lite .orb-dark-2 {
  filter: blur(40px);
  opacity: 0.08;
}

.beams-veil {
  background: rgba(10, 10, 10, 0.05);
  -webkit-backdrop-filter: blur(50px);
  backdrop-filter: blur(50px);
  animation: beams-veil-pulse 10s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .beams-veil {
    animation: none;
    opacity: 0.6;
  }
}

@keyframes beams-veil-pulse {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 1;
  }
}

.orb {
  position: absolute;
  border-radius: 50%;
  will-change: transform;
}

.orb-light-1 {
  width: 680px;
  height: 680px;
  top: -140px;
  right: -80px;
  background: radial-gradient(
    circle,
    var(--color-primary-100) 0%,
    transparent 70%
  );
  filter: blur(72px);
  opacity: 0.75;
}

.orb-light-2 {
  width: 500px;
  height: 500px;
  bottom: -120px;
  left: -60px;
  background: radial-gradient(
    circle,
    var(--color-primary-50) 0%,
    transparent 70%
  );
  filter: blur(64px);
  opacity: 0.9;
}

.orb-light-3 {
  width: 300px;
  height: 300px;
  top: 42%;
  left: 58%;
  background: radial-gradient(
    circle,
    var(--color-info-100) 0%,
    transparent 70%
  );
  filter: blur(56px);
  opacity: 0.35;
}

.orb-dark-1 {
  width: 750px;
  height: 750px;
  top: -220px;
  left: calc(25% - 120px);
  background: radial-gradient(
    circle,
    var(--color-primary-800) 0%,
    transparent 65%
  );
  filter: blur(110px);
  opacity: 0.16;
}

.orb-dark-2 {
  width: 540px;
  height: 540px;
  bottom: -160px;
  right: calc(15% - 80px);
  background: radial-gradient(
    circle,
    var(--color-primary-700) 0%,
    transparent 65%
  );
  filter: blur(90px);
  opacity: 0.1;
}

.noise-overlay {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px 256px;
  pointer-events: none;
}

.animate-drift-a {
  animation: drift-a 30s ease-in-out infinite;
}
.animate-drift-b {
  animation: drift-b 38s ease-in-out infinite;
}
.animate-drift-c {
  animation: drift-c 46s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animate-drift-a,
  .animate-drift-b,
  .animate-drift-c {
    animation: none;
  }
}

@keyframes drift-a {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  20% {
    transform: translate(24px, -18px) scale(1.03);
  }
  45% {
    transform: translate(-14px, 28px) scale(0.97);
  }
  70% {
    transform: translate(18px, 10px) scale(1.02);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

@keyframes drift-b {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  25% {
    transform: translate(-22px, 16px) scale(1.04);
  }
  55% {
    transform: translate(18px, -26px) scale(0.96);
  }
  80% {
    transform: translate(-8px, 18px) scale(1.01);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

@keyframes drift-c {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  35% {
    transform: translate(36px, 20px) scale(1.05);
  }
  65% {
    transform: translate(-18px, 32px) scale(0.94);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}
</style>
