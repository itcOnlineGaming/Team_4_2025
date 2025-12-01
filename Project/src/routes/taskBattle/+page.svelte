<script lang="ts">
  import { TaskBattleTournament, type Task } from 'task-battle/src/lib/';

  let taskList: Task[] = [];

  function handleTournamentComplete(winner: Task) {
    console.log('Tournament completed! Winner:', winner);
    // Here you could save results, navigate, etc.
  }

  function handleGoBack() {
    console.log('Going back...');
    history.back();
  }

  function loadTasks() {
    // Load or define your tasks here
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        taskList = JSON.parse(storedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      taskList = [];
    }
  }
  loadTasks();
</script>

<svelte:head>
  <title>Task Battle</title>
</svelte:head>

<main>
  <TaskBattleTournament tasks={taskList}
  onTournamentComplete={(winner) => {
    console.log('Tournament winner:', winner);
    // Handle the result - save to database, navigate, etc.
  }}
  onGoBack={() => {
    // Handle back navigation
    history.back(); // or your custom navigation
  }}/>
</main>
