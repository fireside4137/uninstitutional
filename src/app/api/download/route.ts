import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      console.warn("[SECURITY WARN] Unauthenticated download attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json({ error: "Bad Request. Missing type or id." }, { status: 400 });
    }

    // Verify user is premium
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, name: true },
    });

    if (!user || !user.isPremium) {
      console.warn(
        `[SECURITY WARN] Unauthorized premium download attempt. User: ${user?.name || "Unknown"} (ID: ${userId}) attempted to download resource type "${type}" with ID "${id}".`
      );
      return NextResponse.json(
        { error: "Forbidden. Premium subscription required to download offline resources." },
        { status: 403 }
      );
    }

    let downloadUrl: string | null = null;

    switch (type) {
      case "map": {
        const map = await prisma.mapResource.findUnique({
          where: { id },
          select: { pdfUrl: true },
        });
        downloadUrl = map?.pdfUrl || null;
        break;
      }
      case "magazine": {
        const magazine = await prisma.magazineResource.findUnique({
          where: { id },
          select: { url: true },
        });
        downloadUrl = magazine?.url || null;
        break;
      }
      case "pyq": {
        const pyq = await prisma.pYQPaper.findUnique({
          where: { id },
          select: { pdfUrl: true },
        });
        downloadUrl = pyq?.pdfUrl || null;
        break;
      }
      default:
        return NextResponse.json({ error: "Invalid resource type." }, { status: 400 });
    }

    if (!downloadUrl) {
      return NextResponse.json({ error: "Resource not found or download link unavailable." }, { status: 404 });
    }

    // Secure server-side redirect to the raw storage link
    return NextResponse.redirect(new URL(downloadUrl));
  } catch (error) {
    console.error("GET Secure Download error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
