<script lang="ts">
    import type { CharacterConfig } from './character';
    
    export let character: CharacterConfig;
</script>

<div class="character-container">
    <!-- Base body layer -->
    <img 
        src={character.body.path} 
        alt="Character body" 
        class="character-part body"
    />
    <!-- Shirt layer -->
    <img 
        src={character.shirt.path} 
        alt="Character shirt" 
        class="character-part shirt"
    />
    <!-- Hat layer -->
    <img 
        src={character.hat.path} 
        alt="Character hat" 
        class="character-part hat"
    />
</div>

<style>
    .character-container {
        position: relative;
        width: 200px;
        height: 200px;
    }

    .character-part {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    /* Ensure proper layering */
    .body { z-index: 1; }
    .shirt { z-index: 2; }
    .hat { z-index: 3; }
</style>
