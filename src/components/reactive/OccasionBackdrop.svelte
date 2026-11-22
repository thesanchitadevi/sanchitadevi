<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { activeThemeState } from "../../stores/theme.store";

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let animationFrameId: number | null = null;
  let snowParticles: any[] = [];
  let petalParticles: any[] = [];
  let width = 0;
  let height = 0;

  $: currentThemeId = $activeThemeState?.theme?.id || "";

  // Snowflake image field: varied sizes, speeds, positions and opacity
  const snowflakes = Array.from({ length: 22 }, (_, i) => {
    const size = [14, 20, 28, 38, 52, 70][i % 6];
    return {
      left: Math.round(((i * 37) % 100) + (i % 3) * 2),
      size,
      opacity: +(0.35 + (size / 70) * 0.35).toFixed(2),
      duration: 14 + ((i * 7) % 16),
      delay: (i * 5) % 24,
      drift: ((i % 2 === 0 ? 1 : -1) * (20 + ((i * 11) % 60))),
    };
  });

  // Dynamic wish text for top watermark
  const getWishText = (id: string): string => {
    switch (id) {
      case "christmas":
        return "MERRY CHRISTMAS";
      case "victory-day":
        return "VICTORY DAY";
      case "independence-day":
        return "INDEPENDENCE DAY";
      case "new-year":
        return "HAPPY NEW YEAR";
      case "falgun":
        return "SHUBHO BASANTA";
      case "boishakh":
        return "SHUBHO NOBODORSHO";
      case "eid":
        return "EID MUBARAK";
      case "language-day":
        return "AMAR EKUSHEY";
      case "halloween":
        return "HAPPY HALLOWEEN";
      case "durga-puja":
        return "SHUBHO SHARODIYA";
      case "holi":
        return "HAPPY HOLI";
      default:
        return "";
    }
  };

  $: wishText = getWishText(currentThemeId);

  // Initialize realistic slow snowflakes
  const initSnow = () => {
    snowParticles = [];
    if (!width || !height) return;
    const count = 55;
    for (let i = 0; i < count; i++) {
      snowParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.8,
        speedY: Math.random() * 0.45 + 0.25, // Very slow, graceful movement
        speedX: Math.random() * 0.2 - 0.1,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.01 + 0.005,
        opacity: Math.random() * 0.35 + 0.15, // Low opacity realistic snow
      });
    }
  };

  // Initialize realistic yellow petals for Pohela Falgun
  const initPetals = () => {
    petalParticles = [];
    if (!width || !height) return;
    const count = 24;
    for (let i = 0; i < count; i++) {
      petalParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 6 + 5,
        color: Math.random() > 0.4 ? "#facc15" : "#f59e0b",
        speedY: Math.random() * 0.5 + 0.3,
        speedX: Math.random() * 0.6 - 0.2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1.5,
        wobble: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.35 + 0.15, // Subtle low opacity
      });
    }
  };

  const drawLoop = () => {
    if (!ctx || !width || !height) return;
    ctx.clearRect(0, 0, width, height);

    // Realistic slow snow (Christmas uses snowflake images instead, white dots vanish on snow-white theme)
    if (currentThemeId === "new-year") {
      for (let i = 0; i < snowParticles.length; i++) {
        const p = snowParticles[i];
        p.wobble += p.wobbleSpeed;
        p.x += p.speedX + Math.sin(p.wobble) * 0.3;
        p.y += p.speedY;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();

        if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
      }
    }

    // Realistic yellow petals for Falgun
    else if (currentThemeId === "falgun") {
      for (let i = 0; i < petalParticles.length; i++) {
        const p = petalParticles[i];
        p.wobble += 0.012;
        p.x += p.speedX + Math.sin(p.wobble) * 0.6;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;

        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.5, -p.size * 0.3, p.size * 0.5, p.size * 0.3, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.5, p.size * 0.3, -p.size * 0.5, -p.size * 0.3, 0, -p.size);
        ctx.fill();
        ctx.restore();

        if (p.y > height + 15) {
          p.y = -15;
          p.x = Math.random() * width;
        }
      }
    }

    animationFrameId = requestAnimationFrame(drawLoop);
  };

  const handleResize = () => {
    if (!canvas) return;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initSnow();
    initPetals();
  };

  $: if (currentThemeId && canvas) {
    if (currentThemeId === "christmas" || currentThemeId === "new-year") {
      initSnow();
    } else if (currentThemeId === "falgun") {
      initPetals();
    }
  }

  onMount(() => {
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    handleResize();
    window.addEventListener("resize", handleResize);
    animationFrameId = requestAnimationFrame(drawLoop);
  });

  onDestroy(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
    }
  });
