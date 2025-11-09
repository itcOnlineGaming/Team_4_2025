<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';


    onMount(() => {
        goto('/calendar');
    });
</script>

<main>
    <p>Redirecting to calendar…</p>
</main>
