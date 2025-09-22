<script lang="ts">
  import type { Player } from '../lib/leaderboard'; // adjust path
  export let players: Player[] = [];
</script>

<div class="leaderboard-container">
  <div class="icon">
    <!-- Replace with an <img> or SVG -->
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="24" cy="14" r="8"/>
      <path d="M12 44c0-6.6 5.4-12 12-12h0c6.6 0 12 5.4 12 12"/>
    </svg>
  </div>
  
  <div class="title">Leaderboard</div>
  
  <ul class="list">
    {#each players.slice(0,3) as player, i}
      <li>
        <span class="rank">{i + 1}</span>
        <span class="line"></span>
        <span class="name">{player.name} — {player.score}</span>
      </li>
    {/each}
  </ul>
  
  <div class="home-button">
    <button>🏠 Home</button>
  </div>
</div>

<style>
  .leaderboard-container {
    background: #d9d9d9;
    padding: 1rem;
    border-radius: 0.5rem;
    text-align: center;
    width: 250px;
    margin: auto;
  }

  .icon {
    margin-bottom: 0.5rem;
  }

  .title {
    font-weight: bold;
    font-size: 1.2rem;
    background: #ccc;
    padding: 0.5rem;
    border-radius: 0.3rem;
    margin-bottom: 0.5rem;
  }

  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    text-align: left;
  }

  .list li {
    display: flex;
    align-items: center;
    margin: 0.4rem 0;
    font-size: 1rem;
  }

  .rank {
    width: 20px;
    font-weight: bold;
  }

  .line {
    flex: 1;
    height: 1px;
    background: #999;
    margin: 0 0.5rem;
  }

  .name {
    white-space: nowrap;
  }

  .home-button {
    margin-top: 1rem;
  }

  .home-button button {
    background: #eee;
    border: none;
    border-radius: 0.5rem;
    padding: 0.4rem 0.8rem;
    font-size: 1rem;
    cursor: pointer;
  }
</style>
