<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    value?: string;
    placeholder?: string;
    onChange?: (html: string) => void;
  }

  let {
    value = "",
    placeholder = "Write your thoughts, reflections, code insights, or stories here...",
    onChange = () => {},
  }: Props = $props();

  let editorRef: HTMLDivElement | null = $state(null);
  let isHtmlMode = $state(false);
  let rawHtml = $state(value);
  let wordCount = $state(0);
  let charCount = $state(0);

  // Link dialog modal state
  let showLinkModal = $state(false);
  let linkUrl = $state("");
  let linkText = $state("");
  let savedSelection: Range | null = null;

  function updateCounts(text: string) {
    charCount = text.length;
    const words = text.trim().split(/\s+/).filter(Boolean);
    wordCount = words.length;
  }

  function handleInput() {
    if (!editorRef) return;
    const html = editorRef.innerHTML;
    rawHtml = html;
    updateCounts(editorRef.innerText || "");
    onChange(html);
  }

  function handleRawHtmlInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    rawHtml = target.value;
    if (editorRef) {
      editorRef.innerHTML = rawHtml;
      updateCounts(editorRef.innerText || "");
    }
    onChange(rawHtml);
  }

  function execute(command: string, val: string | undefined = undefined) {
    if (isHtmlMode) return;
    if (editorRef) {
      editorRef.focus();
    }
    document.execCommand(command, false, val);
    handleInput();
  }

  function formatBlock(tag: string) {
    execute("formatBlock", tag);
  }

  function openLinkModal() {
    if (isHtmlMode) return;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelection = selection.getRangeAt(0).cloneRange();
      linkText = selection.toString();
    } else {
      savedSelection = null;
      linkText = "";
    }
    linkUrl = "";
    showLinkModal = true;
  }

  function applyLink() {
    showLinkModal = false;
    if (!linkUrl.trim()) return;

    if (editorRef) editorRef.focus();

    if (savedSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelection);
      }
    }

    if (linkText && savedSelection && savedSelection.collapsed) {
      // Insert new link with text
      const html = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:opacity-80">${linkText || linkUrl}</a>`;
      execute("insertHTML", html);
    } else {
      execute("createLink", linkUrl);
    }
  }

  function insertInlineImage() {
    const url = prompt("Enter image URL to insert inline:");
    if (url && url.trim()) {
      execute("insertImage", url.trim());
    }
  }

  function insertHorizontalRule() {
    execute("insertHorizontalRule");
  }

  function toggleHtmlMode() {
    isHtmlMode = !isHtmlMode;
    if (!isHtmlMode && editorRef) {
      // Switched back to visual editor
      editorRef.innerHTML = rawHtml;
    }
  }

  $effect(() => {
    // If external value changed significantly and editor is empty or mismatch
    if (editorRef && !isHtmlMode && value !== editorRef.innerHTML && editorRef.innerHTML === "") {
      editorRef.innerHTML = value;
      rawHtml = value;
      updateCounts(editorRef.innerText || "");
    }
  });

  onMount(() => {
    if (editorRef) {
      editorRef.innerHTML = value;
      rawHtml = value;
      updateCounts(editorRef.innerText || "");
    }
  });
</script>

