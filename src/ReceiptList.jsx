import { useEffect, useState } from "react";
import api from "./api";

const fmt = (n) => Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
const MODES = { cash: "Cash", gpay: "GPay / UPI", cheque: "Cheque", bank: "Bank transfer" };

function Skeleton() {
  return (
    <ul className="rlist" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <li key={i} className="rcard skel">
          <span className="avatar shimmer" />
          <div className="rmain"><span className="line shimmer w60" /><span className="line shimmer w40" /></div>
          <div className="rside"><span className="line shimmer w80" /></div>
        </li>
      ))}
    </ul>
  );
}

export default function ReceiptList({ refresh, onOpen }) {
  const [filters, setFilters] = useState({ search: "", date_from: "", date_to: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    const t = setTimeout(async () => {
      const params = { page, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      try { setData((await api.get("/receipts/", { params, timeout: 90000 })).data); }
      catch { setError("Could not load receipts. The server may be waking up."); }
      finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [filters, page, refresh, retry]);

  const set = (k) => (e) => { setPage(1); setFilters({ ...filters, [k]: e.target.value }); };
  const hasFilter = Object.values(filters).some(Boolean);
  const hasRows = data.results.length > 0;

  return (
    <section aria-busy={loading}>
      <div className="listhead">
        <div>
          <h2>Receipts</h2>
          <p className="muted">{loading ? "Loading…" : `${data.count} ${data.count === 1 ? "receipt" : "receipts"}`}</p>
        </div>
        <div className="filters">
          <label>Search<input placeholder="Name, course or number" value={filters.search} onChange={set("search")} /></label>
          <label>From<input type="date" value={filters.date_from} onChange={set("date_from")} /></label>
          <label>To<input type="date" value={filters.date_to} onChange={set("date_to")} /></label>
          {hasFilter && <button className="btn" onClick={() => { setPage(1); setFilters({ search: "", date_from: "", date_to: "" }); }}>Clear</button>}
        </div>
      </div>

      {loading && !hasRows && <Skeleton />}

      {hasRows && (
        <ul className={`rlist ${loading ? "refreshing" : ""}`}>
          {data.results.map((r) => (
            <li key={r.id} className="rcard" onClick={() => onOpen(r)}>
              <span className="avatar">{initials(r.received_from)}</span>
              <div className="rmain">
                <strong>{r.received_from}</strong>
                <span className="muted">{r.towards}</span>
                <span className="meta">No. {r.receipt_no} · {fmtDate(r.date)}</span>
              </div>
              <div className="rside">
                <span className="amount">₹{fmt(r.amount)}</span>
                <span className={`badge ${r.payment_mode}`}>{MODES[r.payment_mode]}</span>
              </div>
              <button className="btn small" onClick={(e) => { e.stopPropagation(); onOpen(r); }}>View</button>
            </li>
          ))}
        </ul>
      )}

      {!loading && error && (
        <div className="state"><span className="error">{error}</span> <button className="btn small" onClick={() => setRetry((n) => n + 1)}>Retry</button></div>
      )}
      {!loading && !error && !hasRows && (
        <div className="state">{hasFilter ? "No receipts match these filters." : "No receipts yet. Create the first one from New receipt."}</div>
      )}

      <div className="pager">
        <span className="muted">Page {page}</span>
        <div>
          <button className="btn small" disabled={loading || !data.previous} onClick={() => setPage(page - 1)}>Previous</button>
          <button className="btn small" disabled={loading || !data.next} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>
    </section>
  );
}