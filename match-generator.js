// Perfectly balanced match generator using randomised hill‑climbing
function generateFairMatches(players, playerSkills, totalMatches) {
  const n = players.length;
  const totalSlots = totalMatches * 4;
  const base = Math.floor(totalSlots / n);
  let remainder = totalSlots % n;
  const targets = {};
  for (const p of players) targets[p] = base;
  const sortedPlayers = [...players].sort();
  for (let i = 0; i < remainder; i++) targets[sortedPlayers[i]]++;

  // Generate all possible matches (any 4 distinct players, all 3 splits)
  const allMatches = [];
  for (let i = 0; i < n; i++) {
    for (let j = i+1; j < n; j++) {
      for (let k = j+1; k < n; k++) {
        for (let l = k+1; l < n; l++) {
          const four = [players[i], players[j], players[k], players[l]];
          const splits = [
            [[four[0], four[1]], [four[2], four[3]]],
            [[four[0], four[2]], [four[1], four[3]]],
            [[four[0], four[3]], [four[1], four[2]]]
          ];
          for (let [t1, t2] of splits) {
            allMatches.push({
              t1: t1.sort(),
              t2: t2.sort(),
              players: four.slice()
            });
          }
        }
      }
    }
  }

  // Randomised search with backtracking
  let bestSolution = null;
  const maxAttempts = 1000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const selected = [];
    const remainingTargets = { ...targets };
    const availableMatches = [...allMatches];
    // Shuffle matches for randomness
    for (let i = availableMatches.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableMatches[i], availableMatches[j]] = [availableMatches[j], availableMatches[i]];
    }

    for (const match of availableMatches) {
      if (selected.length === totalMatches) break;
      // Check if all players in this match still need appearances
      let possible = true;
      for (const p of match.players) {
        if (remainingTargets[p] === 0) {
          possible = false;
          break;
        }
      }
      if (possible) {
        selected.push(match);
        for (const p of match.players) remainingTargets[p]--;
      }
    }

    if (selected.length === totalMatches) {
      // Perfect – all targets met
      bestSolution = selected;
      break;
    }
    // If not perfect, try another random shuffle
  }

  if (!bestSolution) {
    // Fallback: greedy with no target checks (should not happen)
    console.warn("Could not find perfect schedule, using fallback");
    const selected = [];
    const usedMatches = new Set();
    for (const match of allMatches) {
      if (selected.length >= totalMatches) break;
      if (!usedMatches.has(match)) {
        selected.push(match);
        usedMatches.add(match);
      }
    }
    bestSolution = selected.slice(0, totalMatches);
  }

  // Re-index and add IDs
  return bestSolution.map((m, idx) => ({
    id: idx + 1,
    t1: m.t1,
    t2: m.t2,
    out: []
  }));
}
