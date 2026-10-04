import { FilePlus2 } from "lucide-react";
import ReviewTable from "../components/ReviewTable";
import Stat from "../components/Stat";
export default function Dashboard({ dashboard, setPage, openReview }) {
  return <><div className="page-heading"><div><p className="eyebrow">Operations overview</p><h1>Listing quality dashboard</h1><p>Review incoming marketplace content before it is published.</p></div><button className="button primary" onClick={() => setPage("New listing")}><FilePlus2 size={17} /> Create listing</button></div><div className="grid gap-4 sm:grid-cols-3"><Stat label="Total listings" value={dashboard?.totalListings} /><Stat label="Completed reviews" value={dashboard?.totalReviews} /><Stat label="Needs attention" value={dashboard?.attention} danger /></div><section className="section mt-7"><div className="section-title"><div><h2>Recent reviews</h2><p>Latest completed AI reviews with human follow-up.</p></div><button className="text-button" onClick={() => setPage("History")}>View all</button></div><ReviewTable reviews={dashboard?.recentReviews || []} openReview={openReview} /></section></>;
}
