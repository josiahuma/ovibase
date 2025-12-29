"use client";

import { useState } from "react";
import { exportElementToPdf } from "@/src/lib/exportPdf";

export default function ExportPdfButton({
  getElement,
  filename,
  title,
  className = "",
}: {
  getElement: () => HTMLElement | null;
  filename: string;
  title?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  const onExport = async () => {
    const el = getElement();
    if (!el) return;

    setBusy(true);
    try {
      await exportElementToPdf({ element: el, filename, title });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onExport}
      disabled={busy}
      className={
        "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed " +
        className
      }
      title="Export this report as a PDF"
    >
      {busy ? "Exporting…" : "Export PDF"}
    </button>
  );
}
