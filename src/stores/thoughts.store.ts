import { atom } from "nanostores";

export interface ExtendedLink {
  url: string;
  title?: string;
}

export interface Thought {
  id: string;
  title: string;
  summary: string;
  content: string; // Rich HTML content from editor
  coverImage?: string; // Image URL or Base64 data URL
  extendedLink?: ExtendedLink;
  tags: string[];
  createdAt: string; // ISO date string
  updatedAt?: string;
  published: boolean;
}

const STORAGE_KEY = "sanchita_dynamic_thoughts_v2";
const API_CONFIG_KEY = "sanchita_thoughts_api_url";
const DEFAULT_API_URL = "/api/thoughts";

export const thoughtsStore = atom<Thought[]>([]);
export const isLoadingStore = atom<boolean>(false);
export const errorStore = atom<string | null>(null);

/**
 * Convert a title to a clean URL slug
 */
export function slugifyTitle(title: string | undefined | null): string {
  if (!title) return "";
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Find thought by ID, slugified title, or raw title
 */
export function findThoughtBySlug(slug: string, list?: Thought[]): Thought | null {
  if (!slug) return null;
  const decoded = decodeURIComponent(slug).toLowerCase().trim();
  const pool = list || thoughtsStore.get();

  return (
    pool.find((t) => t.id === slug || t.id.toLowerCase() === decoded) ||
    pool.find((t) => slugifyTitle(t.title) === slug || slugifyTitle(t.title) === decoded) ||
    pool.find((t) => t.title.toLowerCase().trim() === decoded) ||
    null
  );
}

/**
 * Extract YouTube Video ID from any YouTube URL
 */
export function extractYouTubeVideoId(url: string | undefined | null): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
}

/**
 * Get YouTube Thumbnail URL from video URL
 */
export function getYouTubeThumbnail(url: string | undefined | null): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Resolve display thumbnail for a thought (cover image or auto-derived YouTube thumbnail)
 */
export function resolveThoughtThumbnail(thought: Thought): string | null {
  // 1. Direct cover image if specified
  if (thought.coverImage && thought.coverImage.trim()) {
    const ytId = extractYouTubeVideoId(thought.coverImage);
    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
    return thought.coverImage;
  }

  // 2. Auto-derive from extended link if it's a YouTube link
  if (thought.extendedLink?.url) {
    const ytThumb = getYouTubeThumbnail(thought.extendedLink.url);
    if (ytThumb) return ytThumb;
  }

  // 3. Fallback: search in content HTML for YouTube link
  if (thought.content) {
    const match = thought.content.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
  }

  return null;
}

export function getApiEndpoint(): string {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    const custom = localStorage.getItem(API_CONFIG_KEY);
    if (custom && custom.trim()) {
      return custom.trim();
    }
  }
  return DEFAULT_API_URL;
}

export function setApiEndpoint(url: string) {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    if (!url || !url.trim() || url === DEFAULT_API_URL) {
      localStorage.removeItem(API_CONFIG_KEY);
    } else {
      localStorage.setItem(API_CONFIG_KEY, url.trim());
    }
  }
}

/**
 * Fetch thoughts dynamically from API
 */
export async function fetchThoughts(): Promise<Thought[]> {
  isLoadingStore.set(true);
  errorStore.set(null);

  const endpoint = getApiEndpoint();

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      const thoughts: Thought[] = Array.isArray(data) ? data : data.thoughts || [];
      thoughtsStore.set(thoughts);
      persistLocal(thoughts);
      isLoadingStore.set(false);
      return thoughts;
    } else {
      const cached = loadLocal();
      thoughtsStore.set(cached);
      isLoadingStore.set(false);
      return cached;
    }
  } catch (err: any) {
    console.warn("Dynamic API fetch completed with local dynamic cache:", err);
    const cached = loadLocal();
    thoughtsStore.set(cached);
    isLoadingStore.set(false);
    return cached;
  }
}

/**
 * Post or update thought dynamically to API
 */
export async function postThought(
  thoughtData: Omit<Thought, "id" | "createdAt"> & { id?: string; createdAt?: string }
): Promise<Thought> {
  isLoadingStore.set(true);
  errorStore.set(null);

  const now = new Date().toISOString();
  let targetId = thoughtData.id;
  if (!targetId || targetId.trim() === "") {
    const slugBase = thoughtData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    targetId = slugBase ? `${slugBase}-${Date.now().toString(36)}` : `thought-${Date.now()}`;
  }

  const payload: Thought = {
    ...thoughtData,
    id: targetId,
    createdAt: thoughtData.createdAt || now,
    updatedAt: now,
  };

  const endpoint = getApiEndpoint();

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const saved: Thought = (await res.json()) || payload;
      updateLocalList(saved);
      isLoadingStore.set(false);
      return saved;
    } else {
      updateLocalList(payload);
      isLoadingStore.set(false);
      return payload;
    }
  } catch (err: any) {
    console.warn("POST to API completed with local dynamic persistence:", err);
    updateLocalList(payload);
    isLoadingStore.set(false);
    return payload;
  }
}

/**
 * Toggle hide/publish status for a thought
 */
export async function togglePublishThought(id: string): Promise<Thought | null> {
  const current = thoughtsStore.get();
  const target = current.find((t) => t.id === id);
  if (!target) return null;

  const updated: Thought = {
    ...target,
    published: !target.published,
    updatedAt: new Date().toISOString(),
  };

  return await postThought(updated);
}

/**
 * Delete thought dynamically from API
 */
export async function deleteThoughtRemote(id: string): Promise<boolean> {
  const endpoint = getApiEndpoint();

  try {
    await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  } catch (e) {
    console.warn("Remote delete completed:", e);
  }

  const updated = thoughtsStore.get().filter((t) => t.id !== id);
  thoughtsStore.set(updated);
  persistLocal(updated);
  return true;
}

function updateLocalList(thought: Thought) {
  const current = thoughtsStore.get();
  const index = current.findIndex((t) => t.id === thought.id);
  let updatedList: Thought[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = thought;
  } else {
    updatedList = [thought, ...current];
  }
  thoughtsStore.set(updatedList);
  persistLocal(updatedList);
}

function persistLocal(list: Thought[]) {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Local persistence error:", e);
    }
  }
}

function loadLocal(): Thought[] {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Local load error:", e);
    }
  }
  return [];
}
