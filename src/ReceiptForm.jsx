import { useState } from "react";
import api from "./api";

const today = () => new Date().toISOString().slice(0, 10);

export default function ReceiptForm({ onCreated }) {
  const [f, setF] = useState({ date: today(), received_from: "", amount: "", towards: "", balance: "0", payment_mode: "cash", cashier: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErrors({});
    try { onCreated((await api.post("/receipts/", f)).data); }
    catch (err) { setErrors(err.response?.data || { detail: "Could not save the receipt. Check your connection." }); }
    finally { setBusy(false); }
  };
  const err = (k) => errors[k] && <span className="error">{[].concat(errors[k]).join(" ")}</span>;

  return (
    <form className="panel form" onSubmit={submit}>
      <h2>New receipt</h2>
      <p className="muted">The receipt number and amount in words are filled in automatically.</p>
      <label className="wide">Received with thanks from M/s.
        <input required value={f.received_from} onChange={set("received_from")} />{err("received_from")}</label>
      <label className="wide">Towards (course / fee)
        <input required placeholder="e.g. MBA Finance" value={f.towards} onChange={set("towards")} />{err("towards")}</label>
      <label>Amount (Rs.)
        <input required type="number" min="1" step="0.01" value={f.amount} onChange={set("amount")} />{err("amount")}</label>
      <label>Balance (Rs.)
        <input type="number" min="0" step="0.01" value={f.balance} onChange={set("balance")} />{err("balance")}</label>
      <label>Date
        <input required type="date" value={f.date} onChange={set("date")} />{err("date")}</label>
      <label>Payment mode
        <select value={f.payment_mode} onChange={set("payment_mode")}>
          <option value="cash">Cash</option><option value="gpay">GPay / UPI</option>
          <option value="cheque">Cheque</option><option value="bank">Bank transfer</option>
        </select></label>
      <label className="wide">Cashier name <span className="muted">(defaults to the signed-in user)</span>
        <input value={f.cashier} onChange={set("cashier")} /></label>
      {errors.detail && <p className="error wide">{errors.detail}</p>}
      <button className="btn primary wide" disabled={busy}>{busy ? "Saving…" : "Save and generate receipt"}</button>
    </form>
  );
}
