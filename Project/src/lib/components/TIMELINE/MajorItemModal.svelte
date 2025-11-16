<script lang="ts">
    import './MajorItemModal.css';
    import { createEventDispatcher } from 'svelte';
    
    export let showModal = false;
    
    const dispatch = createEventDispatcher();
    
    // Form state
    let title = 'New Title';
    let description = '';
    let selectedColor = '';
    let selectedDays = new Set<number>();
    let showColorPicker = false;
    let customColor = '#ff0000';
    let errors: string[] = [];
    
    // Predefined colors
    const predefinedColors = [
        { name: 'Red', value: '#dc3545' },
        { name: 'Blue', value: '#007bff' },
        { name: 'Green', value: '#28a745' },
        { name: 'Yellow', value: '#ffc107' },
        { name: 'Orange', value: '#fd7e14' },
        { name: 'Purple', value: '#6f42c1' },
        { name: 'Pink', value: '#e83e8c' },
        { name: 'Teal', value: '#20c997' }
    ];
    
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
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
                selectedDays: sortedDays
            };
            
            dispatch('create', taskData);
            resetForm();
            closeModal();
        }
    }
    
    function resetForm() {
        title = 'New Title';
        description = '';
        selectedColor = '';
        selectedDays = new Set();
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
    <div class="modal-overlay" on:click={handleOverlayClick} role="button" tabindex="0">
        <div class="modal-content" role="dialog" aria-modal="true">
            <div class="modal-header">
                <h2>Create Major Task</h2>
                <button type="button" class="close-button" on:click={closeModal} aria-label="Close">
                    ×
                </button>
            </div>
            
            <div class="modal-body">
                {#if errors.length > 0}
                    <div class="error-messages">
                        {#each errors as error}
                            <div class="error-message">{error}</div>
                        {/each}
                    </div>
                {/if}
                
                <div class="form-group">
                    <label for="task-title">Title</label>
                    <input 
                        type="text" 
                        id="task-title"
                        bind:value={title} 
                        placeholder="Enter task title"
                        class="form-input"
                    />
                </div>
                
                <div class="form-group">
                    <label for="task-description">Description (Optional)</label>
                    <textarea 
                        id="task-description"
                        bind:value={description} 
                        placeholder="Enter task description"
                        class="form-textarea"
                        rows="3"
                    ></textarea>
                </div>
                
                <div class="form-group">
                    <label>Color</label>
                    <div class="color-selection">
                        {#each predefinedColors as color}
                            <button
                                type="button"
                                class="color-box"
                                class:selected={selectedColor === color.value}
                                style="background-color: {color.value}"
                                on:click={() => selectColor(color.value)}
                                title={color.name}
                            ></button>
                        {/each}
                        
                        <button
                            type="button"
                            class="color-box custom-color-trigger"
                            class:selected={showColorPicker}
                            on:click={() => showColorPicker = !showColorPicker}
                            title="Custom color"
                        >
                        </button>
                    </div>
                    
                    {#if showColorPicker}
                        <div class="custom-color-picker">
                            <input 
                                type="color" 
                                bind:value={customColor}
                                class="color-input"
                            />
                            <button 
                                type="button" 
                                class="apply-color-btn"
                                on:click={selectCustomColor}
                            >
                                Apply
                            </button>
                        </div>
                    {/if}
                </div>
                
                <div class="form-group">
                    <label>Days</label>
                    <div class="day-selection">
                        {#each dayNames as day, index}
                            <button
                                type="button"
                                class="day-button"
                                class:selected={selectedDays.has(index + 1)}
                                on:click={() => toggleDay(index + 1)}
                            >
                                {day}
                            </button>
                        {/each}
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="cancel-button" on:click={closeModal}>Cancel</button>
                <button type="button" class="create-button" on:click={handleCreate}>Create</button>
            </div>
        </div>
    </div>
{/if}
