<script lang="ts">
    import { theme } from '$lib/theme';
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    let showContainer = false;
    let activeSection = 0;
    const tabs = [
        {label: "Hats", icon: "🎩"},
        {label: "Body", icon: "👚"},
        {label: "Bottoms", icon: "👖"}
    ];
    // const subSections = [
    //     {label: "Hats 1", icon: "🎩"},
    //     {label: "Hats 2", icon: "🎩"},
    //     {label: "Hats 3", icon: "🎩"},
    //     {label: "Hats 4", icon: "🎩"},
    //     {label: "Hats 5", icon: "🎩"},
    //     {label: "Hats 6", icon: "🎩"}
    // ];

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
    
    <div class="flamingo-container">
        <div class="bubble">
            <span class="flamingo">🦩</span>
        </div>
    </div>
    
    <div class="buttons">
        <a href="/shop" class="button">
            <span class="icon">🛍️</span>
            Shop
        </a>
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
                        <div>Content for Hats</div>
                    {:else if activeSection === 1}
                        <div>Content for Body</div>
                    {:else if activeSection === 2}
                        <div>Content for Bottoms</div>
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

    .flamingo-container {
        margin-top: 3rem;
        margin-bottom: 2rem;
    }

    .equiptment-container {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100vw;
        height: 40vh;
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

</style>