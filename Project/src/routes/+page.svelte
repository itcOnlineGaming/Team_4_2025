<script lang="ts">
    import { theme } from '../lib/theme';
    import { onMount } from 'svelte';
    import Calendar from '../lib/components/Calendar.svelte';

    let selectedDate = new Date();

    onMount(() => {
        // Set theme variables
        document.documentElement.style.setProperty('--background', theme.background);
        document.documentElement.style.setProperty('--bubbleBackground', theme.bubbleBackground);
        document.documentElement.style.setProperty('--buttonPrimary', theme.buttonPrimary);
        document.documentElement.style.setProperty('--buttonHover', theme.buttonHover);
        document.documentElement.style.setProperty('--buttonText', theme.buttonText);
        document.documentElement.style.setProperty('--textPrimary', theme.textPrimary);
    });
</script>

<main>    
    <div class="calendar-wrapper">
        <Calendar bind:selectedDate />
    </div>
</main>
