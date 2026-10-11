import { useState } from "react";
import api from "./api";
import ReceiptList from "./ReceiptList.jsx";
import ReceiptForm from "./ReceiptForm.jsx";
import PreviewModal from "./PreviewModal.jsx";

function Login({ onLogin }) {
  const [f, setF] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.post("/login/", f, { timeout: 90000 });
      localStorage.setItem("token", data.token);
      onLogin(data.token);
    } catch (e) {
      setErr(e.response
        ? "Username or password is incorrect."
        : "Cannot reach the server. Please try again in a moment.");
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <form onSubmit={submit} className="panel" aria-busy={loading}>
        <h1>Vijayam Institute</h1>
        <p className="muted">Sign in to manage receipts</p>
        <fieldset disabled={loading} className="plain">
          <label>Username
            <input value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} autoFocus required /></label>
          <label>Password
            <input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></label>
        </fieldset>
        {err && <p className="error" role="alert">{err}</p>}
        <button className="btn primary" disabled={loading}>
          {loading ? <><span className="spinner" aria-hidden="true" />Signing in…</> : "Sign in"}
        </button>
        {loading && <p className="muted hint" aria-live="polite">The server may take up to a minute to wake up the first time.</p>}
      </form>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [view, setView] = useState("list");
  const [preview, setPreview] = useState(null);
  const [refresh, setRefresh] = useState(0);

  if (!token) return <Login onLogin={setToken} />;

  return (
    <>
      <header className="top">
        <div>
          <strong>Vijayam Institute</strong>
          <span className="muted"> · KP Educational and Charitable Trust</span>
        </div>
        <nav>
          <button className={view === "list" ? "tab on" : "tab"} onClick={() => setView("list")}>Receipts</button>
          <button className={view === "new" ? "tab on" : "tab"} onClick={() => setView("new")}>New receipt</button>
          <button className="tab" onClick={() => { localStorage.removeItem("token"); setToken(null); }}>Sign out</button>
        </nav>
      </header>
      <main>
        {view === "list" ? (
          <ReceiptList refresh={refresh} onOpen={setPreview} />
        ) : (
          <ReceiptForm onCreated={(r) => { setRefresh((n) => n + 1); setView("list"); setPreview(r); }} />
        )}
      </main>
      {preview && <PreviewModal receipt={preview} onClose={() => setPreview(null)} />}
    </>
  );
}
