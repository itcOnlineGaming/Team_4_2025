<script lang="ts">
    import { theme } from '$lib/theme';
    import { onMount } from 'svelte';
    import CharacterDisplay from '$lib/CharacterDisplay.svelte';
    import { getDefaultCharacter } from '$lib/character';
    import { getStreakCounter, incrementStreakCounter } from '$lib/streakCounter';

    const character = getDefaultCharacter();
    let streak = 0; // Initialize to 0 for SSR

    function handleIncrementStreak() {
        incrementStreakCounter();
        streak = getStreakCounter();
    }

    onMount(() => {
        // Set theme variables
        document.documentElement.style.setProperty('--background', theme.background);
        document.documentElement.style.setProperty('--bubbleBackground', theme.bubbleBackground);
        document.documentElement.style.setProperty('--buttonPrimary', theme.buttonPrimary);
        document.documentElement.style.setProperty('--buttonHover', theme.buttonHover);
        document.documentElement.style.setProperty('--buttonText', theme.buttonText);
        document.documentElement.style.setProperty('--textPrimary', theme.textPrimary);

        // Get streak from localStorage once we're in the browser
        streak = getStreakCounter();
    });
</script>

<main>
    <div class="streak-container">
        <div class="streak">🔥 Streak: {streak}</div>
        <button class="button increment-button" on:click={handleIncrementStreak}>
            <span class="icon">⬆️</span>
            Increment Streak
        </button>
    </div>
    
    <div class="flamingo-container">
        <div class="bubble">
            <span class="flamingo">🦩</span>
        </div>
    </div>
    
    <div class="buttons">
        <a href="/write" class="button write-button">
            <span class="icon">✏️</span>
            Write
        </a>
        <a href="/gamble" class="button">
            <span class="icon">🎲</span>
            Gamble
        </a>
        <a href="/shop" class="button">
            <span class="icon">🛍️</span>
            Shop
        </a>
    </div>
    
    <div class="character-container">
        <CharacterDisplay {character} />
    </div>
</main>

<style>
    main {
        position: relative;
        min-height: 100vh;
        background-color: var(--background);
        padding: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .streak-container {
        position: absolute;
        top: 1rem;
        right: 1rem;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5rem;
    }

    .streak {
        font-size: 1.2rem;
        color: var(--textPrimary);
    }

    .increment-button {
        font-size: 1rem;
        padding: 0.5rem 1rem;
        min-width: 150px;
    }

    .flamingo-container {
        margin-top: 3rem;
        margin-bottom: 2rem;
    }

    .bubble {
        background-color: var(--bubbleBackground);
        border-radius: 50%;
        width: 200px;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .flamingo {
        font-size: 100px;
    }

    .buttons {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin: 2rem 0;
    }

    .button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background-color: var(--buttonPrimary);
        color: var(--buttonText);
        padding: 1rem 2rem;
        border-radius: 8px;
        text-decoration: none;
        font-size: 1.1rem;
        transition: background-color 0.2s;
        min-width: 200px;
        border: none;
        cursor: pointer;
    }

    .write-button {
        font-size: 1.3rem;
        padding: 1.2rem 2.4rem;
    }

    .button:hover {
        background-color: var(--buttonHover);
    }

    .icon {
        font-size: 1.2em;
    }

    .character-container {
        position: absolute;
        bottom: 2rem;
        width: 150px;
        height: 150px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
