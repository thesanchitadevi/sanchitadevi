<script lang="ts">
  import { onMount } from "svelte";
  import {
    thoughtsStore,
    isLoadingStore,
    fetchThoughts,
    togglePublishThought,
    deleteThoughtRemote,
    resolveThoughtThumbnail,
    extractYouTubeVideoId,
    slugifyTitle,
    type Thought,
  } from "../../stores/thoughts.store";

  const AUTH_STORAGE_KEY = "sanchita_writer_authenticated";
  const DEFAULT_SECRET = "sanchita";

  let allThoughts = $state<Thought[]>([]);
  let isLoading = $state(true);
  let selectedTag = $state<string | null>(null);
  let searchQuery = $state("");

  // Author Mode & Controls
  let isAuthorMode = $state(false);
  let showPasscodePrompt = $state(false);
  let passcodeAttempt = $state("");
  let passcodeError = $state("");
  let authorFilter = $state<"all" | "published" | "hidden">("all");
  let actionFeedback = $state("");

  thoughtsStore.subscribe((val) => {
    allThoughts = [...val];
  });

  isLoadingStore.subscribe((val) => {
    isLoading = val;
  });

  function showActionToast(msg: string) {
    actionFeedback = msg;
    setTimeout(() => {
      actionFeedback = "";
    }, 3000);
  }

  // Filtered thoughts based on status
  let visibleThoughts = $derived(
    isAuthorMode
      ? allThoughts.filter((t) => {
          if (authorFilter === "published") return t.published;
          if (authorFilter === "hidden") return !t.published;
          return true;
        })
      : allThoughts.filter((t) => t.published)
  );

  let availableTags = $derived(
    Array.from(new Set(visibleThoughts.flatMap((t) => t.tags || [])))
  );

  let filteredThoughts = $derived(
    visibleThoughts.filter((thought) => {
      const matchesTag = !selectedTag || (thought.tags && thought.tags.includes(selectedTag));
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        thought.title.toLowerCase().includes(q) ||
        thought.summary.toLowerCase().includes(q) ||
        (thought.tags && thought.tags.some((t) => t.toLowerCase().includes(q)));

      return matchesTag && matchesSearch;
    })
  );

  function toggleAuthorMode() {
    if (isAuthorMode) {
      isAuthorMode = false;
      showActionToast("Exited Author Mode");
    } else {
      if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(AUTH_STORAGE_KEY) === "true") {
        isAuthorMode = true;
        showActionToast("Author Mode Enabled");
      } else {
        showPasscodePrompt = true;
        passcodeAttempt = "";
        passcodeError = "";
      }
    }
  }

  function handlePasscodeSubmit() {
    if (passcodeAttempt.trim() === DEFAULT_SECRET || passcodeAttempt.trim().toLowerCase() === "sanchita2026") {
      isAuthorMode = true;
      showPasscodePrompt = false;
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
      }
      showActionToast("Author Mode Activated");
    } else {
      passcodeError = "Incorrect passcode.";
    }
  }

  async function handleTogglePublish(e: Event, thought: Thought) {
    e.preventDefault();
    e.stopPropagation();
    const updated = await togglePublishThought(thought.id);
    if (updated) {
      showActionToast(updated.published ? `"${thought.title}" is now Published!` : `"${thought.title}" is now Hidden (Draft)!`);
    }
  }

  async function handleDelete(e: Event, thought: Thought) {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Delete "${thought.title}"?`)) {
      await deleteThoughtRemote(thought.id);
      showActionToast(`Deleted "${thought.title}"`);
    }
  }

  function estimateReadingTime(html: string): number {
    const text = html.replace(/<[^>]*>/g, " ");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  onMount(async () => {
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(AUTH_STORAGE_KEY) === "true") {
      isAuthorMode = true;
    }
    await fetchThoughts();
  });
</script>

<div class="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
  <!-- HEADER & CONTROLS -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-edge">
    <div>
      <div class="flex items-center gap-2">
        <h1 class="text-3xl font-bold tracking-tight">Thoughts & Musings</h1>
        {#if isAuthorMode}
          <span class="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-accent/20 text-accent border border-accent/40">
            Author Mode
          </span>
        {/if}
      </div>
      <p class="text-subtle text-sm mt-1">Live thoughts, stories, and reflections</p>
    </div>

    <div class="flex items-center flex-wrap gap-2">
      <!-- AUTHOR CONTROLS TOGGLE -->
      <button
        type="button"
        onclick={toggleAuthorMode}
        class="px-3 py-1.5 text-xs rounded border transition-colors flex items-center gap-1.5 cursor-pointer {isAuthorMode ? 'bg-accent text-primary font-bold border-accent shadow-xs' : 'border-edge text-subtle hover:text-accent hover:border-accent'}"
        title={isAuthorMode ? "Exit Author Mode" : "Manage, hide, or delete thoughts"}
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z"></path>
        </svg>
        <span>{isAuthorMode ? "Author Active" : "Author Controls"}</span>
      </button>

      {#if isAuthorMode}
        <a
          href="/write"
          class="px-3 py-1.5 text-xs rounded border border-edge text-accent hover:border-accent transition-colors flex items-center gap-1"
        >
          <span>+ Write</span>
        </a>
      {/if}

      <button
        type="button"
        onclick={() => fetchThoughts()}
        class="px-3 py-1.5 text-xs rounded border border-edge text-subtle hover:text-accent hover:border-accent transition-colors flex items-center gap-1.5 cursor-pointer"
        title="Fetch latest thoughts"
      >
        <span class={isLoading ? "animate-spin" : ""}>↻</span>
        <span>{isLoading ? "Fetching..." : "Refresh"}</span>
      </button>

      <a
        href="/"
        class="px-3 py-1.5 text-xs rounded border border-edge text-subtle hover:text-primary-foreground hover:border-primary-foreground transition-colors"
      >
        ← Portfolio
      </a>
    </div>
  </div>

  <!-- AUTHOR STATUS FILTERS (When Author Mode is ON) -->
  {#if isAuthorMode}
    <div class="p-3 border border-edge rounded-interactive bg-secondary/40 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-2">
        <span class="text-subtle font-semibold uppercase tracking-wider text-[11px]">Filter:</span>
        <button
          type="button"
          onclick={() => (authorFilter = "all")}
          class="px-2.5 py-1 rounded cursor-pointer {authorFilter === 'all' ? 'bg-accent/20 text-accent font-bold' : 'text-subtle hover:text-primary-foreground'}"
        >
          All ({allThoughts.length})
        </button>
        <button
          type="button"
          onclick={() => (authorFilter = "published")}
          class="px-2.5 py-1 rounded cursor-pointer {authorFilter === 'published' ? 'bg-accent/20 text-accent font-bold' : 'text-subtle hover:text-primary-foreground'}"
        >
          Published ({allThoughts.filter(t => t.published).length})
        </button>
        <button
          type="button"
          onclick={() => (authorFilter = "hidden")}
          class="px-2.5 py-1 rounded cursor-pointer {authorFilter === 'hidden' ? 'bg-accent/20 text-accent font-bold' : 'text-subtle hover:text-primary-foreground'}"
        >
          Hidden / Drafts ({allThoughts.filter(t => !t.published).length})
        </button>
      </div>

      <span class="text-subtle text-[11px]">
        Click "Hide" or "Publish" to toggle status. Click card to open full page details view.
      </span>
    </div>
  {/if}

  <!-- SEARCH & TAG FILTERS -->
  <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
    <!-- Tag chips -->
    <div class="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onclick={() => (selectedTag = null)}
        class="px-3 py-1 text-xs rounded-full border transition-all cursor-pointer {selectedTag === null ? 'bg-accent text-primary border-accent font-semibold shadow-xs' : 'bg-secondary/40 text-subtle border-edge hover:text-primary-foreground hover:border-accent'}"
      >
        All ({visibleThoughts.length})
      </button>
      {#each availableTags as tag}
        <button
          type="button"
          onclick={() => (selectedTag = selectedTag === tag ? null : tag)}
          class="px-2.5 py-1 text-xs rounded-full border transition-all cursor-pointer {selectedTag === tag ? 'bg-accent text-primary border-accent font-semibold shadow-xs' : 'bg-secondary/40 text-subtle border-edge hover:text-primary-foreground hover:border-accent'}"
        >
          #{tag}
        </button>
      {/each}
    </div>

    <!-- Search box -->
    <div class="relative w-full md:w-64">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search thoughts..."
        class="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary/50 border border-edge rounded-interactive text-primary-foreground placeholder:text-subtle focus:outline-none focus:border-accent"
      />
      <svg class="absolute left-2.5 top-2 w-3.5 h-3.5 text-subtle" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      {#if searchQuery}
        <button
          type="button"
          onclick={() => (searchQuery = "")}
          class="absolute right-2 top-1.5 text-xs text-subtle hover:text-primary-foreground"
        >
          ✕
        </button>
      {/if}
    </div>
  </div>

  <!-- LOADING SKELETON -->
  {#if isLoading && allThoughts.length === 0}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {#each [1, 2, 3] as _}
        <div class="border border-edge/40 rounded-interactive bg-secondary/20 p-5 space-y-4">
          <div class="h-36 bg-secondary/40 rounded"></div>
          <div class="h-4 bg-secondary/40 rounded w-1/3"></div>
          <div class="h-6 bg-secondary/40 rounded w-4/5"></div>
          <div class="h-12 bg-secondary/40 rounded"></div>
        </div>
      {/each}
    </div>
  {:else if filteredThoughts.length === 0}
    <!-- EMPTY STATE -->
    <div class="p-16 text-center border border-dashed border-edge rounded-interactive text-subtle space-y-3">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/60 text-subtle mb-1">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l6 6v10a2 2 0 0 1-2 2z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
      </div>
      <p class="text-lg font-medium text-primary-foreground">No thoughts found.</p>
      <p class="text-xs text-subtle max-w-sm mx-auto">
        {#if searchQuery || selectedTag}
          No thoughts match your filter. <button type="button" onclick={() => { selectedTag = null; searchQuery = ""; }} class="text-accent underline">Clear filters</button>
        {:else}
          Thoughts written in the editor will appear here dynamically once posted!
        {/if}
      </p>
    </div>
  {:else}
    <!-- THOUGHTS LIST GRID (EVERY CARD LINKS TO /my-thoughts/title) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each filteredThoughts as thought (thought.id)}
        {@const thumbnail = resolveThoughtThumbnail(thought)}
        {@const isYouTube = extractYouTubeVideoId(thought.extendedLink?.url || thought.coverImage || "")}
        {@const thoughtSlug = slugifyTitle(thought.title) || thought.id}

        <a
          href={`/my-thoughts/${thoughtSlug}`}
          class="group text-left flex flex-col justify-between border rounded-interactive bg-linear-to-b from-secondary/80 to-secondary/30 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer {thought.published ? 'border-edge hover:border-accent' : 'border-yellow-500/40 bg-yellow-950/10'}"
        >
          <div>
            <!-- Thumbnail (Cover image or YouTube Thumbnail) -->
            {#if thumbnail}
              <div class="relative w-full h-44 overflow-hidden bg-primary/40">
                <img
                  src={thumbnail}
                  alt={thought.title}
                  loading="lazy"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <!-- YouTube Video Badge -->
                {#if isYouTube}
                  <span class="absolute top-2 left-2 px-2 py-0.5 bg-red-600/90 backdrop-blur-xs text-[10px] text-white font-bold rounded flex items-center gap-1 shadow-sm">
                    <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                    </svg>
                    <span>YouTube</span>
                  </span>
                {/if}

                <!-- Status Badge -->
                {#if !thought.published}
                  <span class="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500/90 text-primary font-bold text-[10px] rounded uppercase tracking-wider shadow-sm">
                    Hidden (Draft)
                  </span>
                {:else if thought.extendedLink && !isYouTube}
                  <span class="absolute top-2 right-2 px-2 py-0.5 bg-primary/80 backdrop-blur-xs text-[10px] text-accent font-medium rounded border border-edge">
                    🔗 Extended Link
                  </span>
                {/if}
              </div>
            {/if}

            <div class="p-5 space-y-3">
              <!-- Meta info: Date & reading time -->
              <div class="flex items-center justify-between text-xs text-subtle">
                <time datetime={thought.createdAt}>
                  {new Date(thought.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                <span>{estimateReadingTime(thought.content)} min read</span>
              </div>

              <!-- Title -->
              <h3 class="text-xl font-bold tracking-wide text-primary-foreground group-hover:text-accent transition-colors leading-snug">
                {thought.title}
              </h3>

              <!-- Excerpt -->
              <p class="text-sm text-subtle line-clamp-3 leading-relaxed">
                {thought.summary}
              </p>
            </div>
          </div>

          <!-- Card footer -->
          <div class="p-5 pt-0 mt-auto flex flex-col gap-3">
            <div class="flex items-center justify-between text-xs">
              <div class="flex flex-wrap gap-1.5">
                {#each thought.tags.slice(0, 3) as tag}
                  <span class="text-accent/90 font-medium">#{tag}</span>
                {/each}
              </div>

              <span class="inline-flex items-center gap-1 text-accent font-semibold group-hover:translate-x-1 transition-transform">
                <span>Read Article</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </span>
            </div>

            <!-- AUTHOR CONTROLS BAR -->
            {#if isAuthorMode}
              <div class="pt-3 border-t border-edge/60 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onclick={(e) => handleTogglePublish(e, thought)}
                  class="px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer {thought.published ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'}"
                  title={thought.published ? "Hide from public view" : "Publish to make visible"}
                >
                  <span>{thought.published ? "👁 Hide" : "✓ Publish"}</span>
                </button>

                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    onclick={(e) => handleDelete(e, thought)}
                    class="px-2 py-1 rounded border border-red-500/40 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                    title="Delete thought"
                  >
                    Delete
                  </button>
                </div>
              </div>
            {/if}
          </div>
        </a>
      {/each}
    </div>
  {/if}

  <!-- PASSCODE MODAL FOR AUTHOR MODE -->
  {#if showPasscodePrompt}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div class="bg-secondary border border-edge rounded-interactive p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
        <h3 class="text-lg font-bold">Author Verification</h3>
        <p class="text-xs text-subtle">Enter your secret passcode to unlock author controls:</p>

        <form onsubmit={(e) => { e.preventDefault(); handlePasscodeSubmit(); }} class="space-y-3">
          <input
            type="password"
            bind:value={passcodeAttempt}
            placeholder="Passcode..."
            class="w-full px-3 py-2 bg-primary border border-edge rounded-interactive text-center text-sm focus:outline-none focus:border-accent"
            autofocus
          />
          {#if passcodeError}
            <p class="text-xs text-red-400">{passcodeError}</p>
          {/if}

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onclick={() => (showPasscodePrompt = false)}
              class="px-3 py-1.5 text-xs rounded border border-edge hover:bg-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 text-xs bg-accent text-primary font-bold rounded-interactive hover:opacity-90 transition-opacity"
            >
              Unlock Controls
            </button>
          </div>
        </form>
      </div>
    </div>
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
