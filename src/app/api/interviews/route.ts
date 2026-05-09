import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { Interview } from "@/models";
import { randomBytes } from "crypto";

// GET /api/interviews — list all interviews for the recruiter
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const interviews = await Interview.find({
      recruiterId: (session.user as any).id,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ interviews });
  } catch (error) {
    console.error("GET /api/interviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/interviews — create a new interview
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, role, questions, type } = body;

    if (!title || !role || !questions?.length) {
      return NextResponse.json(
        { error: "Title, role, and at least one question are required." },
        { status: 400 }
      );
    }

    await dbConnect();
    const linkToken = randomBytes(16).toString("hex");
    const interview = await Interview.create({
      recruiterId: (session.user as any).id,
      title,
      role,
      questions,
      type: type || "video",
      linkToken,
    });

    return NextResponse.json({ interview, linkToken }, { status: 201 });
  } catch (error) {
    console.error("POST /api/interviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
