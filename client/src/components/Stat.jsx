export default function Stat({ label, value, danger }) {
  return <div className={`stat-card ${danger ? "is-danger" : ""}`}><p>{label}</p><p>{value ?? "—"}</p></div>;
}
