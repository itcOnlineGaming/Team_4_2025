<script lang="ts">
    import { onMount } from 'svelte';
    import { theme } from '../../lib/theme';
    import CalendarView from '../../lib/components/CalendarView.svelte';
    
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
</svelte:head>

<main>
    <div class="page-header">
        <h1>Calendar</h1>
        <a href="/" class="back-button">← Back to Home</a>
    </div>
    
    <div class="calendar-wrapper">
        <CalendarView bind:selectedDate />
    </div>
</main>

<style>
    main {
        min-height: 100vh;
        background-color: var(--background, #f5f5f5);
        padding: 1rem;
    }
    
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
    }
    
    h1 {
        color: var(--textPrimary, #333);
        font-size: 2rem;
        margin: 0;
    }
    
    .back-button {
        background-color: var(--buttonPrimary, #007bff);
        color: var(--buttonText, white);
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        transition: background-color 0.2s;
    }
    
    .back-button:hover {
        background-color: var(--buttonHover, #0056b3);
    }
    
    .calendar-wrapper {
        max-width: 1200px;
        margin: 0 auto;
    }
    
    @media (max-width: 768px) {
        .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }
        
        h1 {
            font-size: 1.5rem;
        }
    }
</style>