</script>

<!-- ======================================================== -->
<!-- TOP WISH: BOLD, LARGE, LOW OPACITY FONT WATERMARK ACROSS TOP -->
<!-- ======================================================== -->
{#if wishText}
  <div class="fixed top-0 inset-x-0 pointer-events-none select-none z-0 overflow-hidden flex justify-center py-2 sm:py-4">
    <span
      class="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-[0.25em] uppercase text-primary-foreground opacity-[0.06] whitespace-nowrap transition-opacity duration-500"
    >
      {wishText}
    </span>
  </div>
{/if}

<!-- Canvas for slow, realistic gentle falling snow and flower petals -->
<canvas
  bind:this={canvas}
  class="fixed inset-0 pointer-events-none z-0"
  aria-hidden="true"
></canvas>

<!-- ======================================================== -->
<!-- REALISTIC LOW-OPACITY BACKGROUND SCENERY (NON-CARTOON) -->
<!-- ======================================================== -->

<!-- 1. CHRISTMAS: Cute Festive Center Background PNG & Animated Flying Santa GIF -->
{#if currentThemeId === "christmas"}
  <!-- Flying Animated Santa Claus GIF across the upper sky -->
  <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
    <div class="santa-moving-flight flex items-center">
      <img
        src="/assets/christmas/santa-moving.gif"
        alt="Animated Santa Claus in Flying Sleigh"
        class="h-16 sm:h-24 md:h-28 w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] opacity-90 -scale-x-100"
      />
    </div>
  </div>

  <!-- Cute festive backdrop in the middle of the page -->
  <div class="fixed inset-0 pointer-events-none z-0 flex items-center justify-center select-none overflow-hidden p-6 sm:p-10">
    <img
      src="/assets/christmas/christmas-backdrop.png"
      alt="Festive Christmas Tree and Friends"
      class="max-w-[320px] sm:max-w-[460px] md:max-w-[560px] w-full max-h-[65vh] object-contain opacity-30 pointer-events-none"
    />
  </div>

  <!-- Falling ice snowflakes in different sizes -->
  <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
    {#each snowflakes as f}
      <img
        src="/assets/christmas/snowflake.png"
        alt=""
        class="snowflake-fall absolute top-0"
        style="left:{f.left}%; width:{f.size}px; opacity:{f.opacity}; animation-duration:{f.duration}s; animation-delay:-{f.delay}s; --drift:{f.drift}px;"
      />
    {/each}
  </div>

  <!-- Bottom-left corner: Snowman -->
  <img
    src="/assets/christmas/snowman.png"
    alt="Snowman"
    class="fixed bottom-0 left-1 sm:left-6 z-0 pointer-events-none select-none w-24 sm:w-40 md:w-52 opacity-90 drop-shadow-[0_6px_14px_rgba(30,60,100,0.25)]"
  />

  <!-- Bottom-right corner: Christmas tree with gifts -->
  <div class="fixed bottom-0 right-1 sm:right-6 z-0 pointer-events-none select-none flex items-end">
    <img
      src="/assets/christmas/gift.png"
      alt="Gift boxes"
      class="w-16 sm:w-28 md:w-36 -mr-3 sm:-mr-6 relative z-10 opacity-95 drop-shadow-[0_6px_14px_rgba(30,60,100,0.25)]"
    />
    <img
      src="/assets/christmas/tree.png"
      alt="Christmas tree"
      class="w-24 sm:w-40 md:w-56 opacity-95 drop-shadow-[0_6px_14px_rgba(30,60,100,0.25)]"
    />
  </div>
{/if}

<!-- 2. BANGLADESH VICTORY DAY (16 Dec) & INDEPENDENCE DAY (26 Mar) -->
<!-- Realistic Waving Bangladesh Flag Fabric in Background -->
{#if currentThemeId === "victory-day" || currentThemeId === "independence-day"}
  <div class="fixed top-12 right-0 sm:top-16 sm:right-8 pointer-events-none z-0 opacity-15 select-none">
    <div class="flex items-start">
      <!-- Flagpole with realistic metallic gradient -->
      <div class="flex flex-col items-center">
        <div class="w-3.5 h-3.5 rounded-full bg-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
        <div class="w-1.5 h-64 sm:h-96 bg-gradient-to-r from-slate-400 via-slate-100 to-slate-500 rounded-sm"></div>
      </div>

      <!-- Realistic Waving Flag Fabric -->
      <div class="bd-flag-fabric-wave relative w-48 h-30 sm:w-80 sm:h-50 rounded-r shadow-2xl overflow-hidden">
        <!-- Bottle Green Field -->
        <div class="absolute inset-0 bg-[#006a4e]"></div>
        <!-- Red Disc (official 45% horizontal alignment) -->
        <div class="absolute top-1/2 left-[44%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-[#f42a41] shadow-[0_0_20px_rgba(244,42,65,0.3)]"></div>
        <!-- Realistic 3D fabric ripple and lighting wave -->
        <div class="absolute inset-0 bd-cloth-ripple pointer-events-none"></div>
      </div>
    </div>
  </div>

  {#if currentThemeId === "independence-day"}
    <!-- Architectural Elevation of Jatiyo Smriti Soudho (National Memorial) -->
    <div class="fixed bottom-0 right-0 sm:right-24 pointer-events-none z-0 opacity-12 select-none">
      <svg class="w-56 h-44 sm:w-80 sm:h-60 fill-primary-foreground" viewBox="0 0 200 150">
        <!-- 7 pairs of triangular wall planes forming the pyramid monument -->
        <polygon points="100,8 75,148 125,148"/>
        <polygon points="100,8 60,148 75,148" opacity="0.85"/>
        <polygon points="100,8 125,148 140,148" opacity="0.85"/>
        <polygon points="100,32 46,148 60,148" opacity="0.7"/>
        <polygon points="100,32 140,148 154,148" opacity="0.7"/>
        <polygon points="100,56 32,148 46,148" opacity="0.55"/>
        <polygon points="100,56 154,148 168,148" opacity="0.55"/>
        <polygon points="100,80 18,148 32,148" opacity="0.4"/>
        <polygon points="100,80 168,148 182,148" opacity="0.4"/>
      </svg>
    </div>
  {/if}
{/if}

<!-- 3. POHELA FALGUN (13-14 Feb): Botanical Yellow Marigold Blossoms -->
{#if currentThemeId === "falgun"}
  <div class="fixed bottom-0 left-0 pointer-events-none z-0 opacity-15 select-none">
    <svg class="w-48 h-48 sm:w-72 sm:h-72" viewBox="0 0 200 200">
      <!-- Stems and realistic foliage -->
      <path d="M10,200 Q40,140 65,110 Q90,80 130,70" stroke="#15803d" stroke-width="4.5" fill="none"/>
      <path d="M35,150 Q60,140 80,155" stroke="#16a34a" stroke-width="3" fill="none"/>
      <!-- Realistic Marigold Flower Bloom (multi-tier layered petals) -->
      <g transform="translate(80, 105)">
        {#each [0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336] as rot}
          <ellipse cx="0" cy="-22" rx="9" ry="16" transform="rotate({rot} 0 0)" fill="#facc15" opacity="0.85"/>
          <ellipse cx="0" cy="-15" rx="7" ry="12" transform="rotate({rot + 12} 0 0)" fill="#f59e0b" opacity="0.9"/>
          <ellipse cx="0" cy="-8" rx="5" ry="9" transform="rotate({rot + 6} 0 0)" fill="#ea580c" opacity="0.95"/>
        {/each}
        <circle cx="0" cy="0" r="10" fill="#b45309"/>
      </g>
      <!-- Secondary Bloom -->
      <g transform="translate(145, 80)">
        {#each [0, 36, 72, 108, 144, 180, 216, 252, 288, 324] as rot}
          <ellipse cx="0" cy="-14" rx="7" ry="11" transform="rotate({rot} 0 0)" fill="#fde047" opacity="0.9"/>
          <ellipse cx="0" cy="-9" rx="5" ry="8" transform="rotate({rot + 18} 0 0)" fill="#f59e0b"/>
        {/each}
        <circle cx="0" cy="0" r="7" fill="#b45309"/>
      </g>
    </svg>
  </div>
{/if}

<!-- 4. POHELA BOISHAKH (14 Apr): Mangal Shobhajatra Traditional Folk Art Backdrop -->
{#if currentThemeId === "boishakh"}
  <div class="fixed bottom-2 right-2 sm:bottom-6 sm:right-10 pointer-events-none z-0 opacity-12 select-none flex items-end gap-4 sm:gap-8">
    <!-- Traditional Shobhajatra Folk Owl (প্যাঁচা) Mask Silhouette & Linework -->
    <svg class="w-20 h-28 sm:w-32 sm:h-44 fill-none stroke-primary-foreground" viewBox="0 0 90 120" stroke-width="2.5">
      <!-- Owl Outline -->
      <path d="M15,40 L24,12 L40,28 L50,28 L66,12 L75,40 Q80,75 70,105 Q45,120 20,105 Q10,75 15,40 Z"/>
      <!-- Eyes -->
      <circle cx="32" cy="50" r="15"/>
      <circle cx="32" cy="50" r="7" fill="currentColor"/>
      <circle cx="58" cy="50" r="15"/>
      <circle cx="58" cy="50" r="7" fill="currentColor"/>
      <!-- Beak -->
      <polygon points="45,62 39,76 51,76" fill="currentColor"/>
      <!-- Bengali Alpana Feather Textures -->
      <path d="M24,88 Q45,100 66,88 M28,98 Q45,108 62,98"/>
    </svg>

    <!-- Traditional Royal Bengal Tiger Mask Linework (বাঘের মুখোশ) -->
    <svg class="w-28 h-32 sm:w-44 sm:h-52 fill-none stroke-primary-foreground" viewBox="0 0 110 120" stroke-width="2.5">
      <!-- Ears -->
      <polygon points="15,35 28,8 42,28"/>
      <polygon points="68,28 82,8 95,35"/>
      <!-- Head Contour -->
      <path d="M18,38 Q55,18 92,38 Q104,80 88,106 Q55,118 22,106 Q6,80 18,38 Z"/>
      <!-- Authentic Tiger Stripes -->
      <path d="M55,24 L55,44 M46,30 L35,38 M64,30 L75,38 M20,56 L38,60 M90,56 L72,60 M20,76 L36,74 M90,76 L74,74" stroke-width="3" stroke-linecap="round"/>
      <!-- Eyes -->
      <ellipse cx="38" cy="54" rx="10" ry="7"/>
      <circle cx="38" cy="54" r="4" fill="currentColor"/>
      <ellipse cx="72" cy="54" rx="10" ry="7"/>
      <circle cx="72" cy="54" r="4" fill="currentColor"/>
      <!-- Nose & Mouth -->
      <polygon points="55,66 48,78 62,78" fill="currentColor"/>
      <path d="M42,82 Q55,94 68,82"/>
    </svg>
  </div>
{/if}

<!-- 5. EID: Realistic Mosque Architecture Silhouette & Glowing Crescent Moon -->
{#if currentThemeId === "eid"}
  <!-- Realistic Crescent Moon & Celestial Earthshine in Upper Sky -->
  <div class="fixed top-8 right-6 sm:top-14 sm:right-16 pointer-events-none z-0 opacity-20 select-none">
    <svg class="w-20 h-20 sm:w-32 sm:h-32 drop-shadow-[0_0_25px_rgba(251,191,36,0.6)]" viewBox="0 0 100 100">
      <!-- Soft moon aura -->
      <circle cx="50" cy="50" r="38" fill="#ffd166" opacity="0.1"/>
      <!-- Realistic Golden Crescent Moon -->
      <path d="M60,15 C38,18 24,38 28,60 C32,76 48,88 66,82 C52,82 38,70 40,50 C42,32 55,20 60,15 Z" fill="#fbbf24"/>
      <!-- Celestial 5-point Star -->
      <polygon points="70,32 72,39 79,39 74,43 76,50 70,45 64,50 66,43 61,39 68,39" fill="#fef08a"/>
    </svg>
  </div>

  <!-- Realistic Grand Mosque Architectural Skyline spanning lower horizon -->
  <div class="fixed bottom-0 inset-x-0 pointer-events-none z-0 opacity-12 select-none">
    <svg class="w-full h-36 sm:h-56 fill-primary-foreground" viewBox="0 0 1200 240" preserveAspectRatio="none">
      <!-- Domes, Minarets, Arches & Finials -->
      <path d="M0,240 L0,200 
        L90,200 L95,80 L102,68 L105,35 L108,68 L115,80 L120,200 
        L240,200 Q320,110 400,200 
        L480,200 L485,60 L492,48 L495,20 L498,48 L505,60 L510,200
        L540,200 Q620,90 700,200 
        L760,200 L765,70 L772,58 L775,25 L778,58 L785,70 L790,200 
        L860,200 Q940,110 1020,200 
        L1080,200 L1085,80 L1092,68 L1095,35 L1098,68 L1105,80 L1110,200 
        L1200,200 L1200,240 Z"/>
    </svg>
  </div>
{/if}

<!-- 6. INTERNATIONAL MOTHER LANGUAGE DAY (21 Feb): Shaheed Minar Architectural Elevation -->
{#if currentThemeId === "language-day"}
  <div class="fixed bottom-0 right-4 sm:right-16 pointer-events-none z-0 opacity-15 select-none">
    <svg class="w-52 h-48 sm:w-80 sm:h-72" viewBox="0 0 220 200">
      <!-- Red Memorial Disc behind center canopy -->
      <circle cx="110" cy="95" r="46" fill="#dc2626" opacity="0.8"/>
      <!-- Shaheed Minar Central Column Structure -->
      <rect x="98" y="40" width="24" height="145" fill="#f3f4f6" rx="2"/>
      <path d="M98,40 C98,22 122,22 122,40 Z" fill="#f3f4f6"/>
      <!-- Intermediate supporting pillars -->
      <rect x="70" y="75" width="18" height="110" fill="#e5e7eb" rx="2"/>
      <rect x="132" y="75" width="18" height="110" fill="#e5e7eb" rx="2"/>
      <!-- Outer supporting pillars -->
      <rect x="44" y="105" width="16" height="80" fill="#d1d5db" rx="2"/>
      <rect x="160" y="105" width="16" height="80" fill="#d1d5db" rx="2"/>
      <!-- Monument Platform Steps -->
      <rect x="18" y="185" width="184" height="15" fill="#9ca3af" rx="2"/>
    </svg>
  </div>
{/if}

<!-- 7. DURGA PUJA: Realistic Autumn Kashful Plumes -->
{#if currentThemeId === "durga-puja"}
  <div class="fixed bottom-0 right-4 sm:right-16 pointer-events-none z-0 opacity-14 select-none">
    <svg class="w-36 h-52 sm:w-56 sm:h-72" viewBox="0 0 140 200">
      <path d="M25,200 Q40,110 50,35" stroke="#65a30d" stroke-width="2.5" fill="none"/>
      <path d="M48,200 Q65,120 80,50" stroke="#65a30d" stroke-width="2.5" fill="none"/>
      <path d="M15,200 Q30,130 36,80" stroke="#65a30d" stroke-width="2" fill="none"/>
      <!-- Realistic Feathery Plumes of Kashful -->
      <ellipse cx="50" cy="50" rx="9" ry="28" transform="rotate(10 50 50)" fill="#ffffff" opacity="0.9"/>
      <ellipse cx="80" cy="65" rx="10" ry="32" transform="rotate(14 80 65)" fill="#ffffff" opacity="0.9"/>
      <ellipse cx="36" cy="90" rx="8" ry="22" transform="rotate(6 36 90)" fill="#ffffff" opacity="0.85"/>
    </svg>
  </div>
{/if}

<!-- 8. HALLOWEEN: Realistic Nocturnal Bats & Carved Jack-o'-Lantern Silhouette -->
{#if currentThemeId === "halloween"}
  <div class="fixed bottom-4 right-4 sm:bottom-8 sm:right-12 pointer-events-none z-0 opacity-14 select-none flex items-end gap-3">
    <svg class="w-22 h-22 sm:w-32 sm:h-32 fill-primary-foreground" viewBox="0 0 90 90">
      <!-- Pumpkin Silhouette -->
      <ellipse cx="45" cy="54" rx="38" ry="30" opacity="0.85"/>
      <ellipse cx="45" cy="54" rx="25" ry="30"/>
      <!-- Stem -->
      <path d="M42,26 C42,18 50,15 52,10 C50,16 47,22 46,26 Z"/>
      <!-- Carved Face (hollowed out with background color) -->
      <polygon points="30,44 38,50 30,52" fill="#0b0910"/>
      <polygon points="60,44 52,50 60,52" fill="#0b0910"/>
      <polygon points="45,52 41,58 49,58" fill="#0b0910"/>
      <path d="M28,62 Q45,76 62,62 Q55,70 51,66 Q45,72 39,66 Q35,70 28,62 Z" fill="#0b0910"/>
    </svg>
  </div>
{/if}

<style>
  .snowflake-fall {
    transform: translate3d(0, -120px, 0) rotate(0deg);
    animation-name: snowflakeFall;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    will-change: transform;
  }

  @keyframes snowflakeFall {
    0% {
      transform: translate3d(0, -120px, 0) rotate(0deg);
    }
    50% {
      transform: translate3d(var(--drift), 55vh, 0) rotate(180deg);
    }
    100% {
      transform: translate3d(0, 110vh, 0) rotate(360deg);
    }
  }

  /* Animated Santa Flying Across the Sky */
  .santa-moving-flight {
    position: absolute;
    top: 0;
    left: 0;
    animation: santaFlightPath 20s linear infinite;
    will-change: transform;
  }

  /* Diagonal flight: bottom-left to top-right, nose tilted upward */
  @keyframes santaFlightPath {
    0% {
      transform: translate(-30vw, 85vh) rotate(-20deg);
    }
    100% {
      transform: translate(105vw, -10vh) rotate(-20deg);
    }
  }

  /* Bangladesh Flag Waving 3D Effect */
  .bd-flag-fabric-wave {
    transform-origin: left center;
    animation: bdFlagWaveMotion 4s ease-in-out infinite alternate;
  }

  @keyframes bdFlagWaveMotion {
    0% {
      transform: skewY(0deg) scaleY(1);
    }
    50% {
      transform: skewY(2deg) scaleY(1.02);
    }
    100% {
      transform: skewY(-2deg) scaleY(0.98);
    }
  }

  /* Realistic cloth shimmer with lighting gradient */
  .bd-cloth-ripple {
    background: linear-gradient(
      105deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(0, 0, 0, 0.3) 25%,
      rgba(255, 255, 255, 0.25) 50%,
      rgba(0, 0, 0, 0.3) 75%,
      rgba(255, 255, 255, 0) 100%
    );
    background-size: 200% 100%;
    animation: bdClothLighting 4s ease-in-out infinite;
    mix-blend-mode: overlay;
  }

  @keyframes bdClothLighting {
    0% {
      background-position: -150% 0;
    }
    100% {
      background-position: 150% 0;
    }
  }
</style>
