<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import "./style.css";
  import type { FilterGroup, SortOption } from "./types";

  /* Props ------------------------------ */
  export let title = "Filters";
  export let items: any[] = [];
  export let filterGroups: FilterGroup[] = [];
  export let sortOptions: SortOption[] = [];
  export let initialSortId: string | null = null;

  export let selectedFilters: Record<string, string[]> = {};
  export let selectedSortId: string | null = initialSortId;
  export let filteredItems: any[] = [];

  export let showAuthSection = false;
  export let isAuthenticated = false;

  /* Helper Fns -------------------------- */
  export let filterFn = (item: any, active: Record<string, string[]>) => {
    for (const [groupId, values] of Object.entries(active)) {
      if (!values.length) continue;
      const v = (item[groupId] ?? "").toString();
      if (!values.includes(v)) return false;
    }
    return true;
  };

  export let sortFn = (a: any, b: any, sortId: string | null) => {
    if (!sortId) return 0;
    const av = a[sortId];
    const bv = b[sortId];
    if (av == null || bv == null) return 0;
    return av < bv ? -1 : av > bv ? 1 : 0;
  };

  /* Sidebar collapse -------------------- */
  let collapsed = false;
  const dispatch = createEventDispatcher();

  function toggleCollapse() {
    collapsed = !collapsed;
    dispatch("toggle", { collapsed });
  }

  function toggleFilter(groupId: string, value: string, type: "checkbox" | "radio" = "checkbox") {
    const current = selectedFilters[groupId] || [];
    let next: string[];

    if (type === "radio") {
      next = value === current[0] ? [] : [value];
    } else {
      next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    }

    selectedFilters = { ...selectedFilters, [groupId]: next };
  }

  function clearAll() {
    const cleared: Record<string, string[]> = {};
    for (const group of filterGroups) cleared[group.id] = [];
    selectedFilters = cleared;
    selectedSortId = initialSortId;
  }

  function handleSortChange(id: string) {
    selectedSortId = id;
  }

  function login() {
    dispatch("login");
  }

  function logout() {
    dispatch("logout");
  }

  /* Sync filters ------------------------- */
  $: {
    for (const group of filterGroups) {
      if (!selectedFilters[group.id]) {
        selectedFilters = { ...selectedFilters, [group.id]: [] };
      }
    }
  }

  $: {
    const base = items.filter(item => filterFn(item, selectedFilters));
    const sorted = [...base].sort((a, b) => sortFn(a, b, selectedSortId));
    filteredItems = sorted;
    dispatch("change", { filteredItems, selectedFilters, selectedSortId });
  }
</script>

<!-- =======================================================================
     SIDEBAR MARKUP
     ======================================================================= -->

<aside
  class={collapsed ? "month-sidebar collapsed" : "month-sidebar"}
  aria-label="SRL filter sidebar"
>

  <!-- HEADER -------------------------------------------------------------- -->
  <div class="sidebar-header">
    <button class="collapse-button" on:click={toggleCollapse}>
      {#if collapsed} ☰ {:else} « {/if}
    </button>

    {#if !collapsed}
      <h2>{title}</h2>
      <button class="clear-button" on:click={clearAll}>Clear</button>
    {/if}
  </div>


  <!-- AUTH SECTION -------------------------------------------------------- -->
  {#if showAuthSection}
    <div class="auth-section">
      {#if collapsed}
        <button class="auth-icon-button" on:click={isAuthenticated ? logout : login}>
          {isAuthenticated ? "🔒" : "🔓"}
        </button>
      {:else}
        <p class="auth-status">
          {isAuthenticated ? "Signed in" : "Guest session"}
        </p>
        <button class="auth-button" on:click={isAuthenticated ? logout : login}>
          {isAuthenticated ? "Log out" : "Log in to save filters"}
        </button>
      {/if}
    </div>
  {/if}


  <!-- FILTER GROUPS ------------------------------------------------------- -->
  <div class="sidebar-section filters">

    {#each filterGroups as group}
      <section class="filter-group">

        <!-- Collapsed icon -->
        {#if collapsed}
          <div class="collapsed-icon" title={group.label}>
            {group.icon}
          </div>
        {/if}

        <!-- Expanded label -->
        {#if !collapsed}
          <h3>{group.label}</h3>
        {/if}

        <!-- Options -->
        <div class="filter-options">
          {#each group.options as option}
            <label class="filter-chip">
              <input
                type={group.type ?? "checkbox"}
                checked={selectedFilters[group.id]?.includes(option.value)}
                on:change={() => toggleFilter(group.id, option.value, group.type ?? "checkbox")}
              />
              <span class:hidden={collapsed}>{option.label}</span>

              {#if collapsed}
                <span class="collapsed-dot">{option.label.charAt(0)}</span>
              {/if}
            </label>
          {/each}
        </div>

      </section>
    {/each}

  </div>


  <!-- SORT SECTION -------------------------------------------------------- -->
  <div class="sidebar-section sort">

    <!-- Collapsed -->
    {#if collapsed}
      <div class="collapsed-icon" title="Sort By">
        {sortOptions[0]?.icon ?? "↕️"}
      </div>
    {/if}

    <!-- Expanded -->
    {#if !collapsed}
      <h3>Sort by</h3>
    {/if}

    <!-- Sort Options -->
    <div class="sort-options">
      {#each sortOptions as option}
        <label class="sort-item">
          <input
            type="radio"
            name="sort"
            checked={selectedSortId === option.id}
            on:change={() => handleSortChange(option.id)}
          />
          <span class:hidden={collapsed}>{option.label}</span>

          {#if collapsed}
            <span class="collapsed-dot">{option.label.charAt(0)}</span>
          {/if}
        </label>
      {/each}
    </div>
  </div>

  <slot />

</aside>
