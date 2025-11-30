<script lang="ts">
    import { onMount } from 'svelte';
    import { theme } from '../../lib/theme';
    import Calendar from '$lib/components/Calendar.svelte';
    import FeedBackButton from '$lib/components/FeedBackButton.svelte';

    onMount(() => {
        // Set theme variables used by calendar styles
        document.documentElement.style.setProperty('--background', theme.background);
        document.documentElement.style.setProperty('--bubbleBackground', theme.bubbleBackground);
        document.documentElement.style.setProperty('--buttonPrimary', theme.buttonPrimary);
        document.documentElement.style.setProperty('--buttonHover', theme.buttonHover);
        document.documentElement.style.setProperty('--buttonText', theme.buttonText);
        document.documentElement.style.setProperty('--textPrimary', theme.textPrimary);
    });

    function handleTaskBattle() {
        // Read subtasks from localStorage
        let subtasks = [];
        try {
            const stored = localStorage.getItem('calendar_subtasks');
            subtasks = stored ? JSON.parse(stored) : [];
        } catch (e) {
            subtasks = [];
        }

        // Format subtasks to Task interface
        const formattedTasks = subtasks.map((subtask: any) => ({
            id: String(subtask.id),
            name: subtask.title ?? `Subtask #${subtask.id}`,
            description: subtask.description ?? "",
            priority: subtask.priority ?? "medium"
        }));

        // Save formatted tasks to localStorage
        try {
            localStorage.setItem('tasks', JSON.stringify(formattedTasks));
        } catch (e) {
            console.warn('Failed to save formatted tasks:', e);
        }

        // Redirect to /taskBattle
        window.location.href = "/Team_4/taskBattle";
    }
</script>

<main>
    <div class="calendar-wrapper">
        <Calendar />
    </div>
    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 1rem; margin-top: 1.5rem;">
        <FeedBackButton formUrl="https://docs.google.com/forms/d/e/1FAIpQLSdZ-SvMCCUtNef0xh4V4pEj-rCvK7VwQjV50e05OuxgLJeNHQ/viewform?usp=dialog" />
    </div>

    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2rem; margin-top: 1.5rem;">
        <button class="feedback-button" on:click={handleTaskBattle}>
            Sort Tasks by Priority
        </button>
    </div>
</main>

<style>
    .calendar-wrapper { padding: 1rem; }
    .feedback-button {
        position: fixed;
        bottom: 5rem;
        right: 1.5rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 600;
        border: none;
        border-radius: 9999px;
        padding: 0.8rem 1.4rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        cursor: pointer;
        transition: background 0.25s ease, transform 0.2s ease;
        z-index: 1000;
    }

    .feedback-button:hover {
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        transform: translateY(-2px);
    }

    .feedback-button:active {
        transform: translateY(0);
    }
</style>
