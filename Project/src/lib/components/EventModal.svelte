<script lang="ts">
    import { majorTasks } from '../stores/majorTasks';
    import { updateSubtask } from '../stores/subtasks';
    export let showModal: boolean = false;
    export let modalMode: 'create' | 'view' = 'create';
    export let targetDate: string = '';
    export let startTimeInput: string = '';
    export let endTimeInput: string = '';
    export let titleInput: string = '';
    export let descriptionInput: string = '';
    export let majorTaskIdInput: string = '';
    export let selectedEvent: any = null;
    export let priorityInput: 'high' | 'medium' | 'low' = 'medium';
    
    // Recurring event fields
    export let isRecurring: boolean = false;
    export let recurrencePattern: 'daily' | 'weekly' | 'monthly' = 'daily';
    export let recurrenceEndDate: string = '';

    export let onClose: () => void;
    export let onSave: () => void;
    export let onDelete: () => void;

    // When opening modal, initialize majorTaskIdInput
    let initializedMajorTaskId = false;
    $: if (showModal && modalMode === 'view' && selectedEvent && !initializedMajorTaskId) {
        majorTaskIdInput = selectedEvent.majorTaskId || '';
        initializedMajorTaskId = true;
    }
    $: if (!showModal) {
        initializedMajorTaskId = false;
    }
    $: if (showModal && modalMode === 'create' && $majorTasks.length > 0 && !majorTaskIdInput && !initializedMajorTaskId) {
        majorTaskIdInput = $majorTasks[0].id;
        initializedMajorTaskId = true;
    }

    // Override onSave to persist majorTaskIdInput
    function handleSave() {
        onSave();
    }

    function handleOverlayKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            onClose();
        }
    }

    function handleContentKeydown(event: KeyboardEvent) {
        event.stopPropagation();
    }

    // Format the date to be more readable
    function formatDate(dateStr: string): string {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch {
            return dateStr;
        }
    }

    // Calculate duration for display
    $: duration = calculateDuration(startTimeInput, endTimeInput);

    function calculateDuration(start: string, end: string): string {
        if (!start || !end) return '';
        
        const [startHour, startMin] = start.split(':').map(Number);
        const [endHour, endMin] = end.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const diff = endMinutes - startMinutes;
        
        if (diff <= 0) return 'Invalid duration';
        
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        
        if (hours === 0) return `${minutes}m`;
        if (minutes === 0) return `${hours}h`;
        return `${hours}h ${minutes}m`;
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
                        {#if modalMode === 'create'}
                            ➕
                        {:else}
                            📋
                        {/if}
                    </div>
                    <h2 id="modal-title">
                        {modalMode === 'create' ? 'Create New Subtask' : 'Subtask Details'}
                    </h2>
                </div>
                <button class="close-button" on:click={onClose} aria-label="Close modal">×</button>
            </div>

            <div class="modal-body">
                <div class="form-group">
                    <label for="date">
                        <span class="label-text">Date</span>
                        <span class="label-required">*</span>
                    </label>
                    <input
                        id="date"
                        type="date"
                        bind:value={targetDate}
                        min={new Date().toISOString().split('T')[0]}
                        class="modal-input date-input"
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="title">
                        <span class="label-text">Title</span>
                        <span class="label-required">*</span>
                    </label>
                    <input
                        id="title"
                        type="text"
                        bind:value={titleInput}
                        placeholder="What do you need to do?"
                        class="modal-input"
                        required
                    />
                </div>

                <div class="time-inputs">
                    <div class="form-group">
                        <label for="startTime">
                            <span class="label-text">Start Time</span>
                            <span class="label-required">*</span>
                        </label>
                        <input
                            id="startTime"
                            type="time"
                            bind:value={startTimeInput}
                            class="modal-input time-input"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="endTime">
                            <span class="label-text">End Time</span>
                            <span class="label-required">*</span>
                        </label>
                        <input
                            id="endTime"
                            type="time"
                            bind:value={endTimeInput}
                            class="modal-input time-input"
                            required
                        />
                    </div>
                </div>

                {#if duration}
                    <div class="duration-display">
                        <span class="duration-icon">⏱️</span>
                        <span class="duration-text">Duration: <strong>{duration}</strong></span>
                    </div>
                {/if}

                <div class="form-group">
                    <label for="priority">
                        <span class="label-text">Priority</span>
                    </label>
                    <select
                        id="priority"
                        bind:value={priorityInput}
                        class="modal-select"
                    >
                        <option value="high">🔴 High</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="low">🟢 Low</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="description">
                        <span class="label-text">Description</span>
                        <span class="label-optional">(optional)</span>
                    </label>
                    <textarea
                        id="description"
                        bind:value={descriptionInput}
                        placeholder="Add any additional details..."
                        class="modal-textarea"
                        rows="4"
                    ></textarea>
                </div>

                <div class="form-group">
                    <label for="majorTaskDropdown">
                        <span class="label-text">Link to Major Task</span>
                    </label>
                    <select id="majorTaskDropdown" class="modal-input" bind:value={majorTaskIdInput}>
                        {#each $majorTasks as task}
                            <option value={task.id}>{task.title}</option>
                        {/each}
                    </select>
                </div>

                <!-- Recurring Event Section -->
                <div class="form-group recurrence-section">
                    <label class="checkbox-label">
                        <input
                            type="checkbox"
                            bind:checked={isRecurring}
                            class="checkbox-input"
                        />
                        <span class="label-text">🔁 Repeat this task</span>
                    </label>
                    
                    {#if isRecurring}
                        <div class="recurrence-options">
                            <div class="form-group">
                                <label for="recurrencePattern">
                                    <span class="label-text">Repeat</span>
                                </label>
                                <select
                                    id="recurrencePattern"
                                    bind:value={recurrencePattern}
                                    class="modal-select"
                                >
                                    <option value="daily">📅 Daily</option>
                                    <option value="weekly">📆 Weekly</option>
                                    <option value="monthly">🗓️ Monthly</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="recurrenceEndDate">
                                    <span class="label-text">Until</span>
                                    <span class="label-required">*</span>
                                </label>
                                <input
                                    id="recurrenceEndDate"
                                    type="date"
                                    bind:value={recurrenceEndDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    class="modal-input date-input"
                                    required
                                />
                            </div>
                        </div>
                    {/if}
                </div>
            </div>

            <div class="modal-footer">
                {#if modalMode === 'view'}
                    <button class="delete-button" on:click={onDelete}>
                        <span class="button-icon">🗑️</span>
                        <span>Delete</span>
                    </button>
                {/if}
                <div class="action-buttons">
                    <button class="cancel-button" on:click={onClose}>
                        Cancel
                    </button>
                    <button class="save-button" on:click={handleSave}>
                        <span class="button-icon">
                            {modalMode === 'create' ? '✓' : '💾'}
                        </span>
                        <span>{modalMode === 'create' ? 'Create' : 'Update'}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    @import './subTaskModal.css';
</style>