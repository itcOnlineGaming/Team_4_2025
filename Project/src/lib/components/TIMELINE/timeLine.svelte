<script lang="ts">
    import './TimeLine.css';
    import MajorItem from './MajorItem.svelte';
    import MajorItemModal from './MajorItemModal.svelte';
    import { majorTasks, createNewTask, getWeekStart, type MajorTask } from '../../stores/majorTasks';
    
    export let weekDates: Date[] = []; // Receives current week dates from parent
    
    let showModal = false;
    let currentWeekStart = '';
    
    // Calculate current week start when weekDates changes
    $: if (weekDates.length > 0) {
        currentWeekStart = getWeekStart(weekDates[0]);
    }
    
    // Filter tasks for current week only
    $: currentWeekTasks = $majorTasks.filter(task => task.weekStart === currentWeekStart);
    
    function openModal() {
        showModal = true;
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
        <button type="button" class="add-task-button" on:click={openModal} aria-label="Add new major task">
            +
        </button>
        <div class="day-separator"></div>
        <div class="day-separator"></div>
        <div class="day-separator"></div>
        <div class="day-separator"></div>
        <div class="day-separator"></div>
        <div class="day-separator"></div>
        <div class="day-separator"></div>
        
        <!-- Render all tasks for current week -->
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
