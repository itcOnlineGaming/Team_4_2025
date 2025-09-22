<script lang="ts">
    import { theme } from '$lib/theme';
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import CharacterDisplay from '$lib/CharacterDisplay.svelte';
    import { getDefaultCharacter } from '$lib/character';

    const character = getDefaultCharacter();
    let showContainer = false;
    let activeSection = 0;
    const tabs = [
        {label: "Hats", icon: "🎩"},
        {label: "Body", icon: "👚"},
        {label: "Bottoms", icon: "👖"}
    ];
    const hatSubSections = [
        {label: "Hats 1", icon: "🎩"},
        {label: "Hats 2", icon: "🎩"},
        {label: "Hats 3", icon: "🎩"},
        {label: "Hats 4", icon: "🎩"},
        {label: "Hats 5", icon: "🎩"},
        {label: "Hats 6", icon: "🎩"}
    ];
    const topSubSections = [
        {label: "Top 1", icon: "👚"},
        {label: "Top 2", icon: "👚"},
        {label: "Top 3", icon: "👚"},
        {label: "Top 4", icon: "👚"},
        {label: "Top 5", icon: "👚"},
        {label: "Top 6", icon: "👚"}
    ];

    const bottomsSubSections = [
        {label: "Bottoms 1", icon: "👖"},
        {label: "Bottoms 2", icon: "👖"},
        {label: "Bottoms 3", icon: "👖"},
        {label: "Bottoms 4", icon: "👖"},
        {label: "Bottoms 5", icon: "👖"},
        {label: "Bottoms 6", icon: "👖"}
    ];


    onMount(() => {
        document.documentElement.style.setProperty('--background', theme.background);
        document.documentElement.style.setProperty('--bubbleBackground', theme.bubbleBackground);
        document.documentElement.style.setProperty('--buttonPrimary', theme.buttonPrimary);
        document.documentElement.style.setProperty('--buttonHover', theme.buttonHover);
        document.documentElement.style.setProperty('--buttonText', theme.buttonText);
        document.documentElement.style.setProperty('--textPrimary', theme.textPrimary);

        setTimeout(() => {
            showContainer = true;
        }, 500);
    });
</script>

<main>
    
    <div class="character-container">
        <div class="bubble">
            <span class="character">
                <CharacterDisplay {character} />
            </span>
        </div>
    </div>
    <div class="back-button">
        <a href="/" class="back-link">← Back to Home</a>
    </div>

{#if showContainer}
    <div class="equiptment-container" transition:fly={{y:300, duration:400, opacity: 0.2}}>
        
        <div class="tabs" transition:fly={{y:300, duration:400, opacity: 0.2}}>
            {#each tabs as tab, i}
                <div
                    class="tab {activeSection === i ? 'active' : ''}"
                    on:click={() => activeSection = i}
                    >
                    <span>{tab.icon}</span>
                    <span class="tab-label">{tab.label}</span>
                </div>
            {/each}
        </div>
            <div class="tab-content">
                    {#if activeSection === 0}
                        {#each hatSubSections as hat}
                        <div class="hat-item">
                            <span class="hat-icon">{hat.icon}</span>
                            <span class="hat-label">{hat.label}</span>
                        </div>
                        {/each}
                    {:else if activeSection === 1}
                        {#each topSubSections as hat}
                        <!-- <div class="top-item">
                            <span class="top-icon">{top.icon}</span>
                            <span class="top-label">{hat.label}</span>
                        </div> -->
                        {/each}
                    {:else if activeSection === 2}
                        {#each bottomsSubSections as bottoms}
                        <div class="bottoms-item">
                            <span class="bottoms-icon">{bottoms.icon}</span>
                            <span class="bottoms-label">{bottoms.label}</span>
                        </div>
                        {/each}
                    {/if}
            </div>
    </div>
{/if}

    
    <div class="character-placeholder">
        <!-- Character will be added here later -->
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

    .equiptment-container {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100vw;
        height: 50vh;
        background: #222;
        border-top-left-radius: 24px;
        border-top-right-radius: 24px;
        box-shadow: 0 -4px 24px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: row;
        align-items: row;
        justify-content: center;
        z-index: 100;
        color: #fff;

    }

    .bubble {
        background-color: var(--bubbleBackground);
        border-radius: 50%;
        width: 200px;
        height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
    }

    .button:hover {
        background-color: var(--buttonHover);
    }

    .icon {
        font-size: 1.2em;
    }

    .character-placeholder {
        position: absolute;
        bottom: 2rem;
        width: 150px;
        height: 150px;
        background-color: var(--bubbleBackground);
        border-radius: 50%;
    }

    
    .tabs {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 24px 8px;
        background:rgb(77, 77, 77);
        border-top-left-radius: 24px;
        border-bottom-left-radius: 0px;
        min-width: 80px;
        align-items: center;
    }
    
    .tab {
        width: 56px;
        height: 56px;
        background: #333;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.5rem;
        border: 2px solid transparent;
        transition: border 0.2s, background 0.2s;
    }
    .tab.active {
        border: 2px solid #4fc3f7;
        background: #263238;
    }
    .tab-label {
        font-size: 0.8rem;
        margin-top: 4px;
        color: #bbb;
    }
    .tab.active .tab-label {
        color: #4fc3f7;
    }
    .tab-content {
        flex: 1;
        padding: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
    }

    .hat-subsections {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    padding: 30px;
    }

    .hat-item {
    background: #333;
    padding: 45px 45px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 30px;
    cursor: pointer;
    transition: background 0.2s;
    }

    .hat-item:hover {
    background: #444;
    }

    .hat-icon {
    font-size: 1.5rem;
    }

    .hat-label {
    font-size: 1rem;
    color: #fff;
    }

    .bottoms-item {
    background: #333;
    padding: 45px 45px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 30px;
    cursor: pointer;
    transition: background 0.2s;
    }

    .bottoms-item:hover {
    background: #444;
    }

    .bottoms-icon {
    font-size: 1.5rem;
    }

    .bottoms-label {
    font-size: 1rem;
    color: #fff;
    }

    .top-item {
    background: #333;
    padding: 45px 45px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 30px;
    cursor: pointer;
    transition: background 0.2s;
    }

    .top-item:hover {
    background: #444;
    }

    .top-icon {
    font-size: 1.5rem;
    }

    .top-label {
    font-size: 1rem;
    color: #fff;
    }

    .back-button {
        padding: 1rem;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 10;
    }
    .back-link {
        color: #2d4a2d;
        text-decoration: none;
        font-weight: bold;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        background-color: rgba(255, 255, 255, 0.8);
        transition: background-color 0.2s;
    }
    .back-link:hover {
        background-color: rgba(255, 255, 255, 1);
    }

</style>