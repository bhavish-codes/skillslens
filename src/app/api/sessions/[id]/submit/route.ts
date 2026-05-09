import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Session, Response, Report, Interview } from "@/models";
import { generateAIInsights } from "@/lib/groq";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const body = await req.json();
    const { responses } = body;

    const session = await Session.findById(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const interview = await Interview.findById(session.interviewId);
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    await Promise.all(
      responses.map((r: { questionIndex: number; transcript: string; duration: number }) =>
        Response.create({
          sessionId: session._id,
          questionIndex: r.questionIndex,
          transcript: r.transcript,
          duration: r.duration,
        })
      )
    );

    session.status = "completed";
    session.completedAt = new Date();
    await session.save();

    const allTranscripts = responses.map((r: any) => r.transcript).join(" ");
    const wordCount = allTranscripts.split(/\s+/).length;
    const communication = Math.min(100, 55 + Math.floor(wordCount / 10) + Math.floor(Math.random() * 15));
    const technical = Math.min(100, 50 + Math.floor(Math.random() * 35));
    const confidence = Math.min(100, 55 + Math.floor(Math.random() * 30));
    const problemSolving = Math.min(100, 52 + Math.floor(Math.random() * 33));
    const culturalFit = Math.min(100, 60 + Math.floor(Math.random() * 25));
    const overallScore = Math.round((communication + technical + confidence + problemSolving + culturalFit) / 5);
    const sentimentScore = communication > 70 && confidence > 70 ? "Highly Positive" : communication > 60 ? "Positive" : "Neutral";

    const transcriptThemes = allTranscripts.substring(0, 200) || "general professional topics";
    const insights = await generateAIInsights(
      interview.role,
      { communication, problemSolving, confidence, technical, culturalFit },
      sentimentScore,
      transcriptThemes
    );

    const report = await Report.create({
      sessionId: session._id,
      overallScore,
      communication,
      problemSolving,
      confidence,
      technical,
      culturalFit,
      sentiment: sentimentScore,
      insights,
      status: "ready",
    });

    return NextResponse.json({ report, session }, { status: 200 });
  } catch (error) {
    console.error("POST /api/sessions/[id]/submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
