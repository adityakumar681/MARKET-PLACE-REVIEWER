import { ArrowRight, CheckCircle2, ClipboardCheck, FileSearch, ShieldCheck } from "lucide-react";

const workflow = [
  [FileSearch, "Retrieve policy", "Relevant rules are pulled into every review."],
  [ShieldCheck, "Review with confidence", "Evidence, severity, and suggested edits stay together."],
  [CheckCircle2, "Approve with context", "Human decisions complete the audit trail."],
];

export default function Landing({ onEnter }) {
  return (
    <main className="landing-page">
      <nav className="landing-nav"><div className="landing-brand"><span className="landing-mark"><ClipboardCheck size={19} /></span><span>MARKETPLACE OPS</span></div><span className="landing-kicker">Listing quality reviewer</span></nav>
      <section className="landing-hero">
        <div className="landing-copy"><p className="eyebrow">Trust, before publish</p><h1>Make every listing feel ready.</h1><p className="landing-lede">A focused workspace for policy-grounded reviews, thoughtful edits, and confident marketplace operations.</p><button className="button primary landing-cta" onClick={onEnter}>Open workspace <ArrowRight size={17} /></button></div>
        <div className="landing-preview" aria-label="Review workflow preview"><div className="preview-top"><span className="preview-dot" /><span>Review intelligence</span><span className="preview-status">Live</span></div><div className="preview-listing"><p className="preview-label">CURRENT LISTING</p><h2>Wireless noise-cancelling headphones</h2><p>Northstar Audio · Electronics</p></div><div className="preview-finding"><div className="finding-signal"><span>Medium</span><b>Unverifiable performance claim</b></div><p>“Battery life is up to 30 hours...”</p><div className="preview-rule">MISLEAD-01 <span>Policy matched</span></div></div><div className="preview-footer"><span>1 finding ready for review</span><span className="preview-check"><CheckCircle2 size={15} /> Human decision next</span></div></div>
      </section>
      <section className="landing-workflow"><div className="workflow-heading"><p className="eyebrow">A sharper review loop</p><h2>From intake to approval, without the noise.</h2></div><div className="workflow-grid">{workflow.map(([Icon, title, description], index) => <article className="workflow-item" key={title}><span className="workflow-number">0{index + 1}</span><span className="workflow-icon"><Icon size={18} /></span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    </main>
  );
}
