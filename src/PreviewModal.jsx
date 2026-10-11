import { useEffect, useState } from "react";
import api from "./api";

export default function PreviewModal({ receipt, onClose }) {
  const [blob, setBlob] = useState(null);
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState("");
  const filename = `receipt-${receipt.receipt_no}.pdf`;

  useEffect(() => {
    let objUrl;
    api.get(`/receipts/${receipt.id}/pdf/`, { responseType: "blob" })
      .then(({ data }) => { setBlob(data); objUrl = URL.createObjectURL(data); setUrl(objUrl); })
      .catch(() => setMsg("Could not load the PDF."));
    return () => objUrl && URL.revokeObjectURL(objUrl);
  }, [receipt.id]);

  const share = async () => {
    const file = new File([blob], filename, { type: "application/pdf" });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: `Receipt ${receipt.receipt_no}` }); } catch { /* cancelled */ }
    } else {
      // Desktop fallback: download the file, then open WhatsApp with a message to attach it to
      const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
      const text = `Receipt No. ${receipt.receipt_no} – Rs. ${Number(receipt.amount).toLocaleString("en-IN")} received from ${receipt.received_from}. Vijayam Institute, Nagercoil.`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
      setMsg("PDF downloaded. Attach it in the WhatsApp chat.");
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <strong>Receipt {receipt.receipt_no} · {receipt.received_from}</strong>
          <button className="btn small" onClick={onClose}>Close</button>
        </div>
        {url ? <iframe title="Receipt" src={url} /> : <p className="empty">{msg || "Loading receipt…"}</p>}
        <div className="modal-foot">
          <span className="muted">{url && msg}</span>
          <div>
            <a className={`btn ${url ? "" : "disabled"}`} href={url} download={filename}>Download PDF</a>
            <button className="btn primary" disabled={!blob} onClick={share}>Share</button>
          </div>
        </div>
      </div>
    </div>
  );
}
