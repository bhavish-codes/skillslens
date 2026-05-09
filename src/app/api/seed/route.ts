import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { Interview, Session, Report, Response, User } from "@/models";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

// POST /api/seed — seeds the database with demo data
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Clear existing demo data
    await User.deleteMany({ email: { $in: ["demo@recruiter.com", "alice@recruiter.com"] } });

    // Create demo recruiters
    const pw = await bcrypt.hash("password123", 10);
    const recruiter = await User.create({
      email: "demo@recruiter.com",
      passwordHash: pw,
      name: "Demo Recruiter",
      role: "recruiter",
    });

    // Create demo interviews
    const interviews = await Interview.insertMany([
      {
        recruiterId: recruiter._id,
        title: "Senior Frontend Engineer",
        role: "Frontend Engineer",
        questions: [
          { id: "q1", text: "Tell me about your experience with React and TypeScript.", skill: "Technical", timeLimit: 90 },
          { id: "q2", text: "How do you handle state management in large apps?", skill: "Technical", timeLimit: 60 },
          { id: "q3", text: "Describe a challenging bug you debugged.", skill: "Problem Solving", timeLimit: 90 },
        ],
        type: "video",
        linkToken: randomBytes(16).toString("hex"),
      },
      {
        recruiterId: recruiter._id,
        title: "Product Manager Q2",
        role: "Product Manager",
        questions: [
          { id: "q1", text: "How do you prioritize product features?", skill: "Behavioral", timeLimit: 60 },
          { id: "q2", text: "Walk me through your product development process.", skill: "Communication", timeLimit: 90 },
        ],
        type: "chat",
        linkToken: randomBytes(16).toString("hex"),
      },
    ]);

    // Demo candidates with completed sessions + reports
    const candidatesData = [
      { name: "Sarah Jenkins", email: "sarah@candidate.com", interviewIdx: 0, scores: { communication: 85, technical: 90, confidence: 78, problemSolving: 88, culturalFit: 82, overall: 85, sentiment: "Highly Positive" } },
      { name: "David Chen", email: "david@candidate.com", interviewIdx: 0, scores: { communication: 92, technical: 88, confidence: 91, problemSolving: 90, culturalFit: 89, overall: 90, sentiment: "Highly Positive" } },
      { name: "Maya Patel", email: "maya@candidate.com", interviewIdx: 1, scores: { communication: 74, technical: 70, confidence: 68, problemSolving: 75, culturalFit: 80, overall: 73, sentiment: "Neutral" } },
      { name: "James Wilson", email: "james@candidate.com", interviewIdx: 1, scores: { communication: 88, technical: 82, confidence: 85, problemSolving: 86, culturalFit: 84, overall: 85, sentiment: "Positive" } },
      { name: "Elena Rodriguez", email: "elena@candidate.com", interviewIdx: 0, scores: { communication: 91, technical: 94, confidence: 88, problemSolving: 92, culturalFit: 87, overall: 90, sentiment: "Highly Positive" } },
    ];

    const defaultInsights = [
      [
        { type: "strength", text: "Demonstrated exceptional knowledge of React hooks and modern patterns." },
        { type: "strength", text: "Showed confidence and clarity when explaining complex technical decisions." },
        { type: "improvement", text: "Could improve on providing concrete metrics when discussing past impact." }
      ],
    ];

    for (const candidate of candidatesData) {
      const session = await Session.create({
        interviewId: interviews[candidate.interviewIdx]._id,
        candidateEmail: candidate.email,
        candidateName: candidate.name,
        status: "completed",
        startedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000),
      });

      await Response.create({
        sessionId: session._id,
        questionIndex: 0,
        transcript: `Hello, I have ${Math.floor(Math.random() * 5 + 2)} years of experience and I am very passionate about my work.`,
        duration: 45 + Math.floor(Math.random() * 30),
      });

      await Report.create({
        sessionId: session._id,
        overallScore: candidate.scores.overall,
        communication: candidate.scores.communication,
        problemSolving: candidate.scores.problemSolving,
        confidence: candidate.scores.confidence,
        technical: candidate.scores.technical,
        culturalFit: candidate.scores.culturalFit,
        sentiment: candidate.scores.sentiment,
        insights: defaultInsights[0],
        status: "ready",
      });
    }

    return NextResponse.json({ 
      message: "Demo data seeded successfully!",
      credentials: { email: "demo@recruiter.com", password: "password123" }
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed: " + (error as Error).message }, { status: 500 });
  }
}
