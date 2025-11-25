<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    
    export let onComplete: () => void;
    
    let currentStep = 0;
    
    const steps = [
        {
            title: "Welcome to the Calendar",
            content: "This calendar helps you organize your week with major tasks and subtasks. Let's learn how to use it!",
            highlight: "calendar-grid"
        },
        {
            title: "Create Major Tasks",
            content: "Click the + button at the bottom left to create major tasks that span multiple days. These represent your big goals for the week.",
            highlight: "fab-container"
        },
        {
            title: "Add Subtasks",
            content: "Click on any time slot to create a subtask. You can assign it to a major task, set priority (high/medium/low), and add details.",
            highlight: "calendar-cell"
        },
        {
            title: "Drag & Drop",
            content: "You can drag subtasks to reschedule them to different times or days. Just click and drag!",
            highlight: "subtask-card"
        },
        {
            title: "Filter & Sort",
            content: "Use the sidebar to filter tasks by status (pending/completed/cancelled) or priority. You can also sort by date, status, or priority.",
            highlight: "sidebar"
        },
        {
            title: "Track Your Progress",
            content: "Mark tasks as completed by clicking the status badge. Your daily activity is tracked automatically!",
            highlight: "status-badge"
        }
    ];
    
    function nextStep() {
        if (currentStep < steps.length - 1) {
            currentStep++;
        } else {
            completeTutorial();
        }
    }
    
    function previousStep() {
        if (currentStep > 0) {
            currentStep--;
        }
    }
    
    function skipTutorial() {
        completeTutorial();
    }
    
    function completeTutorial() {
        // Mark tutorial as completed in localStorage
        try {
            localStorage.setItem('tutorial_completed', 'true');
        } catch (e) {
            console.warn('Could not save tutorial completion status');
        }
        onComplete();
    }
</script>

<div class="tutorial-overlay">
    <div class="tutorial-modal">
        <div class="tutorial-header">
            <div class="step-indicator">
                Step {currentStep + 1} of {steps.length}
            </div>
            <button class="skip-button" on:click={skipTutorial}>
                Skip Tutorial
            </button>
        </div>
        
        <div class="tutorial-content">
            <h2>{steps[currentStep].title}</h2>
            <p>{steps[currentStep].content}</p>
        </div>
        
        <div class="tutorial-progress">
            {#each steps as step, index}
                <div class="progress-dot" class:active={index === currentStep} class:completed={index < currentStep}></div>
            {/each}
        </div>
        
        <div class="tutorial-actions">
            {#if currentStep > 0}
                <button class="tutorial-button secondary" on:click={previousStep}>
                    Previous
                </button>
            {:else}
                <div></div>
            {/if}
            
            <button class="tutorial-button primary" on:click={nextStep}>
                {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
            </button>
        </div>
    </div>
</div>

<style>
    .tutorial-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        padding: 1rem;
    }

    .tutorial-modal {
        background: white;
        border-radius: 20px;
        padding: 2.5rem;
        max-width: 600px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .tutorial-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .step-indicator {
        background: linear-gradient(135deg, #d9cce7 0%, #c8b8dc 100%);
        color: #5B4B8A;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;
        font-family: Arial, Helvetica, sans-serif;
    }

    .skip-button {
        background: none;
        border: none;
        color: #999;
        font-size: 0.875rem;
        cursor: pointer;
        padding: 0.5rem 1rem;
        transition: color 0.2s;
        font-family: Arial, Helvetica, sans-serif;
    }

    .skip-button:hover {
        color: #666;
        text-decoration: underline;
    }

    .tutorial-content {
        margin-bottom: 2.5rem;
    }

    .tutorial-content h2 {
        color: #5B4B8A;
        font-size: 1.75rem;
        font-weight: 600;
        margin: 0 0 1rem 0;
        font-family: Arial, Helvetica, sans-serif;
    }

    .tutorial-content p {
        color: #666;
        font-size: 1.125rem;
        line-height: 1.7;
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
    }

    .tutorial-progress {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        margin-bottom: 2rem;
    }

    .progress-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #ddd;
        transition: all 0.3s ease;
    }

    .progress-dot.active {
        background: #7F6399;
        width: 30px;
        border-radius: 5px;
    }

    .progress-dot.completed {
        background: #6B8E23;
    }

    .tutorial-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .tutorial-button {
        padding: 0.875rem 2rem;
        border: none;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: Arial, Helvetica, sans-serif;
    }

    .tutorial-button.primary {
        background: linear-gradient(135deg, #7F6399 0%, #5B4B8A 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(95, 75, 139, 0.3);
    }

    .tutorial-button.primary:hover {
        background: linear-gradient(135deg, #8F73A9 0%, #6B5B9A 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(95, 75, 139, 0.4);
    }

    .tutorial-button.secondary {
        background: white;
        color: #7F6399;
        border: 2px solid #7F6399;
    }

    .tutorial-button.secondary:hover {
        background: #f8f4fc;
        transform: translateY(-2px);
    }

    @media (max-width: 640px) {
        .tutorial-modal {
            padding: 2rem 1.5rem;
        }

        .tutorial-content h2 {
            font-size: 1.5rem;
        }

        .tutorial-content p {
            font-size: 1rem;
        }

        .tutorial-actions {
            grid-template-columns: 1fr;
        }
    }
</style>
