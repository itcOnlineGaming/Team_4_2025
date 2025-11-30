<script lang="ts">
    import './MajorItem.css';
    import { deleteTask } from '../../stores/majorTasks';
    import { hoveredMajorTaskId, hoveredSubtaskId } from '../../stores/hoverHighlight';
    import { get } from 'svelte/store';
    import { onDestroy } from 'svelte';

    export let id: string;
    export let title: string;
    export let description: string;
    export let color: string;
    export let startDay: number;
    export let endDay: number;

    let isHovered = false;
    let showDeleteConfirm = false;

    // Highlight if this major task is related to hovered subtask
    let isHighlighted = false;
    let isDimmed = false;
    const unsubMajor = hoveredMajorTaskId.subscribe((hoveredId) => {
        isHighlighted = hoveredId === id;
        updateDimmed();
    });
    const unsubSub = hoveredSubtaskId.subscribe(() => {
        updateDimmed();
    });
    function updateDimmed() {
        const hoveredMajorId = get(hoveredMajorTaskId);
        const hoveredSubId = get(hoveredSubtaskId);
        if (hoveredMajorId !== null || hoveredSubId !== null) {
            isDimmed = !isHighlighted;
        } else {
            isDimmed = false;
        }
    }
    onDestroy(() => {
        unsubMajor();
        unsubSub();
    });

    // Calculate grid column span (add 1 because grid starts at column 2, column 1 is timeline label)
    $: gridColumnStart = startDay + 1;
    $: gridColumnEnd = endDay + 2; // +2 because grid-column end is exclusive

    function handleMouseEnter() {
        isHovered = true;
        hoveredMajorTaskId.set(id); // Highlight all subtasks linked to this major task
    }

    function handleMouseLeave() {
        isHovered = false;
        showDeleteConfirm = false;
        hoveredMajorTaskId.set(null); // Remove highlight from subtasks
    }

    function handleDeleteClick(event: MouseEvent) {
        event.stopPropagation();
        showDeleteConfirm = true;
    }

    function confirmDelete(event: MouseEvent) {
        event.stopPropagation();
        deleteTask(id);
        showDeleteConfirm = false;
    }

    function cancelDelete(event: MouseEvent) {
        event.stopPropagation();
        showDeleteConfirm = false;
    }
</script>

<div 
    class="major-task-bar"
    id={"major-task-" + id}
    class:hovered={isHovered}
    class:highlighted={isHighlighted}
    class:dimmed={isDimmed}
    style="background-color: {color}; grid-column: {gridColumnStart} / {gridColumnEnd};"
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    role="button"
    tabindex="0"
>
    <div class="task-content">
        <span class="task-title">{title}</span>
        {#if isHovered}
            <div class="task-description">{description}</div>
        {/if}
    </div>
    
    {#if isHovered && !showDeleteConfirm}
        <button 
            type="button" 
            class="delete-button"
            on:click={handleDeleteClick}
            aria-label="Delete task"
        >
            ×
        </button>
    {/if}
    
    {#if showDeleteConfirm}
        <div class="delete-confirmation">
            <span class="confirm-text">Delete task?</span>
            <div class="confirm-buttons">
                <button 
                    type="button" 
                    class="confirm-btn cancel-btn"
                    on:click={cancelDelete}
                >
                    Cancel
                </button>
                <button 
                    type="button" 
                    class="confirm-btn delete-btn"
                    on:click={confirmDelete}
                >
                    Delete
                </button>
            </div>
        </div>
    {/if}
</div>
