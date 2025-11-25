<script lang="ts">
    // Sidebar internal state
    let expanded = false;

    function toggleSidebar() {
        expanded = !expanded;
    }
</script>

<aside class="month-sidebar" class:collapsed={!expanded}>
    <div class="sidebar-header">
        <button class="toggle-button" on:click={toggleSidebar} aria-label="Toggle sidebar">
            {#if expanded}◀︎{:else}▶︎{/if}
        </button>
        {#if expanded}
            <div class="sidebar-title">
                <h3>Sidebar</h3>
            </div>
        {/if}
    </div>

    {#if expanded}
        <div class="sidebar-content">
            <p>Sidebar content goes here...</p>
            <!-- You can add your custom sidebar content here -->
        </div>
    {/if}
</aside>

<style>
    .month-sidebar {
        width: 260px;
        transition: width 200ms ease, opacity 200ms ease;
        background: #fafafa;
        border-radius: 8px;
        padding: 0.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .month-sidebar.collapsed {
        width: 48px;
        overflow: hidden;
    }

    .sidebar-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .toggle-button {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: 1px solid #ddd;
        background: white;
        cursor: pointer;
    }

    .sidebar-title {
        flex: 1;
        text-align: center;
    }

    .sidebar-title h3 {
        margin: 0;
        font-weight: 600;
        color: #333;
    }

    .sidebar-content {
        padding: 1rem;
        color: #666;
    }

    @media (max-width: 900px) {
        .month-sidebar { display: none; }
    }
</style>
