type Player = {
  name: string;
  score: number;
};

class Leaderboard {
  private players: Player[] = [];

  addPlayer(name: string, score: number) {
    this.players.push({ name, score });
    this.sortLeaderboard();
  }

  updateScore(name: string, score: number) {
    const player = this.players.find(p => p.name === name);
    if (player) {
      player.score = score;
      this.sortLeaderboard();
    }
  }

  private sortLeaderboard() {
    this.players.sort((a, b) => b.score - a.score);
  }

  getTop(n: number): Player[] {
    return this.players.slice(0, n);
  }

  print() {
    console.log("Leaderboard:");
    this.players.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} — ${p.score}`);
    });
  }
}

// Example usage:
const lb = new Leaderboard();

lb.addPlayer("Alice", 50);
lb.addPlayer("Bob", 80);
lb.addPlayer("Charlie", 65);

lb.print();

lb.updateScore("Alice", 90);
lb.print();

console.log("Top 3:", lb.getTop(3));
