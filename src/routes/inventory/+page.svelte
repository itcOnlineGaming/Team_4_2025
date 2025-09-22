<script lang="ts">
    import { theme } from '$lib/theme';
    import { onMount } from 'svelte';
    import CharacterDisplay from '$lib/CharacterDisplay.svelte';
    import { getDefaultCharacter } from '$lib/character';
    import paths from '$lib/assets/paths.json';

    const character = getDefaultCharacter();

    onMount(() => {
        document.documentElement.style.setProperty('--background', theme.background);
        document.documentElement.style.setProperty('--bubbleBackground', theme.bubbleBackground);
        document.documentElement.style.setProperty('--buttonPrimary', theme.buttonPrimary);
        document.documentElement.style.setProperty('--buttonHover', theme.buttonHover);
        document.documentElement.style.setProperty('--buttonText', theme.buttonText);
        document.documentElement.style.setProperty('--textPrimary', theme.textPrimary);
    });
    let inventoryItems = [];
    let moneyAmount = 0;

    const hats =[
        paths.hats[0],
        paths.hats[1],
        paths.hats[2]
    ]

    const bodies =[
        paths.body[0],
        paths.body[1],
        paths.body[2]
    ]

    const shirts =[
        paths.shirts[0],
        paths.shirts[1],
        paths.shirts[2]
    ]

    const tabs = [
        {label: "Hats", icon: "🎩"},
        {label: "Body", icon: "👚"},
        {label: "Bottoms", icon: "👖"}
    ];
</script>

<main>
    <div class="header">
        <a href="/" class="button" id="home-button">
            <span class="icon">🏠</span>
        </a>
        <div class="money">
            <span class="icon">💲</span>
            <span id="moneyAmount">100</span>
        </div>
    </div>

    <div class="character-container">
        <CharacterDisplay {character} />
    </div>

    <div class="tab-selector">

    </div>

    <div class="inventory">

        <div class="hatsTab">
                {#each hats as hat, i}
                    <div
                            on:click={() => character.hat = paths.hats[i]}
                    >
                        <span>Hat {i}</span>
                    </div>
                {/each}
        </div>

        <div class="bodiesTab">
            {#each bodies as body, i}
                <div
                        on:click={() => character.body = paths.body[i]}
                >
                    <span>Body {i}</span>
                </div>
            {/each}
        </div>

        <div class="shirtsTab">
            {#each shirts as shirt, i}
                <div
                        on:click={() => character.shirt = paths.shirts[i]}
                >
                    <span>Shirt {i}</span>
                </div>
            {/each}
        </div>
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
    .header {
        display: flex;
        flex-direction: row;
        font-size: 200%;
    }

    #home-button{
        position: absolute;
        top: 1rem;
        left: 1rem;
    }

    .money {
        position: absolute;
        top: 1rem;
        right: 1rem;
    }

    .inventory {
        background-color: var(--bubbleBackground);
        position: absolute;
        min-height: 40vh;
        width: 100%;
        padding: 1rem;
        display: flex;
        bottom: 1rem;
        flex-direction: column;
    }

    .character-container {
        position: absolute;
        bottom: 40vh;
        width: 150px;
        height: 150px;
        display: flex;
        transform: translateY(-50%);
        justify-content: center;
        align-items: center;
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
    }

    .write-button {
        font-size: 1.3rem;
        padding: 1.2rem 2.4rem;
    }

    .button:hover {
        background-color: var(--buttonHover);
    }
</style>