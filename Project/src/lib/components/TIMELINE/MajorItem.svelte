<script lang="ts">
    export let title: string;
    export let color: string;
    export let startDay: number;
    export let endDay: number;
    
    // Calculate grid column span (add 1 because grid starts at column 2, column 1 is timeline label)
    $: gridColumnStart = startDay + 1;
    $: gridColumnEnd = endDay + 2; // +2 because grid-column end is exclusive
</script>

<div 
    class="major-task-bar" 
    style="background-color: {color}; grid-column: {gridColumnStart} / {gridColumnEnd};"
>
    <span class="task-title">{title}</span>
</div>

<style>
    .major-task-bar {
        height: 30px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        padding: 0 12px;
        margin: 5px 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .task-title {
        color: white;
        font-size: 0.875rem;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
