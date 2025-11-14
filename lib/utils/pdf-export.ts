import html2canvas from "html2canvas"
import jsPDF from "jspdf"

/**
 * Export an HTML element to PDF with A4 dimensions
 * @param element - The HTML element to export
 * @param filename - The name of the PDF file (without extension)
 */
export async function exportReportToPDF(
  element: HTMLElement,
  filename: string
): Promise<void> {
  try {
    // A4 dimensions in mm
    const a4Width = 210
    const a4Height = 297

    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    })

    const imgData = canvas.toDataURL("image/png")

    // Calculate dimensions
    const imgWidth = a4Width
    const imgHeight = (canvas.height * a4Width) / canvas.width

    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > a4Width ? "portrait" : "portrait",
      unit: "mm",
      format: "a4",
    })

    let heightLeft = imgHeight
    let position = 0

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= a4Height

    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= a4Height
    }

    // Save PDF
    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw new Error("Failed to generate PDF")
  }
}

/**
 * Print preview for a report
 * @param element - The HTML element to print
 */
export function printReport(element: HTMLElement): void {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    alert("Please allow popups to print the report")
    return
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Report</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          body {
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()

  // Wait for content to load before printing
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}
