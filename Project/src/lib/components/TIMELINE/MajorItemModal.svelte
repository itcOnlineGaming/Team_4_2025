<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    export let showModal = false;
    
    const dispatch = createEventDispatcher();
    
    // Form state
    let title = '';
    let description = '';
    let selectedColor = '';
    let selectedDays = new Set<number>();
    let priority: 'high' | 'medium' | 'low' = 'medium';
    let showColorPicker = false;
    let customColor = '#ff0000';
    let errors: string[] = [];
    
    // Predefined colors with better palette
    const predefinedColors = [
        { name: 'Red', value: '#dc3545' },
        { name: 'Blue', value: '#007bff' },
        { name: 'Green', value: '#28a745' },
        { name: 'Yellow', value: '#ffc107' },
        { name: 'Orange', value: '#fd7e14' },
        { name: 'Purple', value: '#8c62cf' }, // Updated to match app theme
        { name: 'Pink', value: '#e83e8c' },
        { name: 'Teal', value: '#20c997' }
    ];
    
    const dayNames = [
        { short: 'Mon', full: 'Monday' },
        { short: 'Tue', full: 'Tuesday' },
        { short: 'Wed', full: 'Wednesday' },
        { short: 'Thu', full: 'Thursday' },
        { short: 'Fri', full: 'Friday' },
        { short: 'Sat', full: 'Saturday' },
        { short: 'Sun', full: 'Sunday' }
    ];
    
    // Get selected days summary
    $: selectedDaysSummary = getSelectedDaysSummary();
    
    function getSelectedDaysSummary(): string {
        if (selectedDays.size === 0) return '';
        if (selectedDays.size === 7) return 'All week';
        
        const sortedDays = Array.from(selectedDays).sort((a, b) => a - b);
        const dayLabels = sortedDays.map(d => dayNames[d - 1].short);
        
        if (sortedDays.length <= 2) {
            return dayLabels.join(' & ');
        }
        
        // Check if it's a continuous range
        let isContinuous = true;
        for (let i = 1; i < sortedDays.length; i++) {
            if (sortedDays[i] !== sortedDays[i - 1] + 1) {
                isContinuous = false;
                break;
            }
        }
        
        if (isContinuous) {
            return `${dayLabels[0]} - ${dayLabels[dayLabels.length - 1]}`;
        }
        
        return dayLabels.join(', ');
    }
    
    function validateForm(): boolean {
        errors = [];
        
        if (!title.trim()) {
            errors.push('Title is required');
        }
        
        if (!selectedColor) {
            errors.push('Please select a color');
        }
        
        if (selectedDays.size === 0) {
            errors.push('Please select at least one day');
        }
        
        return errors.length === 0;
    }
    
    function handleCreate() {
        if (validateForm()) {
            const sortedDays = Array.from(selectedDays).sort((a, b) => a - b);
            const taskData = {
                title: title.trim(),
                description: description.trim(),
                color: selectedColor,
                startDay: sortedDays[0],
                endDay: sortedDays[sortedDays.length - 1],
                selectedDays: sortedDays,
                priority
            };
            
            dispatch('create', taskData);
            resetForm();
            closeModal();
        }
    }
    
    function resetForm() {
        title = '';
        description = '';
        selectedColor = '';
        selectedDays = new Set();
        priority = 'medium';
        showColorPicker = false;
        errors = [];
    }
    
    function closeModal() {
        resetForm();
        showModal = false;
        dispatch('close');
    }
    
    function selectColor(color: string) {
        selectedColor = color;
        showColorPicker = false;
    }
    
    function selectCustomColor() {
        selectedColor = customColor;
        showColorPicker = false;
    }
    
    function toggleDay(dayIndex: number) {
        if (selectedDays.has(dayIndex)) {
            selectedDays.delete(dayIndex);
        } else {
            selectedDays.add(dayIndex);
        }
        selectedDays = selectedDays; // Trigger reactivity
    }
    
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }
    
    function handleOverlayClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if showModal}
    <div 
        class="modal-overlay" 
        on:click={handleOverlayClick}
        on:keydown={handleKeydown}
        role="button" 
        tabindex="0"
    >
        <div class="modal-content" role="dialog" aria-modal="true">
            <div class="modal-header">
                <div class="header-content">
                    <div class="icon-wrapper">
                        📌
                    </div>
                    <h2>Create Major Task</h2>
                </div>
                <button type="button" class="close-button" on:click={closeModal} aria-label="Close">
                    ×
                </button>
            </div>
            
            <div class="modal-body">
                {#if errors.length > 0}
                    <div class="error-messages">
                        <div class="error-icon">⚠️</div>
                        <div class="error-list">
                            {#each errors as error}
                                <div class="error-message">{error}</div>
                            {/each}
                        </div>
                    </div>
                {/if}
                
                <div class="form-group">
                    <label for="task-title">
                        <span class="label-text">Title</span>
                        <span class="label-required">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="task-title"
                        bind:value={title} 
                        placeholder="What's the task?"
                        class="form-input"
                        required
                    />
                </div>
                
                <div class="form-group">
                    <label for="task-description">
                        <span class="label-text">Description</span>
                        <span class="label-optional">(optional)</span>
                    </label>
                    <textarea 
                        id="task-description"
                        bind:value={description} 
                        placeholder="Add details about this task..."
                        class="form-textarea"
                        rows="3"
                    ></textarea>
                </div>
                
                <div class="form-group">
                    <label for="task-priority">
                        <span class="label-text">Priority</span>
                    </label>
                    <select
                        id="task-priority"
                        bind:value={priority}
                        class="form-select"
                    >
                        <option value="high">🔴 High</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="low">🟢 Low</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <fieldset>
                        <legend>
                            <span class="label-text">Color</span>
                            <span class="label-required">*</span>
                        </legend>
                        <div class="color-selection">
                        {#each predefinedColors as color}
                            <button
                                type="button"
                                class="color-box"
                                class:selected={selectedColor === color.value}
                                style="background-color: {color.value}"
                                on:click={() => selectColor(color.value)}
                                title={color.name}
                                aria-label={color.name}
                            >
                                {#if selectedColor === color.value}
                                    <span class="checkmark">✓</span>
                                {/if}
                            </button>
                        {/each}
                        
                        <button
                            type="button"
                            class="color-box custom-color-trigger"
                            class:selected={showColorPicker}
                            on:click={() => showColorPicker = !showColorPicker}
                            title="Custom color"
                            aria-label="Choose custom color"
                        >
                            <span class="custom-icon">🎨</span>
                        </button>
                    </div>
                    
                    {#if showColorPicker}
                        <div class="custom-color-picker">
                            <div class="color-picker-header">
                                <span class="picker-label">Pick your color:</span>
                            </div>
                            <div class="color-picker-controls">
                                <input 
                                    type="color" 
                                    bind:value={customColor}
                                    class="color-input"
                                    aria-label="Color picker"
                                />
                                <div class="color-preview" style="background-color: {customColor}"></div>
                                <button 
                                    type="button" 
                                    class="apply-color-btn"
                                    on:click={selectCustomColor}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    {/if}
                    </fieldset>
                </div>
                
                <div class="form-group">
                    <fieldset>
                        <legend>
                            <span class="label-text">Days</span>
                            <span class="label-required">*</span>
                        </legend>
                        {#if selectedDaysSummary}
                        <div class="days-summary">
                            <span class="summary-icon">📅</span>
                            <span class="summary-text">{selectedDaysSummary}</span>
                        </div>
                    {/if}
                    <div class="day-selection">
                        {#each dayNames as day, index}
                            <button
                                type="button"
                                class="day-button"
                                class:selected={selectedDays.has(index + 1)}
                                on:click={() => toggleDay(index + 1)}
                                title={day.full}
                            >
                                <span class="day-text">{day.short}</span>
                                {#if selectedDays.has(index + 1)}
                                    <span class="day-check">✓</span>
                                {/if}
                            </button>
                        {/each}
                    </div>
                    </fieldset>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="cancel-button" on:click={closeModal}>
                    Cancel
                </button>
                <button type="button" class="create-button" on:click={handleCreate}>
                    <span class="button-icon">✓</span>
                    <span>Create Task</span>
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    @import './MajorItemModal.css';
</style>