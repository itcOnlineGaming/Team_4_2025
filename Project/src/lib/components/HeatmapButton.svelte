<script lang="ts">
    export let onClick: () => void;
</script>

<button
        class="heatmap-button"
        on:click={onClick}
>
    📊 Activity Stats
</button>

<style>
    .heatmap-button {
        position: fixed;
        bottom: 1.5rem;
        left: 1.5rem;
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

    .heatmap-button:hover {
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        transform: translateY(-2px);
    }

    .heatmap-button:active {
        transform: translateY(0);
    }
</style>