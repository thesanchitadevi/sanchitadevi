<script lang="ts">
  const themes = [
    { id: "prussian", name: "Prussian Twilight", bg: "#0d1b2a", accent: "#778da9" },
    { id: "violet", name: "Nebula Violet", bg: "#0c0a10", accent: "#9959ff" },
    { id: "emerald", name: "Emerald Cyber", bg: "#090e0b", accent: "#41f38d" },
    { id: "nord", name: "Nordic Aurora", bg: "#0e1317", accent: "#29e3f4" },
    { id: "amber", name: "Retro Amber", bg: "#100d0a", accent: "#fcab23" }
  ];

  let currentTheme = $state("prussian");

  // Load from localStorage on mount
  $effect(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved && themes.some(t => t.id === saved)) {
        currentTheme = saved;
      }
    }
  });

  const selectTheme = (themeId: string) => {
    currentTheme = themeId;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("theme", themeId);
    }
    
    // Apply to html element
    if (themeId === "prussian") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", themeId);
    }
  };
</script>

<div class="flex items-center gap-2 px-3 py-1.5 bg-secondary/30 border border-edge rounded-interactive select-none">
  <span class="text-xs uppercase font-semibold tracking-wider text-subtle hidden sm:inline mr-0.5">Theme</span>
  <div class="flex gap-2">
    {#each themes as theme}
      <button
        type="button"
        onclick={() => selectTheme(theme.id)}
        class="relative w-5 h-5 rounded-full cursor-pointer transition-all duration-300 hover:scale-125 focus:outline-none flex items-center justify-center group"
        style="background-color: {theme.bg}; border: 2px solid {theme.accent};"
        aria-label="Switch to {theme.name} theme"
        title={theme.name}
      >
        <!-- Center indicator dot / pulse for active theme -->
        {#if currentTheme === theme.id}
          <span 
            class="absolute -inset-1 rounded-full animate-ping opacity-25"
            style="border: 2px solid {theme.accent};"
          ></span>
          <span 
            class="w-1.5 h-1.5 rounded-full"
            style="background-color: {theme.accent};"
          ></span>
        {/if}
        
        <!-- Tooltip -->
        <span class="absolute bottom-full mb-2 scale-0 group-hover:scale-100 transition-all duration-150 bg-secondary border border-edge text-primary-foreground text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-50 pointer-events-none shadow-lg opacity-0 group-hover:opacity-100">
          {theme.name}
        </span>
      </button>
    {/each}
  </div>
</div>
