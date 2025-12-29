import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function addExportStyle(): HTMLStyleElement {
  // This forces html2canvas to see only basic colors (rgb/hex) and avoids lab()/color()
  // It also neutralizes CSS variables that may resolve to lab().
  const style = document.createElement("style");
  style.setAttribute("data-export-pdf", "true");
  style.textContent = `
    /* Prevent modern color funcs from breaking html2canvas */
    * {
      color: #0f172a !important;
      border-color: #e2e8f0 !important;
      outline-color: #e2e8f0 !important;
      text-decoration-color: #0f172a !important;
      caret-color: #0f172a !important;
      /* Disable filters that sometimes trigger parsing issues */
      filter: none !important;
      backdrop-filter: none !important;
    }

    /* Keep common backgrounds visible */
    body, [data-export-root="true"] {
      background: #ffffff !important;
    }

    /* Cards */
    .shadow, .shadow-sm, .shadow-md, .shadow-lg,
    [class*="shadow"] {
      box-shadow: none !important;
    }
  `;
  document.head.appendChild(style);
  return style;
}

export async function exportElementToPdf(opts: {
  element: HTMLElement;
  filename: string;
  title?: string;
}) {
  const { element, filename, title } = opts;

  // Mark the export root so our CSS can target it
  element.setAttribute("data-export-root", "true");

  // Inject safe export styles temporarily
  const exportStyle = addExportStyle();

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      // Important: ignore Next dev overlay / fixed elements if any
      ignoreElements: (el) => {
        const htmlEl = el as HTMLElement;
        return (
          htmlEl?.id === "__next-build-watcher" ||
          htmlEl?.id === "__next-route-announcer" ||
          htmlEl?.getAttribute?.("data-nextjs-toast") === "true"
        );
      },
      onclone: (doc) => {
        // Ensure clone also has white background
        doc.documentElement.style.background = "#ffffff";
        doc.body.style.background = "#ffffff";
      },
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let cursorY = 28;

    if (title) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text(title, 40, cursorY);
      cursorY += 18;
    }

    const margin = 40;
    const usableWidth = pageWidth - margin * 2;

    const imgWidth = usableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let positionY = cursorY;
    pdf.addImage(imgData, "PNG", margin, positionY, imgWidth, imgHeight);

    let remaining = imgHeight - (pageHeight - positionY - margin);

    while (remaining > 0) {
      pdf.addPage();
      const yOffset = -(imgHeight - remaining) + margin;
      pdf.addImage(imgData, "PNG", margin, yOffset, imgWidth, imgHeight);
      remaining -= pageHeight - margin * 2;
    }

    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
  } finally {
    // Cleanup
    exportStyle.remove();
    element.removeAttribute("data-export-root");
  }
}
