<script lang="ts">
    // Intro page for the calendar app
    // Adds a consent modal before navigating to the calendar.
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { base } from '$app/paths'

    let showConsent = false;
    let CalendarConsent : string | null = null;


    onMount(checkConsent);

    // Check stored consent on load — if not present, show modal automatically
    function checkConsent()
    {
        try 
        {
            CalendarConsent = localStorage.getItem('calendar_consent');
            
            if (CalendarConsent !== 'true') 
            {
                showConsent = true;
            }
        } 
        // If localStorage isn't available, still show consent modal
        catch (err) 
        {
            
            showConsent = true;
        }
    }

    function redirectCalendar() 
    {
        if (CalendarConsent === 'true') 
        {
            return;
        }

        showConsent = true;
    }

    function cancelConsent() 
    {
        showConsent = false;
    }

    function acceptConsent() {
        try 
        {
            localStorage.setItem('calendar_consent', 'true'); 
        } 
        catch 
        {
            console.warn('Could not store consent in localStorage');
        }
        showConsent = false;
        goto('/calendar');
    }
</script>

<svelte:head>
    <title>Task Calendar</title>
</svelte:head>

<main class="intro-container">
    <h1>Welcome to the Task Calendar</h1>

    <p>This small calendar app lets you create and manage hourly events for the current week.</p>

    <h2>Quick guide</h2>
    <ul>
        <li>Click anyhour slot to open the event modal.</li>
        <li>Enter a <strong>Title</strong> (required) and an optional description, then click <em>Create</em>.</li>
    </ul>

    <div class="intro-actions">
        <button type="button" class="primary-button" on:click={redirectCalendar}>Open Calendar</button>
    </div>
</main>

<style>
    @import './styles/landingPage.css';
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
