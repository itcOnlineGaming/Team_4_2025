<script lang="ts">
    import './TimeLine.css';
    import MajorItem from './MajorItem.svelte';
    import { majorTasks, getWeekStart } from '../../stores/majorTasks';

    export let weekDates: Date[] = [];

    let currentWeekStart = '';

    $: if (weekDates.length > 0) {
        currentWeekStart = getWeekStart(weekDates[0]);
    }

    $: currentWeekTasks = $majorTasks.filter(task => task.weekStart === currentWeekStart);
</script>

<div class="timeline-container">
    <div class="timeline-header">
        <div class="timeline-spacer"></div>
        <div class="day-separator"></div>
        <div class="day-separator"></div>
        <div class="day-separator"></div>
        <div class="day-separator"></div>
        <div class="day-separator"></div>
        <div class="day-separator"></div>
        <div class="day-separator"></div>

        {#each currentWeekTasks as task (task.id)}
            <MajorItem
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    color={task.color}
                    startDay={task.startDay}
                    endDay={task.endDay}
            />
        {/each}
    </div>
</div>