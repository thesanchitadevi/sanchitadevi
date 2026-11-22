<script lang="ts">
  import { onMount } from "svelte";
  import {
    activeThemeState,
    initThemeSystem,
    applyThemeToDOM,
  } from "../../stores/theme.store";
  import OccasionBackdrop from "./OccasionBackdrop.svelte";

  onMount(() => {
    initThemeSystem();

    const handlePageLoad = () => {
      initThemeSystem();
    };

    const handleAfterSwap = () => {
      const state = activeThemeState.get();
      applyThemeToDOM(state.theme);
    };

    document.addEventListener("astro:page-load", handlePageLoad);
    document.addEventListener("astro:after-swap", handleAfterSwap);

    return () => {
      document.removeEventListener("astro:page-load", handlePageLoad);
      document.removeEventListener("astro:after-swap", handleAfterSwap);
    };
  });
</script>

<!-- Thematic seasonal backdrop & animations -->
{#if $activeThemeState?.theme}
  <OccasionBackdrop />
{/if}
