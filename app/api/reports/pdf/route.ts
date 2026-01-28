import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { StandardReportPDF } from "@/components/reports/pdf-templates/StandardReportPDF";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth Check (Basic) - Ensure user is logged in
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Body
    const body = await req.json();
    const { report, data } = body;

    if (!report || !report.title) {
      return NextResponse.json({ error: "Invalid report data" }, { status: 400 });
    }

    // 3. Generate PDF Stream
    const stream = await renderToStream(<StandardReportPDF report={ report } data = { data } />);

    // 4. Return Stream response
    // We need to convert the NodeJS ReadableStream to a Web ReadableStream or just use it directly if Next.js supports it (it usually does for native Node streams in App Router if typed correctly, but safer to construct a standard Response).

    // @react-pdf/renderer renderToStream returns a NodeJS.ReadableStream
    // We can convert this to a Web ReadableStream

    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
      cancel() {
        stream.destroy();
      },
    });

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf"`,
      },
    });

  } catch (error) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: (error as Error).message },
      { status: 500 }
    );
  }
}
