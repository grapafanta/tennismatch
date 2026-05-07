// Helper: all possible valid matches (one beginner + one intermediate per team)
function getAllValidMatches(players, playerSkills) {
  const beginners = players.filter(p => playerSkills[p] === "beginner");
  const intermediates = players.filter(p => playerSkills[p] === "intermediate");
  const allTeams = [];
  for (const b of beginners) {
    for (const im of intermediates) {
      allTeams.push([b, im].sort());
    }
  }
  const matches = [];
  for (let i = 0; i < allTeams.length; i++) {
    for (let j = i+1; j < allTeams.length; j++) {
      const t1 = allTeams[i];
      const t2 = allTeams[j];
      const allPlayers = [...t1, ...t2];
      if (new Set(allPlayers).size === 4) {
        matches.push({ t1: [...t1], t2: [...t2], players: allPlayers });
      }
    }
  }
  return matches;
}

// Exact backtracking match generator – guarantees balanced appearances
function generateFairMatches(players, playerSkills, totalMatches) {
  const allMatches = getAllValidMatches(players, playerSkills);
  if (allMatches.length === 0) return [];

  // Target appearances: each player appears in exactly `target` matches (with possible +1 for some)
  const totalSlots = totalMatches * 4;
  const base = Math.floor(totalSlots / players.length);
  let remainder = totalSlots % players.length;
  const targets = {};
  for (const p of players) {
    targets[p] = base;
  }
  // Distribute remainder to the first `remainder` players in alphabetical order (deterministic)
  const sortedPlayers = [...players].sort();
  for (let i = 0; i < remainder; i++) {
    targets[sortedPlayers[i]]++;
  }

  // Shuffle matches for variety, but keep determinism for the algorithm
  const shuffledMatches = [...allMatches];
  for (let i = shuffledMatches.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledMatches[i], shuffledMatches[j]] = [shuffledMatches[j], shuffledMatches[i]];
  }

  // Backtracking search
  let bestSolution = null;
  let bestRemaining = Infinity;

  function backtrack(selected, counts, startIdx) {
    // If we have enough matches, check if it's perfect
    if (selected.length === totalMatches) {
      // Verify all counts exactly match targets (they should)
      let valid = true;
      for (const p of players) {
        if (counts[p] !== targets[p]) {
          valid = false;
          break;
        }
      }
      if (valid) {
        bestSolution = [...selected];
        return true;
      }
      return false;
    }

    // Prune if impossible to reach targets
    let remainingMatches = totalMatches - selected.length;
    let remainingSlots = remainingMatches * 4;
    let totalNeeded = 0;
    for (const p of players) {
      let need = targets[p] - counts[p];
      if (need < 0) return false; // already exceeded
      totalNeeded += need;
    }
    if (totalNeeded > remainingSlots) return false;
    if (totalNeeded < remainingSlots) return false; // must exactly fill

    // Try matches from startIdx onward
    for (let i = startIdx; i < shuffledMatches.length; i++) {
      const match = shuffledMatches[i];
      // Check if adding this match keeps counts within targets
      let fits = true;
      for (const p of match.players) {
        if (counts[p] + 1 > targets[p]) {
          fits = false;
          break;
        }
      }
      if (!fits) continue;

      // Apply match
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
    // Fallback: use greedy algorithm (should not happen for valid inputs)
    console.warn("Backtracking failed, using greedy fallback");
    return selectBalancedMatches(allMatches, totalMatches, players);
  }

  // Re-index matches sequentially
  return bestSolution.map((m, idx) => ({ ...m, id: idx + 1 }));
}

// Fallback greedy (kept for safety)
function selectBalancedMatches(allMatches, totalMatches, players) {
  if (totalMatches === 0) return [];
  if (allMatches.length === 0) return [];
  const counts = Object.fromEntries(players.map(p => [p, 0]));
  const selected = [];
  let availablePool = [...allMatches];
  for (let mIdx = 0; mIdx < totalMatches; mIdx++) {
    if (availablePool.length === 0) availablePool = [...allMatches];
    let bestMatch = null;
    let bestScore = Infinity;
    for (const match of availablePool) {
      const newCounts = { ...counts };
      for (const p of match.players) newCounts[p] += 1;
      let sumSq = 0;
      for (const p of players) sumSq += newCounts[p] * newCounts[p];
      if (sumSq < bestScore) {
        bestScore = sumSq;
        bestMatch = match;
      } else if (sumSq === bestScore && bestMatch && Math.random() < 0.5) bestMatch = match;
    }
    if (bestMatch) {
      for (const p of bestMatch.players) counts[p] += 1;
      selected.push({ id: selected.length + 1, t1: bestMatch.t1, t2: bestMatch.t2, out: players.filter(p => !bestMatch.players.includes(p)) });
      const idx = availablePool.indexOf(bestMatch);
      if (idx !== -1) availablePool.splice(idx, 1);
    } else break;
  }
  return selected;
}
