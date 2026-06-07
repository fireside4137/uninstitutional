/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logSecurityEvent } from "@/lib/securityLogger";

// --- Zod Validation Schemas ---
const calendarSchema = z.object({
  titleEn: z.string().min(1, "English Title is required"),
  titleHi: z.string().min(1, "Hindi Title is required"),
  examCategory: z.string().min(1, "Category is required"),
  authorityEn: z.string().min(1, "English Authority is required"),
  authorityHi: z.string().min(1, "Hindi Authority is required"),
  formOpenDate: z.string().nullable().optional(),
  formCloseDate: z.string().nullable().optional(),
  examDate: z.string().nullable().optional(),
  admitCardDate: z.string().nullable().optional(),
  applyUrl: z.string().url().or(z.literal("")).nullable().optional(),
  notificationUrl: z.string().url().or(z.literal("")).nullable().optional(),
  status: z.string().optional(),
});

const linkSchema = z.object({
  titleEn: z.string().min(1, "English Title is required"),
  titleHi: z.string().min(1, "Hindi Title is required"),
  url: z.string().url("Invalid URL format"),
  authorityEn: z.string().min(1, "English Authority is required"),
  authorityHi: z.string().min(1, "Hindi Authority is required"),
  category: z.string().optional(),
  isTrusted: z.boolean().optional(),
});

const notificationSchema = z.object({
  titleEn: z.string().min(1, "English Title is required"),
  titleHi: z.string().min(1, "Hindi Title is required"),
  contentEn: z.string().nullable().optional(),
  contentHi: z.string().nullable().optional(),
  linkUrl: z.string().url().or(z.literal("")).nullable().optional(),
  category: z.string().optional(),
  isNew: z.boolean().optional(),
  publishDate: z.string().nullable().optional(),
});

const answerkeySchema = z.object({
  titleEn: z.string().min(1, "English Title is required"),
  titleHi: z.string().min(1, "Hindi Title is required"),
  examNameEn: z.string().min(1, "English Exam Name is required"),
  examNameHi: z.string().min(1, "Hindi Exam Name is required"),
  pdfUrl: z.string().url().or(z.literal("")).nullable().optional(),
  officialLink: z.string().url().or(z.literal("")).nullable().optional(),
  releaseDate: z.string().nullable().optional(),
  isOfficial: z.boolean().optional(),
});

const mapSchema = z.object({
  titleEn: z.string().min(1, "English Title is required"),
  titleHi: z.string().min(1, "Hindi Title is required"),
  descriptionEn: z.string().nullable().optional(),
  descriptionHi: z.string().nullable().optional(),
  imageUrl: z.string().url("Invalid Image URL format"),
  pdfUrl: z.string().url().or(z.literal("")).nullable().optional(),
  category: z.string().optional(),
});

const govtSchema = z.object({
  titleEn: z.string().min(1, "English Title is required"),
  titleHi: z.string().min(1, "Hindi Title is required"),
  descriptionEn: z.string().nullable().optional(),
  descriptionHi: z.string().nullable().optional(),
  url: z.string().url("Invalid Swayam URL format"),
  provider: z.string().optional(),
  subjectEn: z.string().min(1, "English Subject is required"),
  subjectHi: z.string().min(1, "Hindi Subject is required"),
});

const pyqSchema = z.object({
  titleEn: z.string().min(1, "English Title is required"),
  titleHi: z.string().min(1, "Hindi Title is required"),
  examName: z.string().min(1, "Exam Name is required"),
  examCategory: z.string().min(1, "Exam Category is required"),
  year: z.union([z.number(), z.string()]),
  pdfUrl: z.string().url().or(z.literal("")).nullable().optional(),
  officialLink: z.string().url().or(z.literal("")).nullable().optional(),
  subjectEn: z.string().nullable().optional(),
  subjectHi: z.string().nullable().optional(),
});

const currentaffairsSchema = z.object({
  titleEn: z.string().min(1, "English Headline is required"),
  titleHi: z.string().min(1, "Hindi Headline is required"),
  summaryEn: z.string().nullable().optional(),
  summaryHi: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  sourceUrl: z.string().url().or(z.literal("")).nullable().optional(),
  category: z.string().optional(),
  eventDate: z.string().nullable().optional(),
});

