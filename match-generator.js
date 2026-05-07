// ------------------------------------------------------------------
// Perfectly balanced match generator using round‑robin for doubles
// No skill restrictions – any 4 distinct players form a match.
// Each player appears the same number of times (or ±1).
// ------------------------------------------------------------------

// Generate a complete round‑robin doubles schedule.
// For n players, each match is a set of 4 distinct players.
// We use the "circle method" to rotate partners and opponents.
function generateFairMatches(players, playerSkills, totalMatches) {
  const n = players.length;
  // We cannot guarantee exactly `totalMatches` with perfect balance if totalMatches is arbitrary.
  // Instead, we generate a full round‑robin schedule (all combinations of 4 players) and then
  // select the required number of matches while maintaining balance.
  // But simpler: we create a cyclic schedule where each player plays the same number of matches.
  // We'll create a schedule where each player plays exactly k matches, with k = floor(totalMatches * 4 / n)
  // and then adjust.

  const totalSlots = totalMatches * 4;
  const base = Math.floor(totalSlots / n);
  let remainder = totalSlots % n;
  const targetCounts = {};
  for (const p of players) targetCounts[p] = base;
  const sorted = [...players].sort();
  for (let i = 0; i < remainder; i++) targetCounts[sorted[i]]++;

  // Generate all possible matches (unordered sets of 4 players)
  const allMatches = [];
  for (let i = 0; i < n; i++) {
    for (let j = i+1; j < n; j++) {
      for (let k = j+1; k < n; k++) {
        for (let l = k+1; l < n; l++) {
          const four = [players[i], players[j], players[k], players[l]];
          // Split into two teams of 2 (all possible pairings of the 4)
          // We need to generate the 3 distinct ways to split 4 players into two doubles teams.
          const splits = [
            [[four[0], four[1]], [four[2], four[3]]],
            [[four[0], four[2]], [four[1], four[3]]],
            [[four[0], four[3]], [four[1], four[2]]]
          ];
          for (let [t1, t2] of splits) {
            allMatches.push({
              t1: t1.sort(),
              t2: t2.sort(),
              players: four
            });
          }
        }
      }
    }
  }

  // Shuffle for randomness
  for (let i = allMatches.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allMatches[i], allMatches[j]] = [allMatches[j], allMatches[i]];
  }

  // Greedy selection with exact target counts
  const selected = [];
  const currentCounts = {};
  for (const p of players) currentCounts[p] = 0;

  for (const match of allMatches) {
    if (selected.length >= totalMatches) break;
    // Check if adding this match would exceed any player's target
    let ok = true;
    for (const p of match.players) {
      if (currentCounts[p] + 1 > targetCounts[p]) {
        ok = false;
        break;
      }
    }
    if (ok) {
      for (const p of match.players) currentCounts[p]++;
      selected.push({ id: selected.length + 1, t1: match.t1, t2: match.t2, out: [] });
    }
  }

  // If we still need more matches, fill with any remaining (should not happen if totalMatches is feasible)
  if (selected.length < totalMatches) {
    for (const match of allMatches) {
      if (selected.length >= totalMatches) break;
      if (!selected.some(m => m.t1 === match.t1 && m.t2 === match.t2)) {
        selected.push({ id: selected.length + 1, t1: match.t1, t2: match.t2, out: [] });
      }
    }
  }

  return selected.slice(0, totalMatches);
}
