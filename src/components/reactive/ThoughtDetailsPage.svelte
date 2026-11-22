<script lang="ts">
  import { onMount } from "svelte";
  import {
    thoughtsStore,
    isLoadingStore,
    fetchThoughts,
    findThoughtBySlug,
    slugifyTitle,
    togglePublishThought,
    deleteThoughtRemote,
    resolveThoughtThumbnail,
    extractYouTubeVideoId,
    type Thought,
  } from "../../stores/thoughts.store";

  const AUTH_STORAGE_KEY = "sanchita_writer_authenticated";

  interface Props {
    slug?: string;
  }

  let { slug = "" }: Props = $props();

  let resolvedSlug = $state(slug);
  let allThoughts = $state<Thought[]>([]);
  let isLoading = $state(true);
  let currentThought = $state<Thought | null>(null);
  let copiedLink = $state(false);
  let isAuthorMode = $state(false);
  let actionFeedback = $state("");

  thoughtsStore.subscribe((val) => {
    allThoughts = [...val];
    if (resolvedSlug) {
      currentThought = findThoughtBySlug(resolvedSlug, allThoughts);
    }
  });

  isLoadingStore.subscribe((val) => {
    isLoading = val;
  });

  function getSlugFromUrl(): string {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.replace(/\/$/, "");
      const segments = path.split("/").filter(Boolean);
      // e.g. /my-thoughts/title-here -> 'title-here'
      if (segments.length >= 2 && segments[0] === "my-thoughts") {
        return decodeURIComponent(segments.slice(1).join("/"));
      }
    }
    return slug;
  }

  function estimateReadingTime(html: string): number {
    const text = html.replace(/<[^>]*>/g, " ");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  function showActionToast(msg: string) {
    actionFeedback = msg;
    setTimeout(() => {
      actionFeedback = "";
    }, 3000);
  }

  async function handleTogglePublish() {
    if (!currentThought) return;
    const updated = await togglePublishThought(currentThought.id);
    if (updated) {
      currentThought = updated;
      showActionToast(updated.published ? "Thought is now Published!" : "Thought is now Hidden (Draft)!");
    }
  }

  async function handleDelete() {
    if (!currentThought) return;
    if (confirm(`Are you sure you want to delete "${currentThought.title}"?`)) {
      await deleteThoughtRemote(currentThought.id);
      showActionToast("Thought deleted.");
      if (typeof window !== "undefined") {
        window.location.href = "/my-thoughts";
      }
    }
  }

  function copyCurrentLink() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).then(() => {
        copiedLink = true;
        setTimeout(() => {
          copiedLink = false;
        }, 2000);
      });
    }
  }

  onMount(async () => {
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(AUTH_STORAGE_KEY) === "true") {
      isAuthorMode = true;
    }

    resolvedSlug = getSlugFromUrl();
    await fetchThoughts();
    currentThought = findThoughtBySlug(resolvedSlug, thoughtsStore.get());
  });
</script>

