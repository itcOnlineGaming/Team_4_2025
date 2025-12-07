<script lang="ts">
    import ActivityHeatmap from '$lib/components/activity-heatmap/ActivityHeatmap.svelte';
    import type { Writable } from 'svelte/store';

    export let showModal: boolean = false;
    export let activityStore: Writable<any[]>;
    export let onClose: () => void;

    function handleOverlayKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            onClose();
        }
    }

    function handleContentKeydown(event: KeyboardEvent) {
        event.stopPropagation();
    }
</script>

{#if showModal}
    <div
            class="modal-overlay"
            on:click={onClose}
            on:keydown={handleOverlayKeydown}
            role="button"
            tabindex="-1"
    >
        <div
                class="modal-content"
                on:click|stopPropagation
                on:keydown={handleContentKeydown}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                tabindex="-1"
        >
            <div class="modal-header">
                <div class="header-content">
                    <div class="icon-wrapper">
                        📊
                    </div>
                    <h2 id="modal-title">
                        Activity Statistics
                    </h2>
                </div>
                <button class="close-button" on:click={onClose} aria-label="Close modal">×</button>
            </div>

            <div class="modal-body">
                <ActivityHeatmap {activityStore} />
            </div>

            <div class="modal-footer">
                <button class="close-footer-button" on:click={onClose}>
                    Close
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(78, 61, 103, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .modal-content {
        background: white;
        border-radius: 20px;
        width: 95%;
        max-width: 1200px;
        max-height: 90vh;
        overflow: auto;
        box-shadow: 0 20px 60px rgba(78, 61, 103, 0.4);
        animation: slideUp 0.3s ease-out;
        font-family: Arial, Helvetica, sans-serif;
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Modal Header */
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem 1.75rem;
        background: linear-gradient(135deg, #40c463 0%, #30a14e 100%);
        border-radius: 20px 20px 0 0;
        color: white;
    }

    .header-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .icon-wrapper {
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        width: 48px;
        height: 48px;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.375rem;
        font-weight: 600;
    }

    .close-button {
        background: rgba(255, 255, 255, 0.15);
        border: none;
        font-size: 2rem;
        color: white;
        cursor: pointer;
        padding: 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        transition: all 0.2s;
        font-weight: 300;
        line-height: 1;
    }

    .close-button:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: rotate(90deg);
    }

    /* Modal Body */
    .modal-body {
        padding: 1rem;
        min-height: 300px;
    }

    /* Modal Footer */
    .modal-footer {
        display: flex;
        justify-content: flex-end;
        padding: 1.5rem 1.75rem;
        border-top: 2px solid #f1f3f4;
        background: #fafafa;
        border-radius: 0 0 20px 20px;
    }

    .close-footer-button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 12px;
        font-size: 0.9375rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        background: white;
        color: #666;
        border: 2px solid #e0e0e0;
    }

    .close-footer-button:hover {
        background: #f8f9fa;
        border-color: #d0d0d0;
        transform: translateY(-1px);
    }

    /* Responsive */
    @media (max-width: 768px) {
        .modal-content {
            width: 98%;
            max-width: none;
            border-radius: 16px;
        }

        .modal-header {
            padding: 1.25rem;
            border-radius: 16px 16px 0 0;
        }

        .modal-header h2 {
            font-size: 1.125rem;
        }

        .icon-wrapper {
            width: 40px;
            height: 40px;
            font-size: 1.25rem;
        }

        .modal-body {
            padding: 0.5rem;
        }

        .modal-footer {
            padding: 1.25rem;
        }
    }
</style>