<div class="w-full flex flex-col border border-edge rounded-interactive overflow-hidden bg-primary/40 focus-within:border-accent transition-colors">
  <!-- TOOLBAR -->
  <div class="flex flex-wrap items-center gap-1 p-2 bg-secondary/80 border-b border-edge select-none text-xs sm:text-sm">
    <!-- TEXT FORMAT -->
    <button
      type="button"
      title="Bold (Ctrl+B)"
      onclick={() => execute("bold")}
      class="p-1.5 rounded hover:bg-hover hover:text-accent font-bold transition-colors"
      disabled={isHtmlMode}
    >
      <strong>B</strong>
    </button>
    <button
      type="button"
      title="Italic (Ctrl+I)"
      onclick={() => execute("italic")}
      class="p-1.5 rounded hover:bg-hover hover:text-accent italic transition-colors"
      disabled={isHtmlMode}
    >
      <em>I</em>
    </button>
    <button
      type="button"
      title="Underline (Ctrl+U)"
      onclick={() => execute("underline")}
      class="p-1.5 rounded hover:bg-hover hover:text-accent underline transition-colors"
      disabled={isHtmlMode}
    >
      <u>U</u>
    </button>
    <button
      type="button"
      title="Strikethrough"
      onclick={() => execute("strikeThrough")}
      class="p-1.5 rounded hover:bg-hover hover:text-accent line-through transition-colors"
      disabled={isHtmlMode}
    >
      S
    </button>

    <div class="w-px h-5 bg-edge mx-1"></div>

    <!-- HEADINGS -->
    <button
      type="button"
      title="Heading 1"
      onclick={() => formatBlock("<h1>")}
      class="p-1.5 rounded hover:bg-hover hover:text-accent font-semibold transition-colors"
      disabled={isHtmlMode}
    >
      H1
    </button>
    <button
      type="button"
      title="Heading 2"
      onclick={() => formatBlock("<h2>")}
      class="p-1.5 rounded hover:bg-hover hover:text-accent font-semibold transition-colors"
      disabled={isHtmlMode}
    >
      H2
    </button>
    <button
      type="button"
      title="Heading 3"
      onclick={() => formatBlock("<h3>")}
      class="p-1.5 rounded hover:bg-hover hover:text-accent font-semibold transition-colors"
      disabled={isHtmlMode}
    >
      H3
    </button>
    <button
      type="button"
      title="Paragraph"
      onclick={() => formatBlock("<p>")}
      class="p-1.5 rounded hover:bg-hover hover:text-accent transition-colors"
      disabled={isHtmlMode}
    >
      P
    </button>

    <div class="w-px h-5 bg-edge mx-1"></div>

    <!-- LISTS -->
    <button
      type="button"
      title="Bullet List"
      onclick={() => execute("insertUnorderedList")}
      class="p-1.5 rounded hover:bg-hover hover:text-accent transition-colors flex items-center"
      disabled={isHtmlMode}
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <line x1="9" y1="6" x2="20" y2="6"></line>
        <line x1="9" y1="12" x2="20" y2="12"></line>
        <line x1="9" y1="18" x2="20" y2="18"></line>
        <circle cx="4" cy="6" r="2" fill="currentColor"></circle>
        <circle cx="4" cy="12" r="2" fill="currentColor"></circle>
        <circle cx="4" cy="18" r="2" fill="currentColor"></circle>
      </svg>
    </button>
    <button
      type="button"
      title="Numbered List"
      onclick={() => execute("insertOrderedList")}
      class="p-1.5 rounded hover:bg-hover hover:text-accent transition-colors flex items-center"
      disabled={isHtmlMode}
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <line x1="10" y1="6" x2="21" y2="6"></line>
        <line x1="10" y1="12" x2="21" y2="12"></line>
        <line x1="10" y1="18" x2="21" y2="18"></line>
        <text x="2" y="7" font-size="7" fill="currentColor">1</text>
        <text x="2" y="13" font-size="7" fill="currentColor">2</text>
        <text x="2" y="19" font-size="7" fill="currentColor">3</text>
      </svg>
    </button>

    <div class="w-px h-5 bg-edge mx-1"></div>

    <!-- BLOCKQUOTE & CODE -->
    <button
      type="button"
      title="Blockquote"
      onclick={() => formatBlock("<blockquote>")}
      class="p-1.5 rounded hover:bg-hover hover:text-accent font-serif font-bold transition-colors"
      disabled={isHtmlMode}
    >
      &ldquo;&rdquo;
    </button>
    <button
      type="button"
      title="Code snippet"
      onclick={() => execute("formatBlock", "<pre>")}
      class="p-1.5 rounded hover:bg-hover hover:text-accent font-mono text-xs transition-colors"
      disabled={isHtmlMode}
    >
      &lt;/&gt;
    </button>

    <!-- LINKS & MEDIA -->
    <button
      type="button"
      title="Insert Link"
      onclick={openLinkModal}
      class="p-1.5 rounded hover:bg-hover hover:text-accent transition-colors"
      disabled={isHtmlMode}
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
    </button>
    <button
      type="button"
      title="Insert Inline Image"
      onclick={insertInlineImage}
      class="p-1.5 rounded hover:bg-hover hover:text-accent transition-colors"
      disabled={isHtmlMode}
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    </button>
    <button
      type="button"
      title="Horizontal Divider"
      onclick={insertHorizontalRule}
      class="p-1.5 rounded hover:bg-hover hover:text-accent transition-colors"
      disabled={isHtmlMode}
    >
      &HorizontalLine;
    </button>

    <div class="w-px h-5 bg-edge mx-1"></div>

    <!-- UNDO / REDO / CLEAR -->
    <button
      type="button"
      title="Undo (Ctrl+Z)"
      onclick={() => execute("undo")}
      class="p-1.5 rounded hover:bg-hover hover:text-accent transition-colors"
      disabled={isHtmlMode}
    >
      ↺
    </button>
    <button
      type="button"
      title="Redo (Ctrl+Y)"
      onclick={() => execute("redo")}
      class="p-1.5 rounded hover:bg-hover hover:text-accent transition-colors"
      disabled={isHtmlMode}
    >
      ↻
    </button>
    <button
      type="button"
      title="Clear Formatting"
      onclick={() => execute("removeFormat")}
      class="p-1.5 rounded hover:bg-hover hover:text-accent transition-colors text-xs"
      disabled={isHtmlMode}
    >
      Tx
    </button>

    <!-- RIGHT CONTROLS -->
    <div class="ml-auto flex items-center gap-2">
      <button
        type="button"
        onclick={toggleHtmlMode}
        class="px-2 py-1 text-xs rounded border border-edge hover:border-accent transition-colors {isHtmlMode ? 'bg-accent/20 text-accent font-semibold' : 'text-subtle'}"
        title="Toggle HTML Source"
      >
        {isHtmlMode ? "Visual Editor" : "HTML Mode"}
      </button>
    </div>
  </div>

  <!-- EDITOR CONTENT AREA -->
  <div class="relative min-h-[260px] max-h-[500px] overflow-y-auto p-4">
    {#if isHtmlMode}
      <textarea
        value={rawHtml}
        oninput={handleRawHtmlInput}
        class="w-full h-[260px] bg-transparent text-primary-foreground font-mono text-sm resize-y outline-none"
        placeholder="Edit raw HTML..."
      ></textarea>
    {:else}
      <div
        bind:this={editorRef}
        contenteditable="true"
        oninput={handleInput}
        class="outline-none min-h-[220px] prose prose-invert max-w-none text-primary-foreground leading-relaxed"
        data-placeholder={placeholder}
      ></div>
    {/if}
  </div>

  <!-- FOOTER STATUS -->
  <div class="flex items-center justify-between px-3 py-1.5 bg-secondary/40 border-t border-edge text-[11px] text-subtle">
    <span>{isHtmlMode ? "Editing Raw HTML" : "Rich Text Mode"}</span>
    <div class="flex gap-3">
      <span>{wordCount} words</span>
      <span>{charCount} characters</span>
    </div>
  </div>
</div>

<!-- LINK DIALOG MODAL -->
{#if showLinkModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
    <div class="bg-secondary border border-edge rounded-interactive p-5 max-w-md w-full shadow-2xl space-y-4">
      <h3 class="text-lg font-semibold text-primary-foreground">Insert Link</h3>
      
      <div class="space-y-3">
        <div>
          <label for="link-text-input" class="block text-xs uppercase tracking-wider text-subtle mb-1">Link Text (optional)</label>
          <input
            id="link-text-input"
            type="text"
            bind:value={linkText}
            placeholder="Text to display"
            class="w-full px-3 py-2 bg-primary/80 border border-edge rounded-interactive text-sm text-primary-foreground focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label for="link-url-input" class="block text-xs uppercase tracking-wider text-subtle mb-1">Target URL</label>
          <input
            id="link-url-input"
            type="url"
            bind:value={linkUrl}
            placeholder="https://example.com"
            class="w-full px-3 py-2 bg-primary/80 border border-edge rounded-interactive text-sm text-primary-foreground focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onclick={() => (showLinkModal = false)}
          class="px-3 py-1.5 text-xs rounded border border-edge hover:bg-hover transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onclick={applyLink}
          class="px-3 py-1.5 text-xs rounded bg-accent text-primary font-semibold hover:opacity-90 transition-opacity"
        >
          Apply Link
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  [contenteditable="true"]:empty:before {
    content: attr(data-placeholder);
    color: var(--color-subtle);
    opacity: 0.6;
    pointer-events: none;
    display: block;
  }
  
  [contenteditable="true"] :global(blockquote) {
    border-left: 3px solid var(--color-accent);
    padding-left: 1rem;
    margin-left: 0;
    margin-right: 0;
    font-style: italic;
    color: var(--color-subtle);
  }

  [contenteditable="true"] :global(pre) {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--color-edge);
    border-radius: var(--radius-interactive);
    padding: 0.75rem;
    font-family: monospace;
    overflow-x: auto;
  }

  [contenteditable="true"] :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: var(--radius-interactive);
    margin: 1rem 0;
  }

  [contenteditable="true"] :global(ul) {
    list-style-type: disc;
    padding-left: 1.5rem;
  }

  [contenteditable="true"] :global(ol) {
    list-style-type: decimal;
    padding-left: 1.5rem;
  }
</style>
