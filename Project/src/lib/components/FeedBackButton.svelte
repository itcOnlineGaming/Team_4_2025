<script lang="ts">
    export let formUrl: string;
</script>

<button 
    class="feedback-button"
    on:click={() => window.open(formUrl, '_blank')}
>
    💬 Give Feedback
</button>

<style>
    .feedback-button {
        position: fixed;
        bottom: 1.5rem;
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