const magazineSchema = z.object({
  titleEn: z.string().min(1, "English Title is required"),
  titleHi: z.string().min(1, "Hindi Title is required"),
  descriptionEn: z.string().nullable().optional(),
  descriptionHi: z.string().nullable().optional(),
  url: z.string().url("Invalid Magazine URL format"),
  type: z.string().optional(),
  publishMonth: z.string().nullable().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    let isPremium = false;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isPremium: true },
      });
      isPremium = !!user?.isPremium;
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const category = searchParams.get("category");

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
      const mapsData = await prisma.mapResource.findMany({
        orderBy: { createdAt: "desc" },
      });
      data.maps = mapsData.map((m) => ({
        ...m,
        // Securely redact premium file download link, returning a proxy or null
        pdfUrl: m.pdfUrl
          ? (isPremium ? `/api/download?type=map&id=${m.id}` : null)
          : null,
      }));
    }

    if (type === "all" || type === "govt") {
      data.govtLearning = await prisma.govtLearningLink.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    if (type === "all" || type === "pyqs") {
      const pyqsData = await prisma.pYQPaper.findMany({
        where: category ? { examCategory: category.toUpperCase() } : undefined,
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      });
      data.pyqs = pyqsData.map((p) => ({
        ...p,
        // Securely redact premium file download link, returning a proxy or null
        pdfUrl: p.pdfUrl
          ? (isPremium ? `/api/download?type=pyq&id=${p.id}` : null)
          : null,
      }));
    }

    if (type === "all" || type === "currentaffairs") {
      data.currentAffairs = await prisma.currentAffairsEvent.findMany({
        orderBy: { eventDate: "desc" },
      });
    }

    if (type === "all" || type === "magazines") {
      const magazinesData = await prisma.magazineResource.findMany({
        orderBy: { createdAt: "desc" },
      });
      data.magazines = magazinesData.map((m) => ({
        ...m,
        // Securely redact premium file download link, returning a proxy or null
        url: m.url
          ? (isPremium ? `/api/download?type=magazine&id=${m.id}` : null)
          : null,
      }));
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
    const userRole = (session?.user as any)?.role;

    if (!session?.user?.id || userRole !== "ADMIN") {
      await logSecurityEvent({
        userId: session?.user?.id || null,
        email: session?.user?.email || null,
        eventType: "UNAUTHORIZED_ADMIN_ACCESS",
        severity: "HIGH",
        route: "/api/information",
        metadata: {
          userName: session?.user?.name || "Unknown",
        },
      });
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { type, payload } = await req.json();
    if (!type || !payload) {
      return NextResponse.json({ error: "Bad Request. Missing type or payload." }, { status: 400 });
    }

    // --- Server-side Schema Validation with Zod ---
    let validatedPayload: any;
    try {
      switch (type) {
        case "calendar":
          validatedPayload = calendarSchema.parse(payload);
          break;
        case "link":
          validatedPayload = linkSchema.parse(payload);
          break;
        case "notification":
          validatedPayload = notificationSchema.parse(payload);
          break;
        case "answerkey":
          validatedPayload = answerkeySchema.parse(payload);
          break;
        case "map":
          validatedPayload = mapSchema.parse(payload);
          break;
        case "govt":
          validatedPayload = govtSchema.parse(payload);
          break;
        case "pyq":
          validatedPayload = pyqSchema.parse(payload);
          break;
        case "currentaffairs":
          validatedPayload = currentaffairsSchema.parse(payload);
          break;
        case "magazine":
          validatedPayload = magazineSchema.parse(payload);
          break;
        default:
          return NextResponse.json({ error: `Invalid information type: ${type}` }, { status: 400 });
      }
    } catch (validationError: any) {
      return NextResponse.json(
        { error: validationError.errors?.[0]?.message || "Validation failed for payload." },
        { status: 400 }
      );
    }

    const creatorName = session.user.name || "Admin";
    let result;

    switch (type) {
      case "calendar":
        result = await prisma.examEvent.create({
          data: {
            titleEn: validatedPayload.titleEn,
            titleHi: validatedPayload.titleHi,
            examCategory: validatedPayload.examCategory.toUpperCase(),
            authorityEn: validatedPayload.authorityEn,
            authorityHi: validatedPayload.authorityHi,
            formOpenDate: validatedPayload.formOpenDate ? new Date(validatedPayload.formOpenDate) : null,
            formCloseDate: validatedPayload.formCloseDate ? new Date(validatedPayload.formCloseDate) : null,
            examDate: validatedPayload.examDate ? new Date(validatedPayload.examDate) : null,
            admitCardDate: validatedPayload.admitCardDate ? new Date(validatedPayload.admitCardDate) : null,
            applyUrl: validatedPayload.applyUrl || null,
            notificationUrl: validatedPayload.notificationUrl || null,
            status: validatedPayload.status || "Upcoming",
            createdBy: creatorName,
          },
        });
        break;

      case "link":
        result = await prisma.officialLink.create({
          data: {
            titleEn: validatedPayload.titleEn,
            titleHi: validatedPayload.titleHi,
            url: validatedPayload.url,
            authorityEn: validatedPayload.authorityEn,
            authorityHi: validatedPayload.authorityHi,
            category: validatedPayload.category || "Official Portal",
            isTrusted: validatedPayload.isTrusted !== undefined ? validatedPayload.isTrusted : true,
            createdBy: creatorName,
          },
        });
        break;

      case "notification":
        result = await prisma.notification.create({
          data: {
            titleEn: validatedPayload.titleEn,
            titleHi: validatedPayload.titleHi,
            contentEn: validatedPayload.contentEn || null,
            contentHi: validatedPayload.contentHi || null,
            linkUrl: validatedPayload.linkUrl || null,
            category: validatedPayload.category || "General",
            isNew: validatedPayload.isNew !== undefined ? validatedPayload.isNew : true,
            publishDate: validatedPayload.publishDate ? new Date(validatedPayload.publishDate) : new Date(),
            createdBy: creatorName,
          },
        });
        break;

      case "answerkey":
        result = await prisma.answerKey.create({
          data: {
            titleEn: validatedPayload.titleEn,
            titleHi: validatedPayload.titleHi,
            examNameEn: validatedPayload.examNameEn,
            examNameHi: validatedPayload.examNameHi,
            pdfUrl: validatedPayload.pdfUrl || null,
            officialLink: validatedPayload.officialLink || null,
            releaseDate: validatedPayload.releaseDate ? new Date(validatedPayload.releaseDate) : new Date(),
            isOfficial: validatedPayload.isOfficial !== undefined ? validatedPayload.isOfficial : true,
            createdBy: creatorName,
          },
        });
        break;

      case "map":
        result = await prisma.mapResource.create({
          data: {
            titleEn: validatedPayload.titleEn,
            titleHi: validatedPayload.titleHi,
            descriptionEn: validatedPayload.descriptionEn || null,
            descriptionHi: validatedPayload.descriptionHi || null,
            imageUrl: validatedPayload.imageUrl,
            pdfUrl: validatedPayload.pdfUrl || null,
            category: validatedPayload.category || "District Maps",
            createdBy: creatorName,
          },
        });
        break;

      case "govt":
        result = await prisma.govtLearningLink.create({
          data: {
            titleEn: validatedPayload.titleEn,
            titleHi: validatedPayload.titleHi,
            descriptionEn: validatedPayload.descriptionEn || null,
            descriptionHi: validatedPayload.descriptionHi || null,
            url: validatedPayload.url,
            provider: validatedPayload.provider || "SWAYAM",
            subjectEn: validatedPayload.subjectEn,
            subjectHi: validatedPayload.subjectHi,
            createdBy: creatorName,
          },
        });
        break;

      case "pyq":
        result = await prisma.pYQPaper.create({
          data: {
            titleEn: validatedPayload.titleEn,
            titleHi: validatedPayload.titleHi,
            examName: validatedPayload.examName,
            examCategory: validatedPayload.examCategory.toUpperCase(),
            year: typeof validatedPayload.year === "string" ? parseInt(validatedPayload.year, 10) : validatedPayload.year,
            pdfUrl: validatedPayload.pdfUrl || null,
            officialLink: validatedPayload.officialLink || null,
            subjectEn: validatedPayload.subjectEn || null,
            subjectHi: validatedPayload.subjectHi || null,
            createdBy: creatorName,
          },
        });
        break;

      case "currentaffairs":
        result = await prisma.currentAffairsEvent.create({
          data: {
            titleEn: validatedPayload.titleEn,
            titleHi: validatedPayload.titleHi,
            summaryEn: validatedPayload.summaryEn || null,
            summaryHi: validatedPayload.summaryHi || null,
            source: validatedPayload.source || null,
            sourceUrl: validatedPayload.sourceUrl || null,
            category: validatedPayload.category || "State",
            eventDate: validatedPayload.eventDate ? new Date(validatedPayload.eventDate) : new Date(),
            createdBy: creatorName,
          },
        });
        break;

      case "magazine":
        result = await prisma.magazineResource.create({
          data: {
            titleEn: validatedPayload.titleEn,
            titleHi: validatedPayload.titleHi,
            descriptionEn: validatedPayload.descriptionEn || null,
            descriptionHi: validatedPayload.descriptionHi || null,
            url: validatedPayload.url,
            type: validatedPayload.type || "Yojana",
            publishMonth: validatedPayload.publishMonth || null,
            createdBy: creatorName,
          },
        });
        break;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("POST Information Hub error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
