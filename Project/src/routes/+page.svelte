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

<svelte:head>
    <title>Calendar</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
</svelte:head>

<main>
    <div class="page-header">
        <h1>Calendar</h1>
    </div>
    
    <div class="calendar-wrapper">
        <Calendar bind:selectedDate />
    </div>
</main>

<style>
    main {
        min-height: 100vh;
        background-color: var(--background);
        padding: 1rem;
        font-family: 'Roboto', sans-serif;
    }

    .page-header {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 2rem;
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
    }

    h1 {
        color: var(--textPrimary);
        font-size: 2rem;
        font-weight: 500;
        margin: 0;
        font-family: 'Roboto', sans-serif;
    }

    .calendar-wrapper {
        max-width: 1200px;
        margin: 0 auto;
    }

    @media (max-width: 768px) {
        h1 {
            font-size: 1.5rem;
        }
    }
</style>
