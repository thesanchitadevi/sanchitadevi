<script lang="ts">
  import type { CollectionEntry } from "astro:content";
  import Filters from "./Filters.svelte";
  import { filters } from "../../stores/filters.store";

  export let allPosts: CollectionEntry<"experiences">[];

  $: posts = allPosts.sort((a, b) => {
    return b.data.date.getTime() - a.data.date.getTime();
  });

  $: filteredPosts = posts.filter((post) => {
    if ($filters.length === 0) return true;
    return post.data.tags.some((tag) => $filters.includes(tag));
  });
</script>

<div class="p-8">
  <Filters {allPosts} />
  <div class="grid gap-y-4">
    {#each filteredPosts as post}
      <a
        href={`/experiences/${post.id}`}
        class="group flex flex-col gap-4 rounded-interactive p-4 hover:bg-hover"
      >
        <div class="flex justify-between">
          <div>
            <h2 class="text-2xl">{post.data.role} at {post.data.company}</h2>
            <p class="text-subtle">{post.data.description}</p>
          </div>
          <svg
            class="inline aspect-square w-3 h-auto fill-transparent"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 12L21 12M21 12L12.5 3.5M21 12L12.5 20.5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="flex gap-4">
          <div class="flex gap-2">
            {#each post.data.tags as tag}
              <span class="rounded-tag bg-subtle px-2 py-1 text-xs">{tag}</span>
            {/each}
          </div>
          <span class="text-xs text-subtle">
            {new Date(post.data.date).toLocaleDateString()}
          </span>
        </div>
      </a>
    {/each}
  </div>
</div>