<div class="w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
  <!-- TOP NAVIGATION BAR -->
  <div class="flex items-center justify-between pb-4 border-b border-edge">
    <a
      href="/my-thoughts"
      class="px-3 py-1.5 text-xs rounded border border-edge text-subtle hover:text-primary-foreground hover:border-accent transition-colors flex items-center gap-1.5"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M19 12H5M12 19l-7-7 7-7"></path>
      </svg>
      <span>All Thoughts</span>
    </a>

    <div class="flex items-center gap-2">
      <!-- AUTHOR CONTROLS -->
      {#if isAuthorMode && currentThought}
        <button
          type="button"
          onclick={handleTogglePublish}
          class="px-2.5 py-1 text-xs rounded font-semibold transition-colors cursor-pointer {currentThought.published ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'}"
        >
          {currentThought.published ? "Hide (Draft)" : "Publish (Live)"}
        </button>

        <a
          href="/write"
          class="px-2.5 py-1 text-xs rounded border border-edge text-subtle hover:text-accent hover:border-accent transition-colors"
        >
          Edit in Writer
        </a>

        <button
          type="button"
          onclick={handleDelete}
          class="px-2.5 py-1 text-xs rounded border border-red-500/40 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
        >
          Delete
        </button>
      {/if}

      <button
        type="button"
        onclick={copyCurrentLink}
        class="px-3 py-1.5 text-xs rounded border border-edge text-subtle hover:text-accent hover:border-accent transition-colors flex items-center gap-1 cursor-pointer"
        title="Copy direct link to this thought"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
        <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
      </button>
    </div>
  </div>

  <!-- LOADING STATE -->
  {#if isLoading && !currentThought}
    <div class="space-y-6 animate-pulse">
      <div class="h-64 bg-secondary/30 rounded-interactive"></div>
      <div class="h-6 bg-secondary/30 rounded w-1/4"></div>
      <div class="h-10 bg-secondary/30 rounded w-3/4"></div>
      <div class="h-4 bg-secondary/30 rounded w-full"></div>
      <div class="h-4 bg-secondary/30 rounded w-5/6"></div>
    </div>
  {:else if !currentThought}
    <!-- NOT FOUND -->
    <div class="p-16 text-center border border-dashed border-edge rounded-interactive space-y-4">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-subtle">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h2 class="text-xl font-bold text-primary-foreground">Thought Not Found</h2>
      <p class="text-subtle text-xs max-w-sm mx-auto">
        The thought you are looking for might have been moved, deleted, or is still in draft.
      </p>
      <div class="pt-2">
        <a
          href="/my-thoughts"
          class="px-4 py-2 bg-accent text-primary font-bold text-xs rounded-interactive hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
        >
          ← Explore All Thoughts
        </a>
      </div>
    </div>
  {:else}
    {@const thumb = resolveThoughtThumbnail(currentThought)}
    {@const ytVideoId = extractYouTubeVideoId(currentThought.extendedLink?.url || currentThought.coverImage || "")}

    <!-- THOUGHT ARTICLE PAGE VIEW -->
    <article class="space-y-8">
      <!-- HERO MEDIA (EMBEDDED YOUTUBE OR COVER IMAGE) -->
      {#if ytVideoId}
        <div class="w-full aspect-video rounded-interactive overflow-hidden border border-edge shadow-2xl bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${ytVideoId}`}
            title={currentThought.title}
            class="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      {:else if thumb}
        <div class="w-full max-h-[460px] overflow-hidden rounded-interactive border border-edge shadow-xl">
          <img
            src={thumb}
            alt={currentThought.title}
            class="w-full h-full max-h-[460px] object-cover"
          />
        </div>
      {/if}

      <!-- HEADER META -->
      <header class="space-y-4">
        <div class="flex flex-wrap items-center gap-3 text-xs text-subtle">
          <time datetime={currentThought.createdAt}>
            {new Date(currentThought.createdAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span>•</span>
          <span>{estimateReadingTime(currentThought.content)} min read</span>
          <span>•</span>
          <span>By Sanchita Devi</span>
          {#if !currentThought.published}
            <span class="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold text-[10px] uppercase">
              Draft
            </span>
          {/if}
        </div>

        <h1 class="text-3xl sm:text-5xl font-bold tracking-tight text-primary-foreground leading-tight">
          {currentThought.title}
        </h1>

        <!-- TAGS -->
        <div class="flex flex-wrap gap-2 pt-1">
          {#each currentThought.tags as tag}
            <span class="px-2.5 py-0.5 text-xs rounded-full bg-accent/15 text-accent border border-accent/30 font-medium">
              #{tag}
            </span>
          {/each}
        </div>
      </header>

      <!-- DIVIDER -->
      <div class="border-b border-edge"></div>

      <!-- RICH PROSE CONTENT -->
      <div class="prose prose-invert max-w-none text-primary-foreground/90 text-base sm:text-lg leading-relaxed space-y-4">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html currentThought.content}
      </div>

      <!-- EXTENDED LINK (Featured action banner) -->
      {#if currentThought.extendedLink && currentThought.extendedLink.url}
        <div class="mt-10 p-5 border border-accent/40 rounded-interactive bg-accent/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="min-w-0">
            <span class="text-[11px] uppercase tracking-wider text-accent font-bold flex items-center gap-1.5">
              {#if ytVideoId}
                <svg class="w-3.5 h-3.5 fill-red-500" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                <span>YouTube Resource</span>
              {:else}
                <span>Extended Link</span>
              {/if}
            </span>
            <p class="text-sm font-semibold text-primary-foreground mt-0.5">
              {currentThought.extendedLink.title || (ytVideoId ? "Watch Video on YouTube" : "Explore related resource")}
            </p>
            <p class="text-xs text-subtle truncate max-w-md">{currentThought.extendedLink.url}</p>
          </div>

          <a
            href={currentThought.extendedLink.url}
            target="_blank"
            rel="noopener noreferrer"
            class="px-5 py-2.5 rounded-interactive bg-accent text-primary font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0 shadow-md"
          >
            <span>{currentThought.extendedLink.title || (ytVideoId ? "Open in YouTube" : "Open Link")}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      {/if}

      <!-- FOOTER NAVIGATION -->
      <footer class="pt-8 border-t border-edge flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-subtle">
        <a
          href="/my-thoughts"
          class="text-accent underline hover:opacity-80"
        >
          ← Back to all thoughts
        </a>
        <span>Published by Sanchita Devi</span>
      </footer>
    </article>
  {/if}

  <!-- TOAST FEEDBACK -->
  {#if actionFeedback}
    <div class="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-accent text-primary font-semibold text-xs rounded-interactive shadow-2xl flex items-center gap-2">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M20 6L9 17l-5-5"></path>
      </svg>
      <span>{actionFeedback}</span>
    </div>
  {/if}
</div>
