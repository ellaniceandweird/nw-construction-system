/**
 * Opens a new window containing only the given HTML, with its own
 * self-contained styles, and triggers the browser's print dialog on it.
 *
 * This is deliberately independent of the app's own Tailwind print
 * utilities (print:hidden / print:block) — those rely on the app's CSS
 * bundle being built/cached correctly, which didn't reliably show
 * content when tested. A separate print window has no such dependency:
 * it's a plain HTML document with inline styles, so there's nothing for
 * a build cache to get wrong.
 */
export function openPrintWindow(title: string, bodyHtml: string) {
  const printWindow = window.open("", "_blank", "width=900,height=1100");
  if (!printWindow) {
    alert("Your browser blocked the print window. Please allow pop-ups for this site and try again.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Arial, sans-serif;
            color: #111827;
            padding: 32px;
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
          h1 { font-size: 18px; margin: 0 0 4px; }
          h2 { font-size: 15px; margin: 20px 0 8px; }
          h3 { font-size: 13px; margin: 16px 0 6px; text-transform: uppercase; letter-spacing: 0.02em; }
          p { margin: 0 0 4px; font-size: 13px; color: #4b5563; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 8px; }
          th, td { text-align: left; padding: 6px 10px 6px 0; border-bottom: 1px solid #e5e7eb; }
          th { color: #6b7280; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.03em; border-bottom: 1px solid #111827; }
          .right { text-align: right; }
          .total-row td { border-top: 2px solid #111827; border-bottom: none; font-weight: 700; font-size: 13px; padding-top: 8px; }
          .subtotal-row td { color: #4b5563; }
          .header { border-bottom: 1px solid #111827; padding-bottom: 12px; margin-bottom: 16px; }
          @media print {
            body { padding: 0; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        </style>
      </head>
      <body>${bodyHtml}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();

  // Give the new document a moment to finish laying out before printing.
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
