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

// Main generator: ensures every player appears in roughly the same number of matches
function generateFairMatches(players, playerSkills, totalMatches) {
  const allMatches = getAllValidMatches(players, playerSkills);
  if (allMatches.length === 0) return [];

  // Target appearances: each player should appear in roughly totalMatches*4/players.length matches
  const totalSlots = totalMatches * 4;
  const base = Math.floor(totalSlots / players.length);
  let remainder = totalSlots % players.length;
  const targets = {};
  for (const p of players) {
    targets[p] = base;
  }
  // Distribute remainder randomly but fairly
  const shuffledRemaining = [...players];
  for (let i = 0; i < remainder; i++) {
    targets[shuffledRemaining[i % players.length]]++;
  }

  // Shuffle matches to avoid bias
  const shuffledMatches = [...allMatches];
  for (let i = shuffledMatches.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledMatches[i], shuffledMatches[j]] = [shuffledMatches[j], shuffledMatches[i]];
  }

  const selected = [];
  const currentCounts = Object.fromEntries(players.map(p => [p, 0]));

  // First pass: pick matches that keep everyone within target
  for (const match of shuffledMatches) {
    if (selected.length >= totalMatches) break;
    let fits = true;
    for (const p of match.players) {
      if (currentCounts[p] + 1 > targets[p]) {
        fits = false;
        break;
      }
    }
    if (fits) {
      for (const p of match.players) currentCounts[p]++;
      selected.push({ id: selected.length + 1, t1: match.t1, t2: match.t2, out: players.filter(p => !match.players.includes(p)) });
    }
  }

  // If still short, fill with any remaining matches (may slightly exceed targets)
  if (selected.length < totalMatches) {
    const leftover = shuffledMatches.filter(m => !selected.some(s => s.t1 === m.t1 && s.t2 === m.t2));
    for (const match of leftover) {
      if (selected.length >= totalMatches) break;
      selected.push({ id: selected.length + 1, t1: match.t1, t2: match.t2, out: players.filter(p => !match.players.includes(p)) });
      for (const p of match.players) currentCounts[p]++;
    }
  }

  // Re-index sequentially
  return selected.map((m, idx) => ({ ...m, id: idx + 1 }));
}