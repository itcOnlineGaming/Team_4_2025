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
    
    // Exported state for filtering and sorting (so parent can bind to them)
    export let selectedFilters: Record<string, string[]> = {};
    export let selectedSortId: string | null = null;
    export let filteredItems: any[] = [];
    
    // Track collapsed state
    let collapsed = false;
    const dispatch = createEventDispatcher();
    
    function handleToggle(event: CustomEvent<{ collapsed: boolean }>) {
        collapsed = event.detail.collapsed;
        dispatch('toggle', { collapsed });
    }
    
    function toggleFilter(groupId: string, value: string) {
        const current = selectedFilters[groupId] || [];
        if (current.includes(value)) {
            selectedFilters[groupId] = current.filter(v => v !== value);
        } else {
            selectedFilters[groupId] = [...current, value];
        }
        selectedFilters = { ...selectedFilters };
    }
    
    // Example filter groups and sort options for tasks
    $: if (!filterGroups.length) {
        filterGroups = [
            {
                id: 'status',
                label: 'Status',
                icon: '📋',
                options: [
                    { value: 'pending', label: 'Pending' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' }
                ]
            },
            {
                id: 'priority',
                label: 'Priority',
                icon: '🔥',
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
            { id: 'date', label: 'Date', icon: '📑' },
            { id: 'priority', label: 'Priority', icon: '🔥' },
            { id: 'status', label: 'Status', icon: '📋' }
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
            <!-- Custom sections that show as icons when collapsed -->
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

                <!-- Help Section -->
                <div class="custom-section help-section">
                    <div class="section-header">
                        <!-- Icon only visible when collapsed -->
                        <div class="collapsed-icon help-icon" title="Help">
                            ❓
                        </div>
                        <!-- Title only visible when expanded -->
                        <h3 class="section-title">Help</h3>
                    </div>
                    <div class="section-content">
                        <div class="help-actions">
                            <button class="action-btn">📖 User Guide</button>
                        </div>
                    </div>
                </div>

                <!-- Results Section -->
                <div class="custom-section results-section">
                    <div class="section-header">
                        <!-- Icon only visible when collapsed -->
                        <div class="collapsed-icon results-icon" title="Filtered Results">
                            🔍
                        </div>
                        <!-- Title only visible when expanded -->
                        <h3 class="section-title">Results</h3>
                    </div>
                    <div class="section-content">
                        <slot name="content">
                            <div class="default-content">
                                <p class="results-count">📋 {filteredItems.length} items match filters</p>
                                {#if filteredItems.length > 0}
                                    <ul class="results-list">
                                        {#each filteredItems.slice(0, 5) as item}
                                            <li class="result-item">
                                                <span class="item-priority {item.priority || 'medium'}">
                                                    {#if item.priority === 'high'}🔴{:else if item.priority === 'low'}🟢{:else}🟡{/if}
                                                </span>
                                                <span class="item-title">{item.title || item.name || 'Untitled'}</span>
                                                <span class="item-status {item.status || 'pending'}">
                                                    {#if item.status === 'completed'}✅{:else if item.status === 'cancelled'}❌{:else}⏳{/if}
                                                </span>
                                            </li>
                                        {/each}
                                        {#if filteredItems.length > 5}
                                            <li class="more-items">...and {filteredItems.length - 5} more</li>
                                        {/if}
                                    </ul>
                                {:else}
                                    <p class="no-results">🔍 No items match the current filters.</p>
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
        margin-bottom: 8px;
    }

    :global(.month-sidebar.collapsed) .section-content {
        display: none;
    }

    :global(.month-sidebar.collapsed) .section-header {
        justify-content: center;
        margin-bottom: 0;
    }

    :global(.month-sidebar.collapsed) .custom-section {
        margin-bottom: 0;
        padding: 0;
    }

    /* Better spacing for expanded sections */
    .custom-section {
        margin-bottom: 1.5rem;
        padding: 0.5rem 0;
    }

    .custom-section:not(:last-child) {
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 1rem;
    }
    

    
    /* Help Actions */
    .help-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    /* Results Section */
    .results-count {
        margin: 0 0 0.75rem 0;
        font-weight: 600;
        color: #4e3d67;
        font-size: 0.85rem;
    }

    .results-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .result-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: #f9f7ff;
        border: 1px solid #e8dff5;
        border-radius: 6px;
        font-size: 0.8rem;
    }

    .item-priority {
        flex-shrink: 0;
        font-size: 0.7rem;
    }

    .item-title {
        flex: 1;
        color: #4e3d67;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .item-status {
        flex-shrink: 0;
        font-size: 0.7rem;
    }

    .more-items {
        padding: 0.5rem;
        text-align: center;
        color: #8c62cf;
        font-size: 0.75rem;
        font-style: italic;
    }

    .no-results {
        margin: 0;
        padding: 1rem;
        text-align: center;
        color: #8c62cf;
        font-size: 0.8rem;
        background: #f9f7ff;
        border: 1px solid #e8dff5;
        border-radius: 6px;
    }

    /* Legacy styles for backward compatibility */
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
