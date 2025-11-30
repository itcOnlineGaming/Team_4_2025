<script lang="ts">
  import { onMount } from 'svelte';

  interface Task {
    id: string;
    name: string;
    description: string;
    winner?: boolean;
    priority?: 'high' | 'medium' | 'low';
  }

  let tasks: Task[] = [];

  onMount(() => {
    try {
      const stored = localStorage.getItem('tasks');
      tasks = stored ? JSON.parse(stored) : [];
    } catch (e) {
      tasks = [];
    }
  });
</script>

<svelte:head>
  <title>Task Battle</title>
</svelte:head>

<main>
  
</main>
