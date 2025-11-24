<script lang="ts">
    import ExternalSidebar from '../../lib/components/ExternalSidebar.svelte';
    
    let sidebarVisible = true;
    
    // Sample task data
    let tasks = [
        { id: 1, title: 'Setup External Sidebar', status: 'completed', priority: 'high', date: '2025-11-24' },
        { id: 2, title: 'Test Filtering Features', status: 'in-progress', priority: 'medium', date: '2025-11-24' },
        { id: 3, title: 'Add Task Management UI', status: 'pending', priority: 'high', date: '2025-11-25' },
        { id: 4, title: 'Write Documentation', status: 'pending', priority: 'low', date: '2025-11-26' },
        { id: 5, title: 'Code Review', status: 'pending', priority: 'medium', date: '2025-11-27' },
    ];
</script>

<svelte:head>
    <title>External Sidebar Demo</title>
</svelte:head>

<div class="demo-container">
    <header>
        <h1>🎯 External Sidebar Integration Demo</h1>
        <button 
            class="toggle-btn"
            on:click={() => sidebarVisible = !sidebarVisible}
        >
            {sidebarVisible ? '👈 Hide' : '👉 Show'} Sidebar
        </button>
    </header>

    <main class="demo-main" class:with-sidebar={sidebarVisible}>
        <ExternalSidebar 
            bind:visible={sidebarVisible}
            title="Calendar & Tasks"
            items={tasks}
        >
            <div slot="calendar">
                <!-- Demo calendar placeholder -->
                <div style="padding: 1rem; text-align: center; background: #f9f9f9; border-radius: 8px;">
                    <p>� Calendar Demo</p>
                    <p style="font-size: 0.8rem; color: #666;">Calendar would appear here</p>
                </div>
            </div>
            
            <div slot="content">
                <div class="stats">
                    <h5>📊 Quick Stats</h5>
                    <p>Total Tasks: {tasks.length}</p>
                    <p>Completed: {tasks.filter(t => t.status === 'completed').length}</p>
                    <p>In Progress: {tasks.filter(t => t.status === 'in-progress').length}</p>
                    <p>Pending: {tasks.filter(t => t.status === 'pending').length}</p>
                </div>
            </div>
        </ExternalSidebar>

        <div class="content-area">
            <h2>Main Content Area</h2>
            <p>This demonstrates how the external sidebar integrates with your main application content.</p>
            
            <div class="task-grid">
                <h3>All Tasks</h3>
                {#each tasks as task}
                    <div class="task-card" class:completed={task.status === 'completed'}>
                        <h4>{task.title}</h4>
                        <div class="task-meta">
                            <span class="status status-{task.status}">{task.status}</span>
                            <span class="priority priority-{task.priority}">{task.priority}</span>
                            <span class="date">{task.date}</span>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </main>
</div>

<style>
    .demo-container {
        min-height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    header {
        background: #2563eb;
        color: white;
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    header h1 {
        margin: 0;
        font-size: 1.5rem;
    }

    .toggle-btn {
        background: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .toggle-btn:hover {
        background: rgba(255,255,255,0.3);
    }

    .demo-main {
        display: flex;
        min-height: calc(100vh - 80px);
        transition: margin-left 0.3s ease;
    }

    .demo-main.with-sidebar {
        margin-left: 320px;
    }

    .content-area {
        flex: 1;
        padding: 2rem;
        background: #f8fafc;
    }

    .content-area h2 {
        margin-top: 0;
        color: #1e293b;
    }

    .task-grid {
        margin-top: 2rem;
    }

    .task-card {
        background: white;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        border-left: 4px solid #e2e8f0;
    }

    .task-card.completed {
        border-left-color: #22c55e;
        opacity: 0.8;
    }

    .task-card h4 {
        margin: 0 0 0.5rem 0;
        color: #1e293b;
    }

    .task-meta {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .status, .priority, .date {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;
    }

    .status-completed { background: #dcfce7; color: #166534; }
    .status-in-progress { background: #fef3c7; color: #92400e; }
    .status-pending { background: #fee2e2; color: #991b1b; }

    .priority-high { background: #fecaca; color: #991b1b; }
    .priority-medium { background: #fed7aa; color: #9a3412; }
    .priority-low { background: #e0e7ff; color: #4338ca; }

    .date {
        background: #f1f5f9;
        color: #475569;
    }

    .action-btn {
        display: block;
        width: 100%;
        padding: 0.75rem;
        margin: 0.5rem 0;
        border: 1px solid #e2e8f0;
        background: #f8fafc;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        text-align: left;
    }

    .action-btn:hover {
        background: #e2e8f0;
    }

    .stats {
        margin-top: 1rem;
        padding: 1rem;
        background: #f1f5f9;
        border-radius: 6px;
    }

    .stats h5 {
        margin: 0 0 0.5rem 0;
        color: #334155;
    }

    .stats p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
        color: #64748b;
    }
</style>
