<script lang="ts">
    // Import the local copy of the external sidebar component
    import SrlSidebar from './external-sidebar/SrlSidebar.svelte';
    import type { FilterGroup, SortOption } from './external-sidebar/types';
    import { createEventDispatcher } from 'svelte';
    
    // Props for controlling the sidebar
    export let visible: boolean = true;
    export let title: string = "Task Filters";
    export let items: any[] = [];
    export let filterGroups: FilterGroup[] = [];
    export let sortOptions: SortOption[] = [];
    
    // Track collapsed state
    let collapsed = false;
    const dispatch = createEventDispatcher();
    
    function handleToggle(event: CustomEvent<{ collapsed: boolean }>) {
        collapsed = event.detail.collapsed;
        dispatch('toggle', { collapsed });
    }
    
    // State for filtering and sorting
    let selectedFilters: Record<string, string[]> = {};
    let selectedSortId: string | null = null;
    let filteredItems: any[] = [];
    
    // Example filter groups and sort options for tasks
    $: if (!filterGroups.length) {
        filterGroups = [
            {
                id: 'status',
                label: 'Status',
                options: [
                    { value: 'pending', label: 'Pending' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' }
                ]
            },
            {
                id: 'priority',
                label: 'Priority',
                options: [
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' }
                ]
            }
        ];
    }
    
    $: if (!sortOptions.length) {
        sortOptions = [
            { id: 'date', label: 'Date' },
            { id: 'priority', label: 'Priority' },
            { id: 'status', label: 'Status' }
        ];
    }
</script>

{#if visible}
    <div class="external-sidebar-wrapper" class:collapsed>
        <!-- External Sidebar Component with everything inside -->
        <SrlSidebar 
            {title}
            {items}
            {filterGroups}
            {sortOptions}
            bind:selectedFilters
            bind:selectedSortId
            bind:filteredItems
            on:toggle={handleToggle}
        >
            <!-- Custom Calendar and Tasks sections that show as icons when collapsed -->
            <div class="custom-sections">
                <!-- Calendar Section -->
                <div class="custom-section calendar-section">
                    <div class="section-header">
                        <!-- Icon only visible when collapsed -->
                        <div class="collapsed-icon calendar-icon" title="Calendar">
                            📅
                        </div>
                        <!-- Title only visible when expanded -->
                        <h3 class="section-title">Calendar</h3>
                    </div>
                    <div class="section-content">
                        <slot name="calendar">
                            <!-- Calendar content will go here -->
                        </slot>
                    </div>
                </div>

                <!-- Tasks Section -->
                <div class="custom-section tasks-section">
                    <div class="section-header">
                        <!-- Icon only visible when collapsed -->
                        <div class="collapsed-icon tasks-icon" title="Tasks">
                            📋
                        </div>
                        <!-- Title only visible when expanded -->
                        <h3 class="section-title">Tasks</h3>
                    </div>
                    <div class="section-content">
                        <slot name="tasks">
                            <!-- Task actions will go here -->
                        </slot>
                    </div>
                </div>

                <!-- Filtered Results Section -->
                <div class="custom-section results-section">
                    <div class="section-header">
                        <!-- Icon only visible when collapsed -->
                        <div class="collapsed-icon results-icon" title="Results">
                            📊
                        </div>
                        <!-- Title only visible when expanded -->
                        <h3 class="section-title">Results</h3>
                    </div>
                    <div class="section-content">
                        <slot name="content">
                            <div class="default-content">
                                <p>Items: {filteredItems.length}</p>
                                {#if filteredItems.length > 0}
                                    <ul>
                                        {#each filteredItems.slice(0, 5) as item}
                                            <li>{item.title || item.name || JSON.stringify(item)}</li>
                                        {/each}
                                    </ul>
                                {:else}
                                    <p>No items match the current filters.</p>
                                {/if}
                            </div>
                        </slot>
                    </div>
                </div>
            </div>
        </SrlSidebar>
    </div>
{/if}

<style>
    .external-sidebar-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        width: 320px;
        height: 100vh;
        background: transparent;
        z-index: 1000;
        overflow: hidden;
        transition: width 220ms ease;
    }
    
    .external-sidebar-wrapper.collapsed {
        width: 64px;
        overflow: hidden;
    }
    

    
    /* Calendar section styling */
    .section-content :global(.month-calendar) {
        width: 100%;
        box-shadow: none;
        border: 1px solid #d5c3e9;
        background: #fafafa;
        margin: 0;
    }
    
    /* Style the calendar navigation buttons to match sidebar theme */
    .section-content :global(.month-calendar .nav) {
        background: #f4eaff !important;
        border-color: #d5c3e9 !important;
        color: #4e3d67 !important;
    }
    
    .section-content :global(.month-calendar .nav:hover) {
        background: #eadbf9 !important;
    }
    
    /* Style action buttons in tasks section */
    .section-content :global(.action-btn) {
        display: block;
        width: 100%;
        margin: 0.25rem 0;
        padding: 0.6rem;
        border: 1px solid #d5c3e9;
        background: #f4eaff;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.75rem;
        color: #4e3d67;
        font-weight: 500;
        transition: background 160ms ease, transform 160ms ease;
    }

    .section-content :global(.action-btn:hover) {
        background: #eadbf9;
        transform: translateY(-1px);
    }

    /* Custom sections styling */
    .custom-sections {
        padding: 0;
    }

    .custom-section {
        margin-bottom: 1rem;
    }

    .section-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
    }

    /* When expanded, header should only show title aligned to the left */
    .section-header {
        justify-content: flex-start;
    }

    .section-title {
        color: #4e3d67;
        font-size: 0.9rem;
        margin: 0;
        font-weight: 600;
        display: block; /* Show by default (expanded state) */
    }

    .collapsed-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: #f4eaff;
        border: 1px solid #d5c3e9;
        display: none; /* Hide by default (expanded state) */
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
        color: #4e3d67;
        cursor: pointer;
        transition: transform 160ms ease, background 160ms ease;
        flex-shrink: 0;
    }

    .collapsed-icon:hover {
        background: #eadbf9;
        transform: translateY(-2px);
    }

    .section-content {
        padding-left: 0;
    }

    /* When sidebar is collapsed, show only icons and hide titles/content */
    :global(.month-sidebar.collapsed) .section-title {
        display: none;
    }

    :global(.month-sidebar.collapsed) .collapsed-icon {
        display: flex; /* Show icons when collapsed */
    }

    :global(.month-sidebar.collapsed) .section-content {
        display: none;
    }

    :global(.month-sidebar.collapsed) .section-header {
        justify-content: center;
        margin-bottom: 0.5rem;
    }

    :global(.month-sidebar.collapsed) .custom-section {
        margin-bottom: 0.5rem;
    }
    

    
    .default-content ul {
        list-style: none;
        padding: 0;
        margin: 0.5rem 0;
    }
    
    .default-content li {
        padding: 0.25rem 0;
        border-bottom: 1px solid #f0f0f0;
        color: #666;
        font-size: 0.9rem;
    }
</style>
