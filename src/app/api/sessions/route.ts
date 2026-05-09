import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Interview, Session, Response, Report } from "@/models";
import { generateAIInsights } from "@/lib/groq";

// POST /api/sessions — create a new candidate session
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { interviewId, candidateEmail, candidateName } = body;

    if (!interviewId || !candidateEmail || !candidateName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const session = await Session.create({
      interviewId,
      candidateEmail,
      candidateName,
      status: "pending",
      startedAt: new Date(),
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("POST /api/sessions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
