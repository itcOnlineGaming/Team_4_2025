<script lang="ts">
  import Leaderboard from '$lib/components/Leaderboard.svelte';
  import type { Player } from '$lib/leaderboard';

  let players: Player[] = [
    { name: "Alice", score: 90 },
    { name: "Bob", score: 80 },
    { name: "Charlie", score: 70 },
  ];
</script>

<main>
  <Leaderboard {players} />

  <div class="home-button">
    <a href="/" class="button">🏠 Home</a>
  </div>
</main>

<style>
  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;
  }

  .home-button {
    margin-top: 1rem;
  }

  .button {
    background-color: #ccc;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    text-decoration: none;
    color: black;
    font-weight: bold;
  }

  .button:hover {
    background-color: #bbb;
  }
</style>
