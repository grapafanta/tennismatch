// ------------------------------------------------------------------
// Perfectly balanced match generator using recursive backtracking
// ------------------------------------------------------------------

function getAllMatches(players) {
  const n = players.length;
  const matches = [];
  for (let i = 0; i < n; i++) {
    for (let j = i+1; j < n; j++) {
      for (let k = j+1; k < n; k++) {
        for (let l = k+1; l < n; l++) {
          const four = [players[i], players[j], players[k], players[l]];
          // All 3 ways to split four players into two teams of two
          const splits = [
            [[four[0], four[1]], [four[2], four[3]]],
            [[four[0], four[2]], [four[1], four[3]]],
            [[four[0], four[3]], [four[1], four[2]]]
          ];
          for (const [t1, t2] of splits) {
            matches.push({
              t1: t1.sort(),
              t2: t2.sort(),
              players: four.slice()
            });
          }
        }
      }
    }
  }
  return matches;
}

function generateFairMatches(players, playerSkills, totalMatches) {
  const allMatches = getAllMatches(players);
  if (allMatches.length === 0) return [];

  const n = players.length;
  const totalSlots = totalMatches * 4;
  const base = Math.floor(totalSlots / n);
  let remainder = totalSlots % n;
  const targets = {};
  for (const p of players) targets[p] = base;
  const sortedPlayers = [...players].sort();
  for (let i = 0; i < remainder; i++) targets[sortedPlayers[i]]++;

  // Sort matches by some heuristic (fewest remaining options first) – improves speed
  // For now, we'll shuffle for randomness
  const shuffled = [...allMatches];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  let bestSolution = null;

  function backtrack(selected, counts, startIdx) {
    if (selected.length === totalMatches) {
      // Verify all counts exactly match targets
      for (const p of players) {
        if (counts[p] !== targets[p]) return false;
      }
      bestSolution = [...selected];
      return true;
    }

    // Prune: if any player already exceeds target
    for (const p of players) {
      if (counts[p] > targets[p]) return false;
    }

    // Prune: remaining matches cannot fill the needed slots
    const remaining = totalMatches - selected.length;
    let totalNeeded = 0;
    for (const p of players) {
      totalNeeded += targets[p] - counts[p];
    }
    if (totalNeeded !== remaining * 4) return false;

    // Try matches from startIdx onward
    for (let i = startIdx; i < shuffled.length; i++) {
      const match = shuffled[i];
      let fits = true;
      for (const p of match.players) {
        if (counts[p] + 1 > targets[p]) {
          fits = false;
          break;
        }
      }
      if (!fits) continue;

      const newCounts = { ...counts };
      for (const p of match.players) newCounts[p]++;
      selected.push(match);
      if (backtrack(selected, newCounts, i + 1)) return true;
      selected.pop();
    }
    return false;
  }

  const initialCounts = {};
  for (const p of players) initialCounts[p] = 0;
  const found = backtrack([], initialCounts, 0);

  if (!found || !bestSolution) {
    // Fallback: This should never happen for valid inputs.
    // But if it does, we generate a simple round‑robin schedule as a last resort.
    console.warn("Backtracking failed, using fallback round‑robin");
    const fallbackMatches = [];
    for (let i = 0; i < players.length; i += 4) {
      if (fallbackMatches.length >= totalMatches) break;
      const four = players.slice(i, i+4);
      if (four.length === 4) {
        fallbackMatches.push({
          id: fallbackMatches.length + 1,
          t1: [four[0], four[1]],
          t2: [four[2], four[3]],
          out: []
        });
      }
    }
    return fallbackMatches;
  }

  return bestSolution.map((m, idx) => ({ id: idx + 1, t1: m.t1, t2: m.t2, out: [] }));
}
