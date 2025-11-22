export default function calculateTier(tier: number) {
  const t = Math.floor(tier / 5);

  switch (t) {
    case 0:
      return "bronze";
    case 1:
      return "silver";
    case 2:
      return "gold";
    case 3:
      return "platinum";
    case 4:
      return "diamond";
    default:
      return "noob";
  }
}
