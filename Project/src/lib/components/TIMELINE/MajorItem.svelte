<script lang="ts">
    import { deleteTask } from '../../stores/majorTasks';
    
    export let id: string;
    export let title: string;
    export let description: string;
    export let color: string;
    export let startDay: number;
    export let endDay: number;
    
    let isHovered = false;
    let showDeleteConfirm = false;
    
    // Calculate grid column span (add 1 because grid starts at column 2, column 1 is timeline label)
    $: gridColumnStart = startDay + 1;
    $: gridColumnEnd = endDay + 2; // +2 because grid-column end is exclusive
    
    function handleMouseEnter() {
        isHovered = true;
    }
    
    function handleMouseLeave() {
        isHovered = false;
        showDeleteConfirm = false;
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
    class:hovered={isHovered}
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

<style>
    .major-task-bar {
        height: 30px;
        border-radius: 4px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 8px 12px;
        margin: 5px 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: height 0.3s ease, box-shadow 0.2s ease;
        overflow: hidden;
        cursor: pointer;
        position: relative;
    }
    
    .major-task-bar.hovered {
        height: auto;
        min-height: 60px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        align-items: flex-start;
    }
    
    .task-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .task-title {
        color: white;
        font-size: 0.875rem;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 1.2;
    }
    
    .task-description {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.75rem;
        font-weight: 400;
        line-height: 1.3;
        animation: fadeInDown 0.2s ease;
        word-wrap: break-word;
        white-space: normal;
    }
    
    .delete-button {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: background-color 0.2s ease;
        flex-shrink: 0;
        margin-left: 8px;
    }
    
    .delete-button:hover {
        background: rgba(255, 255, 255, 0.3);
    }
    
    .delete-confirmation {
        position: absolute;
        top: 8px;
        right: 12px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 4px;
        padding: 6px 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-items: center;
        animation: fadeIn 0.2s ease;
    }
    
    .confirm-text {
        color: white;
        font-size: 0.75rem;
        white-space: nowrap;
    }
    
    .confirm-buttons {
        display: flex;
        gap: 4px;
    }
    
    .confirm-btn {
        padding: 2px 6px;
        border: none;
        border-radius: 3px;
        font-size: 0.65rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }
    
    .cancel-btn {
        background: #6c757d;
        color: white;
    }
    
    .cancel-btn:hover {
        background: #5a6268;
    }
    
    .delete-btn {
        background: #dc3545;
        color: white;
    }
    
    .delete-btn:hover {
        background: #c82333;
    }
    
    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-5px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style>
