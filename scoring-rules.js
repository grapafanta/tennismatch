// Scoring rules: determines game phase based on points
function getPhase(s1, s2, prevPhase) {
  const total = s1 + s2;
  if (prevPhase === "sudden") return { label: "WINNER!", phase: "done" };
  if (prevPhase === "deuce") {
    if (s1 !== s2) return { label: "WINNER!", phase: "done" };
    return { label: "SUDDEN DEATH", phase: "sudden" };
  }
  if (prevPhase === "extra") {
    if (total === 5) {
      if (s1 !== s2) return { label: "WINNER!", phase: "done" };
      return { label: "DEUCE", phase: "deuce" };
    }
  }
  if (total < 4) return { label: "SERVE " + (total + 1) + " / 4", phase: "live" };
  if (total === 4) {
    if (s1 === 2 && s2 === 2) return { label: "EXTRA ROUND", phase: "extra" };
    return { label: "WINNER!", phase: "done" };
  }
  return { label: "LIVE", phase: "live" };
}