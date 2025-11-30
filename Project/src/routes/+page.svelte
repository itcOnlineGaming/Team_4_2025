<script lang="ts">
    // Intro page for the calendar app
    // Adds a consent modal before navigating to the calendar.
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
    import QuickGuide from '$lib/components/QuickGuide.svelte';
    import Tutorial from '$lib/components/Tutorial.svelte';
    import './styles/landingPage.css';

    let showConsent = false;
    let showQuickGuide = false;
    let showTutorial = false;
    let CalendarConsent: string | null = null;

    onMount(checkConsent);

    function checkConsent() {
        try {
            CalendarConsent = localStorage.getItem('calendar_consent');
            if (CalendarConsent !== 'true') {
                showConsent = true;
            }
        } catch (err) {
            showConsent = true;
        }
    }

    function redirectCalendar() {
        // First check if consent is needed
        if (CalendarConsent !== 'true') {
            showConsent = true;
            return;
        }
        
        // Consent is given, now check tutorial status
        try {
            const tutorialCompleted = localStorage.getItem('tutorial_completed');
            if (tutorialCompleted === 'true') {
                // User has seen tutorial before, go straight to app
                goto(`${base}/calendar`);
            } else {
                // First time user, show quick guide
                showQuickGuide = true;
            }
        } catch {
            // If localStorage fails, show quick guide to be safe
            showQuickGuide = true;
        }
    }

    function cancelConsent() {
        showConsent = false;
    }

    function acceptConsent() {
        try {
            localStorage.setItem('calendar_consent', 'true');
        } catch {
            console.warn('Could not store consent in localStorage');
        }
        CalendarConsent = 'true';
        showConsent = false;
        
        // After accepting consent for the first time, always show quick guide
        // (since they just accepted consent, they're likely a new user)
        showQuickGuide = true;
    }
    
    function handleStartTutorial() {
        showQuickGuide = false;
        showTutorial = true;
    }
    
    function handleSkipToApp() {
        showQuickGuide = false;
        try {
            localStorage.setItem('tutorial_completed', 'true');
        } catch (e) {
            console.warn('Could not save tutorial skip status');
        }
        goto(`${base}/calendar`);
    }
    
    function handleTutorialComplete() {
        showTutorial = false;
        goto(`${base}/calendar`);
    }

</script>

<svelte:head>
    <title>Task Calendar</title>
</svelte:head>

<!-- IMPORTANT: use intro-container again, not class="html" -->
<main class="intro-container">
    <h1>Welcome to the Task Calendar</h1>

    <p>
        This calendar app was developed as part of a 4th-year joint project on
        <strong>self-regulated learning</strong>. It is designed to help users plan,
        organize, and reflect on their weekly activities by assigning tasks throughout
        the week and tracking progress over time. The goal is to support better time
        management, goal setting, and personal accountability.
    </p>

    <div class="intro-actions">
        <button type="button" class="primary-button" on:click={redirectCalendar}>
            Open Calendar
        </button>
    </div>
</main>

<style>
    /* Global page styles */
    :global(html, body) {
        height: 100%;
        margin: 0;
        padding: 0;
        background: linear-gradient(#d9cce7, #a987c6) fixed;
    }
</style>

{#if showConsent}
    <div
        class="modal-overlay"
        on:click={cancelConsent}
        role="button"
        tabindex="0"
        on:keydown={(e) =>
            (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') && cancelConsent()}
    >
        <div
            class="modal-content"
            on:click|stopPropagation
            role="dialog"
            aria-modal="true"
            tabindex="-1"
            on:keydown|stopPropagation={(e) => e.key === 'Escape' && cancelConsent()}
        >
            <div class="modal-header">
                <h2>Consent required</h2>
            </div>
            <div class="modal-body">
                <p>
                    Welcome! Before starting, please confirm that you are comfortable using this
                    app to organise and reflect on your weekly tasks and activities.
                </p>

                <p>Do you consent to continue?</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="cancel-button" on:click={cancelConsent}>No</button>
                <button type="button" class="save-button" on:click={acceptConsent}>I consent</button>
            </div>
        </div>
    </div>
{/if}

{#if showQuickGuide}
    <QuickGuide 
        onStartTutorial={handleStartTutorial}
        onSkipToApp={handleSkipToApp}
    />
{/if}

{#if showTutorial}
    <Tutorial 
        onComplete={handleTutorialComplete}
    />
{/if}
