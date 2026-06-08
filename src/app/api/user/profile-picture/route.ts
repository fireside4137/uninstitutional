import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const profilePictureSchema = z.object({
  image: z.string()
    .refine((val) => {
      if (val.startsWith("http://") || val.startsWith("https://")) {
        return true;
      }
      return /^data:image\/(jpeg|jpg|png|webp);base64,/.test(val);
    }, "Invalid image format. Only JPG, PNG, and WEBP are supported.")
    .or(z.literal(""))
    .or(z.null())
    .optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const parsed = profilePictureSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    const { image } = parsed.data;

    // Scalability design: Updates the user record. If we migrate to S3/Supabase storage buckets later,
    // we can perform the file upload inside this handler and save the resulting URL in the DB here
    // without changing the frontend component interfaces.
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image },
      select: { image: true },
    });

    return NextResponse.json({ success: true, image: updatedUser.image });
  } catch (error) {
    console.error("Profile picture API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
