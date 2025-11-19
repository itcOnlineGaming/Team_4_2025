<script lang="ts">
    export let showModal: boolean = false;
    export let modalMode: 'create' | 'view' = 'create';
    export let targetDate: string = '';
    export let startTimeInput: string = '';
    export let endTimeInput: string = '';
    export let titleInput: string = '';
    export let descriptionInput: string = '';

    export let onClose: () => void;
    export let onSave: () => void;
    export let onDelete: () => void;

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
                <h2 id="modal-title">{modalMode === 'create' ? 'Create Subtask' : 'Subtask Details'}</h2>
                <button class="close-button" on:click={onClose}>×</button>
            </div>

            <div class="modal-body">
                <div class="modal-info">
                    <strong>Date:</strong> {targetDate}
                </div>

                <div class="form-group">
                    <label for="title">Title</label>
                    <input
                            id="title"
                            type="text"
                            bind:value={titleInput}
                            placeholder="Enter subtask title"
                            class="modal-input"
                    />
                </div>

                <div class="time-inputs">
                    <div class="form-group">
                        <label for="startTime">Start Time</label>
                        <input
                                id="startTime"
                                type="time"
                                bind:value={startTimeInput}
                                class="modal-input"
                        />
                    </div>

                    <div class="form-group">
                        <label for="endTime">End Time</label>
                        <input
                                id="endTime"
                                type="time"
                                bind:value={endTimeInput}
                                class="modal-input"
                        />
                    </div>
                </div>

                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea
                            id="description"
                            bind:value={descriptionInput}
                            placeholder="Enter subtask description (optional)"
                            class="modal-textarea"
                            rows="4"
                    ></textarea>
                </div>
            </div>

            <div class="modal-footer">
                {#if modalMode === 'view'}
                    <button class="delete-button" on:click={onDelete}>
                        Delete
                    </button>
                {/if}
                <button class="cancel-button" on:click={onClose}>
                    Cancel
                </button>
                <button class="save-button" on:click={onSave}>
                    {modalMode === 'create' ? 'Create' : 'Update'}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    @import './modal.css';

    .time-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
</style>