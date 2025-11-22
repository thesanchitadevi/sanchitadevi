<script lang="ts">
    import { fade } from "svelte/transition";
    import { onMount } from "svelte";
    import { cn } from '../../styles/cn.ts';

    interface Props {
        tags: string[];
    }

    const { tags }: Props = $props();
    let isMounted: boolean = $state(false);

    onMount(() => {
        isMounted = true;
    })
</script>

{#snippet tag(title: string)}
    {#if isMounted}
        <span in:fade={{duration: 400 + Math.random() * 600, delay: Math.random() * 1000}} class={cn("inline-block w-fit h-fit px-2 py-1 bg-transparent border rounded-interactive border-accent text-accent font-semibold duration-200")}>
            {title}
        </span>
    {/if}
{/snippet}

<div class="flex flex-row flex-wrap justify-center gap-2 mt-4 text-lg">
    {#each tags as title}
        {@render tag(title)}
    {/each}
</div>