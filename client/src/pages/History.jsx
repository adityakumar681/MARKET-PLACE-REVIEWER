import ReviewTable from "../components/ReviewTable";
export default function History({ reviews, openReview }) {
  return <><div className="page-heading"><div><p className="eyebrow">Audit trail</p><h1>Review history</h1><p>Every AI review, policy context, and human decision is recorded.</p></div></div><section className="section"><ReviewTable reviews={reviews} openReview={openReview} /></section></>;
}
