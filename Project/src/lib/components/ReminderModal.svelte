<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { snoozeReminder } from '../eventNotifications';
    import type { Subtask } from '../stores/subtasks';

    let showModal = false;
    let currentEvent: Subtask | null = null;
    let minutesUntil = 0;

    function handleShowReminder(event: CustomEvent) {
        currentEvent = event.detail.event;
        minutesUntil = event.detail.minutesUntil;
        showModal = true;
    }

    function handleClose() {
        showModal = false;
        currentEvent = null;
    }

    function handleSnooze(minutes: number) {
        if (currentEvent) {
            snoozeReminder(currentEvent, minutes);
            handleClose();
        }
    }

    onMount(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('showReminderModal', handleShowReminder as EventListener);
        }
    });

    onDestroy(() => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('showReminderModal', handleShowReminder as EventListener);
        }
    });
</script>

{#if showModal && currentEvent}
    <div class="reminder-overlay" role="button" tabindex="-1" on:keydown={(e) => e.key === 'Escape' && handleClose()}>
        <div class="reminder-modal" on:click|stopPropagation role="dialog" aria-modal="true" tabindex="0">
            <h2 class="reminder-title">
                <span class="reminder-icon">⏰</span>
                Upcoming Event
            </h2>
            <p class="reminder-event-title">{currentEvent.title}</p>
            <p class="reminder-time">Starts in <strong>{minutesUntil} minutes</strong></p>
            <p class="reminder-details">{currentEvent.date} at {currentEvent.startTime}</p>
            
            <div class="reminder-actions">
                <button class="snooze-btn" on:click={() => handleSnooze(15)}>
                    <span class="btn-icon">🔔</span>
                    <span>Snooze 15 min</span>
                </button>
                <button class="snooze-btn" on:click={() => handleSnooze(30)}>
                    <span class="btn-icon">🔔</span>
                    <span>Snooze 30 min</span>
                </button>
                <button class="dismiss-btn" on:click={handleClose}>
                    <span class="btn-icon">✓</span>
                    <span>Dismiss</span>
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .reminder-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: transparent;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        z-index: 9999;
        pointer-events: none;
        padding: 1.5rem;
    }

    .reminder-modal {
        background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
        border-radius: 16px;
        padding: 1.5rem;
        max-width: 380px;
        width: 100%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        text-align: left;
        animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        border: 2px solid #f59e0b;
        pointer-events: auto;
    }

    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(400px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .reminder-icon {
        font-size: 2rem;
        display: inline-block;
        margin-right: 0.5rem;
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }

    .reminder-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 0.75rem 0;
        display: flex;
        align-items: center;
    }

    .reminder-event-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: #4f46e5;
        margin: 0 0 0.5rem 0;
    }

    .reminder-time {
        font-size: 1rem;
        color: rgb(220, 38, 38);
        margin: 0 0 0.25rem 0;
    }

    .reminder-time strong {
        font-weight: 700;
    }

    .reminder-details {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0 0 1rem 0;
    }

    .reminder-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .reminder-actions button {
        padding: 0.625rem 1rem;
        border: none;
        border-radius: 10px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.375rem;
        flex: 1;
        min-width: 100px;
        justify-content: center;
    }

    .btn-icon {
        font-size: 1rem;
    }

    .snooze-btn {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    .snooze-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
    }

    .dismiss-btn {
        background: linear-gradient(135deg, #a987c6 0%, #8c62cf 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(140, 98, 207, 0.3);
        flex: 2;
    }

    .dismiss-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(140, 98, 207, 0.4);
    }

    @media (max-width: 600px) {
        .reminder-overlay {
            padding: 1rem;
        }

        .reminder-modal {
            padding: 1.25rem;
            max-width: 100%;
        }

        .reminder-actions button {
            padding: 0.5rem 0.75rem;
            font-size: 0.8125rem;
            min-width: 90px;
        }
    }
</style>
