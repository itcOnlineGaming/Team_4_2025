<script lang="ts">
    import { theme } from '$lib/theme';
    import { onMount } from 'svelte';
    import {
        textContent,
        wordCount,
        currentPrompt,
        handleTextInput,
        handleSubmit,
        generateNewPrompt,
        initializeWritingScreen,
        getWordCountStatus,
        showResultPopup,
        resultMessage,
        handleSubmitWithPopup
    } from '$lib/writing-screen';
    import { goto } from '$app/navigation';

    let textValue = '';
    let currentWordCount = 0;
    let prompt = '';
    let wordCountStatus: 'normal' | 'warning' | 'limit' = 'normal';
    let showPopup = false;
    let popupMessage = '';

    // Subscribe to stores
    $: textValue = $textContent;
    $: currentWordCount = $wordCount;
    $: prompt = $currentPrompt;
    $: wordCountStatus = getWordCountStatus(currentWordCount);
    $: showPopup = $showResultPopup;
    $: popupMessage = $resultMessage;

    function onTextInput(event: Event) {
        const target = event.target as HTMLTextAreaElement;
        const limitedText = handleTextInput(target.value);
        if (target.value !== limitedText) {
            target.value = limitedText;
        }
    }

    async function onSubmit() {
        await handleSubmitWithPopup(textValue, currentWordCount);
    }

    function onNewPrompt() {
        generateNewPrompt();
    }

    function closePopup() {
        showResultPopup.set(false);
        goto('/leaderboard');
    }

    onMount(() => {
        initializeWritingScreen();
        document.documentElement.style.setProperty('--background', theme.background);
        document.documentElement.style.setProperty('--bubbleBackground', theme.bubbleBackground);
        document.documentElement.style.setProperty('--buttonPrimary', theme.buttonPrimary);
        document.documentElement.style.setProperty('--buttonHover', theme.buttonHover);
        document.documentElement.style.setProperty('--buttonText', theme.buttonText);
        document.documentElement.style.setProperty('--textPrimary', theme.textPrimary);
    });
</script>

<svelte:head>
    <title>Write Your Story</title>
</svelte:head>

<main>
    <div class="back-button">
        <a href="/" class="back-link">← Back to Home</a>
    </div>
    <div class="writing-container">
        <div class="header">
            <div class="theme-label">Today's Theme</div>
            <div class="theme-title">Theme</div>
        </div>
        <div class="prompt-section">
            <p class="prompt-text">{prompt}</p>
            <button class="new-prompt-btn" on:click={onNewPrompt}>New Prompt</button>
        </div>
        <div class="writing-area">
            <textarea
                value={textValue}
                on:input={onTextInput}
                placeholder="Start writing your story here..."
                class="story-input"
            ></textarea>
        </div>
        <div class="footer">
            <div class="word-counter">
                <span class="count" class:warning={wordCountStatus === 'warning'} class:limit={wordCountStatus === 'limit'}>
                    {currentWordCount}
                </span>
                <span class="max-count">/ 300 words</span>
            </div>
            <button class="submit-btn" on:click={onSubmit} disabled={!textValue.trim()}>
                Submit
            </button>
        </div>
    </div>

    {#if showPopup}
    <div class="popup-overlay">
        <div class="popup-container">
            <div class="popup-title">{popupMessage}</div>
            <button class="popup-close" on:click={closePopup}>Close</button>
        </div>
    </div>
    {/if}
</main>

<style>
    main {
        min-height: 100vh;
        background-color: #f0f8f0;
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
    /* --- WritingPage styles below --- */
    .writing-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 1rem;
        background-color: #f0f8f0;
        min-height: 100vh;
        font-family: Arial, sans-serif;
    }
    .header {
        background-color: #2d4a2d;
        color: white;
        padding: 1rem;
        border-radius: 8px 8px 0 0;
        text-align: center;
        margin-bottom: 0;
    }
    .theme-label {
        font-size: 0.9rem;
        opacity: 0.8;
        margin-bottom: 0.5rem;
    }
    .theme-title {
        font-size: 1.8rem;
        font-weight: bold;
        text-decoration: underline;
    }
    .prompt-section {
        background-color: #e8f5e8;
        padding: 1rem;
        border-left: 4px solid #4a7c59;
        margin-bottom: 1rem;
    }
    .prompt-text {
        font-style: italic;
        color: #2d4a2d;
        margin: 0 0 1rem 0;
        line-height: 1.4;
    }
    .new-prompt-btn {
        background-color: #4a7c59;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.2s;
    }
    .new-prompt-btn:hover {
        background-color: #3d6b4a;
    }
    .writing-area {
        background-color: white;
        border-radius: 0 0 8px 8px;
        padding: 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .story-input {
        width: 100%;
        height: 400px;
        border: none;
        padding: 1.5rem;
        font-size: 1rem;
        line-height: 1.6;
        resize: none;
        outline: none;
        font-family: Georgia, serif;
        background-color: white;
        border-radius: 0 0 8px 8px;
        box-sizing: border-box;
    }
    .story-input::placeholder {
        color: #999;
        font-style: italic;
    }
    .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background-color: #e8f5e8;
        border-radius: 0 0 8px 8px;
        margin-top: -8px;
    }
    .word-counter {
        font-size: 1rem;
        color: #2d4a2d;
    }
    .count {
        font-weight: bold;
        font-size: 1.1rem;
    }
    .count.warning {
        color: #d4a017;
    }
    .count.limit {
        color: #c41e3a;
    }
    .max-count {
        opacity: 0.7;
    }
    .submit-btn {
        background-color: #2d4a2d;
        color: white;
        border: none;
        padding: 0.8rem 2rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: bold;
        transition: background-color 0.2s;
    }
    .submit-btn:hover:not(:disabled) {
        background-color: #1f3a1f;
    }
    .submit-btn:disabled {
        background-color: #ccc;
        cursor: not-allowed;
        opacity: 0.6;
    }
    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .popup-container {
        background: #f0f0f0;
        border-radius: 16px;
        box-shadow: 0 4px 32px #0008;
        padding: 2rem 2.5rem;
        min-width: 260px;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
    }
    .popup-title {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 1rem;
        text-align: center;
    }
    .popup-close {
        background: #2196f3;
        color: #fff;
        border: none;
        border-radius: 6px;
        padding: 0.6rem 1.5rem;
        font-size: 1rem;
        cursor: pointer;
        font-weight: bold;
        transition: background 0.2s;
    }
    .popup-close:hover {
        background: #1769aa;
    }
</style>