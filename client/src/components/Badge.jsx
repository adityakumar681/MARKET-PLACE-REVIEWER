export default function Badge({ children, tone = "slate" }) {
  return <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${tone}`}>{children}</span>;
}
