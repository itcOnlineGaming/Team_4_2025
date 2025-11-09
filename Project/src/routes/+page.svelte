<script lang="ts">
    // Intro page for the calendar app
    // Adds a consent modal before navigating to the calendar.
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    let showConsent = false;

    // Check stored consent on load — if not present, show modal automatically
    onMount(() => {
        try {
            const stored = localStorage.getItem('calendar_consent');
            if (stored !== 'true') {
                showConsent = true;
            }
        } catch (err) {
            // If localStorage isn't available, still show consent modal
            showConsent = true;
        }
    });

    function openConsent() {
        // If already consented, go straight to calendar
        try {
            const stored = localStorage.getItem('calendar_consent');
            if (stored === 'true') {
                goto('/calendar');
                return;
            }
        } catch {}
        showConsent = true;
    }

    function cancelConsent() {
        showConsent = false;
    }

    function acceptConsent() {
        try { localStorage.setItem('calendar_consent', 'true'); } catch {}
        showConsent = false;
        goto('/calendar');
    }
</script>

<main class="intro-container">
    <h1>Welcome to the Task Calendar</h1>

    <p>This small calendar app lets you create and manage hourly events for the current week.</p>

    <h2>Quick guide</h2>
    <ul>
        <li>Click anyhour slot to open the event modal.</li>
        <li>Enter a <strong>Title</strong> (required) and an optional description, then click <em>Create</em>.</li>
    </ul>

    <div class="intro-actions">
        <button type="button" class="primary-button" on:click={openConsent}>Open Calendar</button>
    </div>
</main>

<style>
    .intro-container {
        max-width: 800px;
        margin: 3rem auto;
        padding: 1.5rem;
       font-family: Arial, Helvetica, sans-serif;
    }
    .intro-actions { display: flex; gap: 1rem; margin-top: 1rem; }
    .primary-button {
        display: inline-block;
        padding: 0.75rem 1.25rem;
        border-radius: 6px;
        text-decoration: none;
        color: white;
        
    }
    .primary-button { background: #1976d2; }
    /* Modal styles copied from shared component stylesheet so consent displays as a modal */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        font-family: Arial, Helvetica, sans-serif;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h2 { margin: 0; font-size: 1.25rem; }

    .modal-body { padding: 1.5rem; }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1.5rem;
        border-top: 1px solid #e0e0e0;
    }

    .cancel-button {
        padding: 0.625rem 1.25rem;
        border: 1px solid #dadce0;
        border-radius: 4px;
        background: transparent;
        color: #1976d2;
        cursor: pointer;
    }

    .save-button {
        padding: 0.625rem 1.25rem;
        border-radius: 4px;
        background-color: #1976d2;
        color: white;
        border: none;
        cursor: pointer;
    }
</style>

{#if showConsent}
    <div class="modal-overlay" on:click={cancelConsent} role="button" tabindex="0" on:keydown={(e) => (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') && cancelConsent()}>
        <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true" tabindex="-1" on:keydown|stopPropagation={(e) => e.key === 'Escape' && cancelConsent()}>
            <div class="modal-header">
                <h2>Consent required</h2>
            </div>
            <div class="modal-body">
                <p>By using this calendar you agree that events will be stored locally in your browser (localStorage). No data will be sent to a server.</p>
                <p>Do you consent to local storage of your events?</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="cancel-button" on:click={cancelConsent}>No</button>
                <button type="button" class="save-button" on:click={acceptConsent}>I consent</button>
            </div>
        </div>
    </div>
{/if}
