export function StatCard({ label, value, hint, accent = "#0891b2" }) {
  const style = { "--accent": accent };

  return (
    <article className="stat-card" style={style}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{hint}</span>
    </article>
  );
}
