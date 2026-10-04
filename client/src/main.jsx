import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import BatchImport from "./pages/BatchImport";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import ListingForm from "./pages/ListingForm";
import ListingQueue from "./pages/ListingQueue";
import ReviewDetails from "./pages/ReviewDetails";
import Landing from "./pages/Landing";
import Notice from "./components/Notice";
import Sidebar from "./components/Sidebar";
import { api } from "./lib/api";
import "./styles.css";

function App() {
  const [page, setPage] = useState("Landing");
  const [dashboard, setDashboard] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [error, setError] = useState("");
  const [reviewing, setReviewing] = useState("");

  const refresh = async () => {
    try {
      const [dashboardData, listingData, reviewData] = await Promise.all([
        api("/dashboard"),
        api("/listings"),
        api("/reviews"),
      ]);
      setDashboard(dashboardData);
      setListings(listingData);
      setReviews(reviewData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openReview = async (review) => {
    try {
      setSelectedReview(await api(`/reviews/${review._id}`));
      setPage("Result");
    } catch (err) {
      setError(err.message);
    }
  };

  async function startReview(listingId) {
    setReviewing(listingId);
    setError("");
    try {
      const review = await api("/reviews", {
        method: "POST",
        body: JSON.stringify({ listingId }),
      });
      await refresh();
      setSelectedReview(review);
      setPage("Result");
    } catch (err) {
      setError(err.message);
    } finally {
      setReviewing("");
    }
  }

  async function action(index, actionType, editedRevision) {
    try {
      const updated = await api(
        `/reviews/${selectedReview._id}/findings/${index}/action`,
        {
          method: "PATCH",
          body: JSON.stringify({ action: actionType, editedRevision }),
        },
      );
      setSelectedReview(updated);
      await refresh();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  if (page === "Landing") {
    return <Landing onEnter={() => setPage("Dashboard")} />;
  }

  let content;
  if (page === "Dashboard") {
    content = <Dashboard dashboard={dashboard} setPage={setPage} openReview={openReview} />;
  } else if (page === "New listing") {
    content = <ListingForm refresh={refresh} onCreated={() => setPage("Review queue")} />;
  } else if (page === "Review queue") {
    content = <ListingQueue listings={listings} startReview={startReview} reviewing={reviewing} setPage={setPage} />;
  } else if (page === "History") {
    content = <History reviews={reviews} openReview={openReview} />;
  } else if (page === "Batch import") {
    content = <BatchImport refresh={refresh} setPage={setPage} openReview={openReview} />;
  } else {
    content = <ReviewDetails review={selectedReview} onAction={action} back={() => setPage("History")} />;
  }

  return (
    <div className="app-shell min-h-screen bg-slate-50 text-ink md:flex">
      <Sidebar page={page} setPage={setPage} />
      <main className="app-main min-w-0 flex-1">
        <div className="mx-auto max-w-6xl p-5 md:p-9">
          <Notice error={error} onClose={() => setError("")} />
          {content}
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
