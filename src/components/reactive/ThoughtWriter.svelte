<script lang="ts">
  import { onMount } from "svelte";
  import RichTextEditor from "./RichTextEditor.svelte";
  import {
    thoughtsStore,
    isLoadingStore,
    fetchThoughts,
    postThought,
    deleteThoughtRemote,
    togglePublishThought,
    extractYouTubeVideoId,
    getYouTubeThumbnail,
    resolveThoughtThumbnail,
    slugifyTitle,
    getApiEndpoint,
    setApiEndpoint,
    type Thought,
  } from "../../stores/thoughts.store";

  const PASSCODE_STORAGE_KEY = "sanchita_writer_authenticated";
  const DEFAULT_SECRET = "sanchita";

  let isAuthenticated = $state(false);
  let enteredPasscode = $state("");
  let authError = $state("");

  // Editor form state
  let editingId = $state<string | null>(null);
  let title = $state("");
  let summary = $state("");
  let content = $state("<p></p>");
  let coverImage = $state("");
  let extendedLinkUrl = $state("");
  let extendedLinkTitle = $state("");
  let tagsInput = $state("");
  let published = $state(true);
  let isPreviewMode = $state(false);

  // Active tab
  let activeTab = $state<"write" | "manage" | "api">("write");
  let toastMessage = $state("");
  let isSubmitting = $state(false);

  // Dynamic API configuration
  let customApiUrl = $state("");
  let allThoughts = $state<Thought[]>([]);
  let isLoading = $state(false);

  thoughtsStore.subscribe((val) => {
    allThoughts = [...val];
  });

  isLoadingStore.subscribe((val) => {
    isLoading = val;
  });

  // Reactive YouTube detection
  let detectedYouTubeId = $derived(
    extractYouTubeVideoId(extendedLinkUrl) || extractYouTubeVideoId(coverImage)
  );

  let detectedYouTubeThumb = $derived(
    detectedYouTubeId ? `https://img.youtube.com/vi/${detectedYouTubeId}/hqdefault.jpg` : null
  );

  let activeThumbnail = $derived(
    coverImage.trim() || detectedYouTubeThumb || null
  );

  let previewSlug = $derived(
    slugifyTitle(title) || editingId || "preview"
  );

  function applyYouTubeThumbnail() {
    if (detectedYouTubeThumb) {
      coverImage = detectedYouTubeThumb;
      showToast("YouTube thumbnail applied as cover image!");
    }
  }

  function showToast(msg: string) {
    toastMessage = msg;
    setTimeout(() => {
      toastMessage = "";
    }, 3500);
  }

  function handleAuthSubmit() {
    if (enteredPasscode.trim() === DEFAULT_SECRET || enteredPasscode.trim().toLowerCase() === "sanchita2026") {
      isAuthenticated = true;
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(PASSCODE_STORAGE_KEY, "true");
      }
      authError = "";
    } else {
      authError = "Incorrect secret passcode.";
    }
  }

  function handleLogout() {
    isAuthenticated = false;
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(PASSCODE_STORAGE_KEY);
    }
  }

  function handleImageFile(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          coverImage = uploadEvent.target.result as string;
          showToast("Cover image loaded successfully!");
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function removeCoverImage() {
    coverImage = "";
  }

  async function handlePost() {
    if (!title.trim()) {
      showToast("Please enter a title for your thought.");
      return;
    }

    let finalSummary = summary.trim();
    if (!finalSummary) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      const plainText = tempDiv.innerText.replace(/\s+/g, " ").trim();
      finalSummary = plainText.length > 160 ? plainText.substring(0, 157) + "..." : plainText;
    }

    const tags = tagsInput
      .split(/[,#]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    let finalCover = coverImage.trim();
    if (!finalCover && detectedYouTubeThumb) {
      finalCover = detectedYouTubeThumb;
    }

    isSubmitting = true;
    try {
      const saved = await postThought({
        id: editingId || undefined,
        title: title.trim(),
        summary: finalSummary,
        content,
        coverImage: finalCover || undefined,
        extendedLink: extendedLinkUrl.trim()
          ? {
              url: extendedLinkUrl.trim(),
              title: extendedLinkTitle.trim() || undefined,
            }
          : undefined,
        tags: tags.length > 0 ? tags : ["General"],
        published,
      });

      showToast(editingId ? "Thought updated & posted!" : "Thought posted dynamically!");
      resetForm();
      activeTab = "manage";
    } catch (e: any) {
      showToast("Error: " + e.message);
    } finally {
      isSubmitting = false;
    }
  }

  function resetForm() {
    editingId = null;
    title = "";
    summary = "";
    content = "<p></p>";
    coverImage = "";
    extendedLinkUrl = "";
    extendedLinkTitle = "";
    tagsInput = "";
    published = true;
    isPreviewMode = false;
  }

  function editThought(t: Thought) {
    editingId = t.id;
    title = t.title;
    summary = t.summary;
    content = t.content;
    coverImage = t.coverImage || "";
    extendedLinkUrl = t.extendedLink?.url || "";
    extendedLinkTitle = t.extendedLink?.title || "";
    tagsInput = t.tags.join(", ");
    published = t.published;
    activeTab = "write";
    isPreviewMode = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleTogglePublish(thought: Thought) {
    const updated = await togglePublishThought(thought.id);
    if (updated) {
      showToast(updated.published ? `"${thought.title}" is now Published!` : `"${thought.title}" is now Hidden (Draft)!`);
    }
  }

  async function handleDelete(id: string, thoughtTitle: string) {
    if (confirm(`Delete "${thoughtTitle}"?`)) {
      await deleteThoughtRemote(id);
      if (editingId === id) resetForm();
      showToast("Thought deleted.");
    }
  }

  function saveApiConfig() {
    setApiEndpoint(customApiUrl);
    showToast("API Endpoint saved: " + getApiEndpoint());
    fetchThoughts();
  }

  function estimateReadingTime(html: string): number {
    const text = html.replace(/<[^>]*>/g, " ");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  onMount(async () => {
    customApiUrl = getApiEndpoint();
    if (typeof sessionStorage !== "undefined") {
      if (sessionStorage.getItem(PASSCODE_STORAGE_KEY) === "true") {
        isAuthenticated = true;
      }
    }
    await fetchThoughts();
  });
</script>

<div class="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
  {#if !isAuthenticated}
    <!-- PASSCODE LOGIN GATE -->
    <div class="max-w-md mx-auto my-16 p-8 border border-edge bg-secondary/60 rounded-interactive backdrop-blur-md shadow-2xl text-center space-y-6">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/20 text-accent mb-2">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>

      <div>
        <h2 class="text-2xl font-bold tracking-wide">Writer's Sanctuary</h2>
        <p class="text-subtle text-sm mt-1">Private portal for posting your thoughts and blogs</p>
      </div>

      <form onsubmit={(e) => { e.preventDefault(); handleAuthSubmit(); }} class="space-y-4">
        <div>
          <input
            type="password"
            bind:value={enteredPasscode}
            placeholder="Enter secret passcode..."
            class="w-full px-4 py-2.5 bg-primary/80 border border-edge rounded-interactive text-center tracking-wider text-primary-foreground focus:outline-none focus:border-accent"
            autofocus
          />
          {#if authError}
            <p class="text-xs text-red-400 mt-2">{authError}</p>
          {/if}
        </div>

        <button
          type="submit"
          class="w-full py-2.5 px-4 bg-accent text-primary font-semibold rounded-interactive hover:opacity-90 transition-opacity cursor-pointer shadow-md"
        >
          Unlock Writer Studio
        </button>
      </form>

      <div class="pt-4 border-t border-edge/60 text-xs text-subtle flex justify-between items-center">
        <span>Restricted Access</span>
        <a href="/" class="text-accent underline hover:opacity-80">← Return to Portfolio</a>
      </div>
    </div>
  {:else}
    <!-- AUTHENTICATED WRITER STUDIO -->
    <div class="space-y-6">
      <!-- HEADER BAR -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-edge">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-accent/20 text-accent border border-accent/40">Studio</span>
            <h1 class="text-2xl sm:text-3xl font-bold">Thought & Blog Writer</h1>
          </div>
          <p class="text-xs sm:text-sm text-subtle mt-0.5">Write, post, hide/publish, and dynamically manage your thoughts</p>
        </div>

        <div class="flex items-center gap-2">
          <a
            href="/my-thoughts"
            class="px-3 py-1.5 text-xs rounded border border-edge hover:border-accent hover:text-accent transition-colors flex items-center gap-1.5"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>All Thoughts</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
          <a
            href="/"
            class="px-3 py-1.5 text-xs rounded border border-edge text-subtle hover:text-primary-foreground hover:border-primary-foreground transition-colors"
          >
            ← Portfolio
          </a>
          <button
            type="button"
            onclick={handleLogout}
            class="px-3 py-1.5 text-xs rounded border border-edge text-subtle hover:text-red-400 hover:border-red-400 transition-colors cursor-pointer"
          >
            Lock Studio
          </button>
        </div>
      </div>

      <!-- NAVIGATION TABS -->
      <div class="flex border-b border-edge gap-2 text-sm">
        <button
          type="button"
          onclick={() => (activeTab = "write")}
          class="px-4 py-2 border-b-2 font-medium transition-colors cursor-pointer {activeTab === 'write' ? 'border-accent text-accent' : 'border-transparent text-subtle hover:text-primary-foreground'}"
        >
          {editingId ? "Edit Thought" : "Write Thought"}
        </button>
        <button
          type="button"
          onclick={() => (activeTab = "manage")}
          class="px-4 py-2 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 {activeTab === 'manage' ? 'border-accent text-accent' : 'border-transparent text-subtle hover:text-primary-foreground'}"
        >
          <span>All Thoughts</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-secondary border border-edge">{allThoughts.length}</span>
        </button>
        <button
          type="button"
          onclick={() => (activeTab = "api")}
          class="px-4 py-2 border-b-2 font-medium transition-colors cursor-pointer {activeTab === 'api' ? 'border-accent text-accent' : 'border-transparent text-subtle hover:text-primary-foreground'}"
        >
          API Settings
        </button>
      </div>

      <!-- TAB CONTENT: WRITE / EDIT -->
      {#if activeTab === "write"}
        <div class="space-y-6">
          <!-- TITLE -->
          <div>
            <label for="thought-title" class="block text-xs uppercase tracking-wider text-subtle mb-1.5">Thought Title *</label>
            <input
              id="thought-title"
              type="text"
              bind:value={title}
              placeholder="e.g. Navigating Uncertainty: Notes on Deep Work"
              class="w-full px-4 py-2.5 bg-secondary/40 border border-edge rounded-interactive text-lg font-semibold text-primary-foreground focus:outline-none focus:border-accent"
            />
            {#if title.trim()}
              <p class="text-[11px] text-subtle mt-1">
                URL Preview: <span class="font-mono text-accent">/my-thoughts/{previewSlug}</span>
              </p>
            {/if}
          </div>

          <!-- SUMMARY / EXCERPT -->
          <div>
            <label for="thought-summary" class="block text-xs uppercase tracking-wider text-subtle mb-1.5">Summary / Excerpt (Short preview)</label>
            <textarea
              id="thought-summary"
              bind:value={summary}
              rows="2"
              placeholder="A brief overview or punchy hook (optional, will auto-generate if empty)"
              class="w-full px-4 py-2 bg-secondary/40 border border-edge rounded-interactive text-sm text-primary-foreground focus:outline-none focus:border-accent resize-y"
            ></textarea>
          </div>

          <!-- DUAL ROW: TAGS & PUBLISH STATUS & PREVIEW BUTTON -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="thought-tags" class="block text-xs uppercase tracking-wider text-subtle mb-1.5">Tags (comma separated)</label>
              <input
                id="thought-tags"
                type="text"
                bind:value={tagsInput}
                placeholder="Tech, Reflections, Life, Code, YouTube"
                class="w-full px-3 py-2 bg-secondary/40 border border-edge rounded-interactive text-sm text-primary-foreground focus:outline-none focus:border-accent"
              />
            </div>

            <div class="flex items-center gap-4 pt-4 sm:pt-6">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  bind:checked={published}
                  class="w-4 h-4 rounded border-edge text-accent focus:ring-accent"
                />
                <span class="text-sm font-medium">{published ? "Status: Published" : "Status: Hidden (Draft)"}</span>
              </label>

              <!-- PREVIEW TOGGLE BUTTON -->
              <div class="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onclick={() => (isPreviewMode = !isPreviewMode)}
                  class="px-3 py-1.5 text-xs rounded border transition-colors cursor-pointer {isPreviewMode ? 'bg-accent text-primary font-bold border-accent' : 'border-edge text-subtle hover:border-accent hover:text-accent'}"
                >
                  {isPreviewMode ? "← Back to Editor" : "Live Page Preview 👁"}
                </button>
              </div>
            </div>
          </div>

          <!-- EXTENDED LINK FIELD (With YouTube auto-detection) -->
          <div class="p-4 border border-edge rounded-interactive bg-secondary/20 space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-xs uppercase tracking-wider font-semibold text-accent flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                <span>Extended Link (YouTube / GitHub / Project / Article)</span>
              </label>
              {#if detectedYouTubeId}
                <span class="px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-bold text-[10px] flex items-center gap-1">
                  <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                  <span>YouTube Video Detected</span>
                </span>
              {/if}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label for="ext-link-url" class="block text-[11px] text-subtle mb-1">Target URL</label>
                <input
                  id="ext-link-url"
                  type="url"
                  bind:value={extendedLinkUrl}
                  placeholder="https://youtube.com/watch?v=... or https://github.com/..."
                  class="w-full px-3 py-2 bg-secondary/50 border border-edge rounded-interactive text-xs text-primary-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label for="ext-link-title" class="block text-[11px] text-subtle mb-1">Button Label (Optional)</label>
                <input
                  id="ext-link-title"
                  type="text"
                  bind:value={extendedLinkTitle}
                  placeholder="e.g. Watch Video, View Source, Live Demo"
                  class="w-full px-3 py-2 bg-secondary/50 border border-edge rounded-interactive text-xs text-primary-foreground focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {#if detectedYouTubeThumb}
              <div class="flex items-center justify-between p-2.5 rounded bg-red-950/20 border border-red-500/30 text-xs">
                <div class="flex items-center gap-2.5">
                  <img src={detectedYouTubeThumb} alt="YouTube thumbnail" class="w-14 h-9 object-cover rounded border border-edge" />
                  <div>
                    <p class="font-semibold text-primary-foreground">YouTube Thumbnail Available</p>
                    <p class="text-[10px] text-subtle">Automatically displayed on your thought card & details page.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onclick={applyYouTubeThumbnail}
                  class="px-2.5 py-1 text-xs rounded bg-accent text-primary font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Use as Cover Image
                </button>
              </div>
            {/if}
          </div>

          <!-- COVER IMAGE FIELD -->
          <div class="p-4 border border-edge rounded-interactive bg-secondary/20 space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-xs uppercase tracking-wider font-semibold text-accent flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>Cover Image / Thumbnail</span>
              </label>
              {#if coverImage}
                <button
                  type="button"
                  onclick={removeCoverImage}
                  class="text-xs text-red-400 hover:underline cursor-pointer"
                >
                  Remove Image
                </button>
              {/if}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <div>
                <span class="block text-[11px] text-subtle mb-1">Upload from Computer (Base64)</span>
                <input
                  type="file"
                  accept="image/*"
                  onchange={handleImageFile}
                  class="block w-full text-xs text-subtle file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-accent file:text-primary hover:file:opacity-90 cursor-pointer"
                />
              </div>
              <div>
                <span class="block text-[11px] text-subtle mb-1">Or Paste Image URL</span>
                <input
                  type="url"
                  bind:value={coverImage}
                  placeholder="https://... or YouTube video link"
                  class="w-full px-3 py-1.5 bg-secondary/50 border border-edge rounded-interactive text-xs text-primary-foreground focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {#if activeThumbnail}
              <div class="relative w-full max-h-56 overflow-hidden rounded border border-edge mt-2">
                <img
                  src={activeThumbnail}
                  alt="Cover preview"
                  class="w-full h-44 object-cover"
                />
                <span class="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-[10px] rounded text-white backdrop-blur-xs">
                  {coverImage ? "Cover Image" : "YouTube Thumbnail"}
                </span>
              </div>
            {/if}
          </div>

          <!-- RICH TEXT EDITOR OR PREVIEW -->
          {#if isPreviewMode}
            <!-- PAGE DETAILS PREVIEW (Matches /my-thoughts/title) -->
            <div class="p-6 border border-accent rounded-interactive bg-secondary/30 space-y-6">
              <div class="flex items-center justify-between pb-3 border-b border-edge">
                <div>
                  <span class="text-xs uppercase font-bold tracking-wider text-accent">Page Details View Preview</span>
                  <p class="text-[11px] text-subtle font-mono mt-0.5">/my-thoughts/{previewSlug}</p>
                </div>
                <button
                  type="button"
                  onclick={() => (isPreviewMode = false)}
                  class="text-xs underline text-subtle hover:text-accent cursor-pointer"
                >
                  ← Return to Editor
                </button>
              </div>

              {#if detectedYouTubeId}
                <div class="w-full aspect-video rounded overflow-hidden border border-edge bg-black shadow-lg">
                  <iframe
                    src={`https://www.youtube.com/embed/${detectedYouTubeId}`}
                    title={title}
                    class="w-full h-full"
                    allowfullscreen
                  ></iframe>
                </div>
              {:else if activeThumbnail}
                <img src={activeThumbnail} alt={title} class="w-full max-h-72 object-cover rounded-interactive" />
              {/if}

              <div class="space-y-2">
                <div class="flex items-center gap-3 text-xs text-subtle">
                  <span>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                  <span>•</span>
                  <span>{estimateReadingTime(content)} min read</span>
                  <span>•</span>
                  <span>By Sanchita Devi</span>
                </div>
                <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">{title || "Untitled Thought"}</h1>
                <div class="flex flex-wrap gap-1.5 pt-1">
                  {#each tagsInput.split(",").map(t => t.trim()).filter(Boolean) as tag}
                    <span class="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-medium">#{tag}</span>
                  {/each}
                </div>
              </div>

              <div class="border-b border-edge"></div>

              <div class="prose prose-invert max-w-none text-base leading-relaxed">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html content}
              </div>

              {#if extendedLinkUrl}
                <div class="mt-6 p-4 rounded border border-accent/40 bg-accent/10 flex items-center justify-between gap-4">
                  <div>
                    <span class="text-[10px] uppercase font-bold text-accent">Extended Link</span>
                    <p class="text-sm font-semibold text-primary-foreground">{extendedLinkTitle || "Explore Resource"}</p>
                    <p class="text-xs text-subtle truncate max-w-sm">{extendedLinkUrl}</p>
                  </div>
                  <span class="px-4 py-2 rounded bg-accent text-primary font-bold text-xs shrink-0">
                    {extendedLinkTitle || "Open Link"} ↗
                  </span>
                </div>
              {/if}
            </div>
          {:else}
            <div>
              <label class="block text-xs uppercase tracking-wider text-subtle mb-1.5">Rich Text Content *</label>
              <RichTextEditor
                value={content}
                placeholder="Write your thought, reflections, stories, or code insights..."
                onChange={(html) => (content = html)}
              />
            </div>
          {/if}

          <!-- ACTION BUTTONS -->
          <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-edge">
            <div class="flex items-center gap-2">
              {#if editingId}
                <button
                  type="button"
                  onclick={resetForm}
                  class="px-4 py-2 text-xs rounded border border-edge hover:bg-hover transition-colors cursor-pointer"
                >
                  Cancel Editing
                </button>
              {/if}
              <button
                type="button"
                onclick={resetForm}
                class="px-3 py-2 text-xs text-subtle hover:text-primary-foreground transition-colors cursor-pointer"
              >
                Clear Form
              </button>
            </div>

            <div class="flex items-center gap-3">
              <button
                type="button"
                onclick={handlePost}
                disabled={isSubmitting}
                class="px-6 py-2.5 bg-accent text-primary font-bold rounded-interactive hover:opacity-90 transition-opacity cursor-pointer shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
                </svg>
                <span>{isSubmitting ? "Posting..." : editingId ? "Update Thought" : "Post Thought"}</span>
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- TAB CONTENT: MANAGE THOUGHTS -->
      {#if activeTab === "manage"}
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold">Posted Thoughts ({allThoughts.length})</h2>
            <div class="flex items-center gap-2">
              <button
                type="button"
                onclick={() => fetchThoughts()}
                class="px-3 py-1.5 text-xs rounded border border-edge hover:border-accent hover:text-accent transition-colors flex items-center gap-1 cursor-pointer"
              >
                ↻ Refresh
              </button>
              <button
                type="button"
                onclick={() => { resetForm(); activeTab = "write"; }}
                class="px-3 py-1.5 text-xs bg-accent text-primary font-semibold rounded-interactive hover:opacity-90 transition-opacity cursor-pointer"
              >
                + Write New Thought
              </button>
            </div>
          </div>

          {#if allThoughts.length === 0}
            <div class="p-8 text-center border border-edge rounded-interactive text-subtle">
              <p>No thoughts posted yet. Click "+ Write New Thought" to post your first one!</p>
            </div>
          {:else}
            <div class="grid gap-3">
              {#each allThoughts as thought (thought.id)}
                {@const thumb = resolveThoughtThumbnail(thought)}
                {@const isYt = extractYouTubeVideoId(thought.extendedLink?.url || thought.coverImage || "")}
                {@const thoughtSlug = slugifyTitle(thought.title) || thought.id}

                <div class="p-4 border rounded-interactive bg-secondary/30 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors {thought.published ? 'border-edge hover:border-accent/60' : 'border-yellow-500/40 bg-yellow-950/10'}">
                  <div class="flex items-start gap-3 min-w-0">
                    {#if thumb}
                      <div class="relative shrink-0">
                        <img
                          src={thumb}
                          alt={thought.title}
                          class="w-16 h-16 object-cover rounded border border-edge"
                        />
                        {#if isYt}
                          <span class="absolute bottom-0 right-0 bg-red-600 text-white text-[9px] px-1 font-bold rounded-tl">YT</span>
                        {/if}
                      </div>
                    {:else}
                      <div class="w-16 h-16 rounded border border-edge bg-primary/40 flex items-center justify-center text-subtle shrink-0">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        </svg>
                      </div>
                    {/if}

                    <div class="space-y-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <h3 class="font-semibold text-base text-primary-foreground leading-snug truncate">{thought.title}</h3>
                        {#if !thought.published}
                          <span class="px-1.5 py-0.2 text-[9px] uppercase font-bold tracking-wider rounded bg-yellow-500/20 text-yellow-300">Hidden / Draft</span>
                        {:else}
                          <span class="px-1.5 py-0.2 text-[9px] uppercase font-bold tracking-wider rounded bg-emerald-500/20 text-emerald-300">Published</span>
                        {/if}
                      </div>
                      <p class="text-xs text-subtle line-clamp-1">{thought.summary}</p>
                      <div class="flex flex-wrap items-center gap-2 text-[11px] text-subtle">
                        <span class="text-accent font-mono">/my-thoughts/{thoughtSlug}</span>
                        <span>•</span>
                        <span>{new Date(thought.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        {#each thought.tags as tag}
                          <span class="text-accent">#{tag}</span>
                        {/each}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 self-end md:self-center shrink-0">
                    <!-- VIEW DETAILS PAGE LINK -->
                    <a
                      href={`/my-thoughts/${thoughtSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="px-2.5 py-1.5 text-xs rounded border border-edge text-accent hover:border-accent transition-colors"
                    >
                      View Page ↗
                    </a>

                    <button
                      type="button"
                      onclick={() => handleTogglePublish(thought)}
                      class="px-2.5 py-1.5 text-xs rounded font-semibold transition-colors cursor-pointer {thought.published ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'}"
                    >
                      {thought.published ? "Hide" : "Publish"}
                    </button>

                    <button
                      type="button"
                      onclick={() => editThought(thought)}
                      class="px-3 py-1.5 text-xs rounded border border-edge hover:border-accent hover:text-accent transition-colors cursor-pointer"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onclick={() => handleDelete(thought.id, thought.title)}
                      class="px-3 py-1.5 text-xs rounded border border-red-500/40 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <!-- TAB CONTENT: API SETTINGS -->
      {#if activeTab === "api"}
        <div class="p-6 border border-edge rounded-interactive bg-secondary/30 space-y-4">
          <h2 class="text-lg font-semibold">Dynamic Fetch & Post Endpoint</h2>
          <p class="text-sm text-subtle">
            Configure the API endpoint used to dynamically post and fetch thoughts.
          </p>
          <div class="space-y-2">
            <label for="api-url-input" class="block text-xs uppercase tracking-wider text-subtle">API Endpoint URL</label>
            <input
              id="api-url-input"
              type="text"
              bind:value={customApiUrl}
              placeholder="/api/thoughts or https://my-backend.com/api/thoughts"
              class="w-full px-3 py-2 bg-primary/80 border border-edge rounded-interactive text-sm text-primary-foreground focus:outline-none focus:border-accent font-mono"
            />
          </div>
          <button
            type="button"
            onclick={saveApiConfig}
            class="px-4 py-2 text-xs bg-accent text-primary font-bold rounded-interactive hover:opacity-90 transition-opacity cursor-pointer"
          >
            Save Endpoint
          </button>
        </div>
      {/if}
    </div>
  {/if}

  <!-- TOAST FEEDBACK -->
  {#if toastMessage}
    <div class="fixed bottom-6 right-6 z-50 px-4 py-3 bg-accent text-primary font-semibold text-sm rounded-interactive shadow-2xl flex items-center gap-2">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M20 6L9 17l-5-5"></path>
      </svg>
      <span>{toastMessage}</span>
    </div>
  {/if}
</div>
