<script lang="ts">
    import './MajorItemModal.css';
    import { createEventDispatcher } from 'svelte';
    
    export let showModal = false;
    
    const dispatch = createEventDispatcher();
    
    function handleCreate() {
        dispatch('create');
        closeModal();
    }
    
    function closeModal() {
        showModal = false;
        dispatch('close');
    }
    
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }
    
    function handleOverlayClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if showModal}
    <div class="modal-overlay" on:click={handleOverlayClick} role="button" tabindex="0">
        <div class="modal-content" role="dialog" aria-modal="true">
            <div class="modal-header">
                <h2>Create Major Task</h2>
                <button type="button" class="close-button" on:click={closeModal} aria-label="Close">
                    ×
                </button>
            </div>
            
            <div class="modal-body">
                <p>Create a new major task that will span Monday to Wednesday.</p>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="cancel-button" on:click={closeModal}>Cancel</button>
                <button type="button" class="create-button" on:click={handleCreate}>Create</button>
            </div>
        </div>
    </div>
{/if}
