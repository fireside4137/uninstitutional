/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const category = searchParams.get("category"); // optional filter: e.g. "ukpsc" or "ukssc"

    const data: Record<string, any> = {};

    if (type === "all" || type === "calendar") {
      data.calendar = await prisma.examEvent.findMany({
        where: category ? { examCategory: category.toUpperCase() } : undefined,
        orderBy: { formCloseDate: "asc" },
      });
    }

    if (type === "all" || type === "links") {
      data.links = await prisma.officialLink.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    if (type === "all" || type === "notifications") {
      data.notifications = await prisma.notification.findMany({
        orderBy: { publishDate: "desc" },
      });
    }

    if (type === "all" || type === "answerkeys") {
      data.answerKeys = await prisma.answerKey.findMany({
        orderBy: { releaseDate: "desc" },
      });
    }

    if (type === "all" || type === "maps") {
      data.maps = await prisma.mapResource.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    if (type === "all" || type === "govt") {
      data.govtLearning = await prisma.govtLearningLink.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    if (type === "all" || type === "pyqs") {
      data.pyqs = await prisma.pYQPaper.findMany({
        where: category ? { examCategory: category.toUpperCase() } : undefined,
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      });
    }

    if (type === "all" || type === "currentaffairs") {
      data.currentAffairs = await prisma.currentAffairsEvent.findMany({
        orderBy: { eventDate: "desc" },
      });
    }

    if (type === "all" || type === "magazines") {
      data.magazines = await prisma.magazineResource.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET Information Hub error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    // Verify user role is ADMIN
    const userRole = (session?.user as any)?.role;
    if (!session?.user?.id || userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { type, payload } = await req.json();
    if (!type || !payload) {
      return NextResponse.json({ error: "Bad Request. Missing type or payload." }, { status: 400 });
    }

    const creatorName = session.user.name || "Admin";

    let result;

    switch (type) {
      case "calendar":
        result = await prisma.examEvent.create({
          data: {
            titleEn: payload.titleEn,
            titleHi: payload.titleHi,
            examCategory: payload.examCategory.toUpperCase(),
            authorityEn: payload.authorityEn,
            authorityHi: payload.authorityHi,
            formOpenDate: payload.formOpenDate ? new Date(payload.formOpenDate) : null,
            formCloseDate: payload.formCloseDate ? new Date(payload.formCloseDate) : null,
            examDate: payload.examDate ? new Date(payload.examDate) : null,
            admitCardDate: payload.admitCardDate ? new Date(payload.admitCardDate) : null,
            applyUrl: payload.applyUrl || null,
            notificationUrl: payload.notificationUrl || null,
            status: payload.status || "Upcoming",
            createdBy: creatorName,
          },
        });
        break;

      case "link":
        result = await prisma.officialLink.create({
          data: {
            titleEn: payload.titleEn,
            titleHi: payload.titleHi,
            url: payload.url,
            authorityEn: payload.authorityEn,
            authorityHi: payload.authorityHi,
            category: payload.category || "Official Portal",
            isTrusted: payload.isTrusted !== undefined ? payload.isTrusted : true,
            createdBy: creatorName,
          },
        });
        break;

      case "notification":
        result = await prisma.notification.create({
          data: {
            titleEn: payload.titleEn,
            titleHi: payload.titleHi,
            contentEn: payload.contentEn || null,
            contentHi: payload.contentHi || null,
            linkUrl: payload.linkUrl || null,
            category: payload.category || "General",
            isNew: payload.isNew !== undefined ? payload.isNew : true,
            publishDate: payload.publishDate ? new Date(payload.publishDate) : new Date(),
            createdBy: creatorName,
          },
        });
        break;

      case "answerkey":
        result = await prisma.answerKey.create({
          data: {
            titleEn: payload.titleEn,
            titleHi: payload.titleHi,
            examNameEn: payload.examNameEn,
            examNameHi: payload.examNameHi,
            pdfUrl: payload.pdfUrl || null,
            officialLink: payload.officialLink || null,
            releaseDate: payload.releaseDate ? new Date(payload.releaseDate) : new Date(),
            isOfficial: payload.isOfficial !== undefined ? payload.isOfficial : true,
            createdBy: creatorName,
          },
        });
        break;

      case "map":
        result = await prisma.mapResource.create({
          data: {
            titleEn: payload.titleEn,
            titleHi: payload.titleHi,
            descriptionEn: payload.descriptionEn || null,
            descriptionHi: payload.descriptionHi || null,
            imageUrl: payload.imageUrl,
            pdfUrl: payload.pdfUrl || null,
            category: payload.category || "District Maps",
            createdBy: creatorName,
          },
        });
        break;

      case "govt":
        result = await prisma.govtLearningLink.create({
          data: {
            titleEn: payload.titleEn,
            titleHi: payload.titleHi,
            descriptionEn: payload.descriptionEn || null,
            descriptionHi: payload.descriptionHi || null,
            url: payload.url,
            provider: payload.provider || "SWAYAM",
            subjectEn: payload.subjectEn,
            subjectHi: payload.subjectHi,
            createdBy: creatorName,
          },
        });
        break;

      case "pyq":
        result = await prisma.pYQPaper.create({
          data: {
            titleEn: payload.titleEn,
            titleHi: payload.titleHi,
            examName: payload.examName,
            examCategory: payload.examCategory.toUpperCase(),
            year: parseInt(payload.year, 10),
            pdfUrl: payload.pdfUrl || null,
            officialLink: payload.officialLink || null,
            subjectEn: payload.subjectEn || null,
            subjectHi: payload.subjectHi || null,
            createdBy: creatorName,
          },
        });
        break;

      case "currentaffairs":
        result = await prisma.currentAffairsEvent.create({
          data: {
            titleEn: payload.titleEn,
            titleHi: payload.titleHi,
            summaryEn: payload.summaryEn || null,
            summaryHi: payload.summaryHi || null,
            source: payload.source || null,
            sourceUrl: payload.sourceUrl || null,
            category: payload.category || "State",
            eventDate: payload.eventDate ? new Date(payload.eventDate) : new Date(),
            createdBy: creatorName,
          },
        });
        break;

      case "magazine":
        result = await prisma.magazineResource.create({
          data: {
            titleEn: payload.titleEn,
            titleHi: payload.titleHi,
            descriptionEn: payload.descriptionEn || null,
            descriptionHi: payload.descriptionHi || null,
            url: payload.url,
            type: payload.type || "Yojana",
            publishMonth: payload.publishMonth || null,
            createdBy: creatorName,
          },
        });
        break;

      default:
        return NextResponse.json({ error: `Invalid information type: ${type}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("POST Information Hub error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
