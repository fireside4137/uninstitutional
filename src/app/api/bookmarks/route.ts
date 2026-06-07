import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("GET Bookmarks error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { itemId, itemType } = await req.json();
    if (!itemId || !itemType) {
      return NextResponse.json({ error: "Bad Request. Missing itemId or itemType." }, { status: 400 });
    }

    // Check if the bookmark already exists
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_itemType_itemId: {
          userId,
          itemType,
          itemId,
        },
      },
    });

    if (existing) {
      // Delete existing bookmark
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, bookmarked: false });
    } else {
      // Create new bookmark
      const created = await prisma.bookmark.create({
        data: {
          userId,
          itemType,
          itemId,
        },
      });
      return NextResponse.json({ success: true, bookmarked: true, data: created });
    }
  } catch (error) {
    console.error("POST Toggle Bookmark error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
