<script lang="ts">
    import './MajorItem.css';
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
