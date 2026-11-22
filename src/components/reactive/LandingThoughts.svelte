<script lang="ts">
  import { onMount } from "svelte";
  import {
    thoughtsStore,
    fetchThoughts,
    resolveThoughtThumbnail,
    slugifyTitle,
    type Thought,
  } from "../../stores/thoughts.store";

  let allThoughts = $state<Thought[]>([]);

  thoughtsStore.subscribe((val) => {
    allThoughts = [...val];
  });

  let thoughts = $derived(allThoughts.filter((t) => t.published));

  onMount(async () => {
    await fetchThoughts();
  });
</script>

{#if thoughts.length > 0}
  <section
    id="thoughts"
    class="relative w-full max-w-3xl mx-auto px-4 py-16 sm:px-8 flex flex-col gap-8"
  >
    {#each thoughts as thought (thought.id)}
      {@const thumbnail = resolveThoughtThumbnail(thought)}
      {@const slug = slugifyTitle(thought.title) || thought.id}
      <a
        href={`/my-thoughts/${slug}`}
        class="group flex flex-col border border-edge rounded-interactive bg-linear-to-b from-secondary/80 to-secondary/30 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-xl"
      >
        {#if thumbnail}
          <img
            src={thumbnail}
            alt={thought.title}
            loading="lazy"
            class="w-full h-56 object-cover"
          />
        {/if}
        <div class="p-5 space-y-2">
          <time class="text-xs text-subtle" datetime={thought.createdAt}>
            {new Date(thought.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
          <h3 class="text-xl font-bold group-hover:text-accent transition-colors">
            {thought.title}
          </h3>
          <p class="text-sm text-subtle line-clamp-3">{thought.summary}</p>
        </div>
      </a>
    {/each}
  </section>
{/if}
