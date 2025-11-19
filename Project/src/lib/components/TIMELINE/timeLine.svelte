<script lang="ts">
    import './TimeLine.css';
    import MajorItem from './MajorItem.svelte';
    import MajorItemModal from './MajorItemModal.svelte';
    import { majorTasks, createNewTask, getWeekStart, type MajorTask } from '../../stores/majorTasks';
    import { createEventDispatcher } from 'svelte';

    export let weekDates: Date[] = [];

    let showModal = false;
    let currentWeekStart = '';

    $: if (weekDates.length > 0) {
        currentWeekStart = getWeekStart(weekDates[0]);
    }

    $: currentWeekTasks = $majorTasks.filter(task => task.weekStart === currentWeekStart);

    const dispatch = createEventDispatcher();

    export function openCreateMajorTaskModal() {
        dispatch('openMajorTaskModal');
    }

    function handleCreateTask(event: CustomEvent) {
        if (currentWeekStart) {
            const taskData = event.detail;
            const newTask = createNewTask(
                currentWeekStart,
                taskData.title,
                taskData.description,
                taskData.color,
                taskData.startDay,
                taskData.endDay
            );
            majorTasks.update(tasks => [...tasks, newTask]);
        }
        showModal = false;
    }

    function handleCloseModal() {
        showModal = false;
    }
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

<MajorItemModal
        bind:showModal={showModal}
        on:create={handleCreateTask}
        on:close={handleCloseModal}
/>