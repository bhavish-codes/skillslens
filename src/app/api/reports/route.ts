import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { Session, Report, Interview } from "@/models";

// GET /api/reports — list all reports for recruiter's interviews
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get all interviews by this recruiter
    const interviews = await Interview.find({ recruiterId: (session.user as any).id });
    const interviewIds = interviews.map(i => i._id);

    // Get all sessions for these interviews
    const sessions = await Session.find({ 
      interviewId: { $in: interviewIds },
      status: "completed"
    }).populate("interviewId");

    // Get reports for these sessions
    const reports = await Report.find({
      sessionId: { $in: sessions.map(s => s._id) }
    });

    // Merge sessions + reports
    const candidateData = sessions.map(s => {
      const report = reports.find(r => r.sessionId.toString() === s._id.toString());
      return {
        sessionId: s._id.toString(),
        candidateName: s.candidateName,
        candidateEmail: s.candidateEmail,
        interviewTitle: (s.interviewId as any)?.title,
        role: (s.interviewId as any)?.role,
        completedAt: s.completedAt,
        report: report ? {
          overallScore: report.overallScore,
          sentiment: report.sentiment,
          status: report.status,
          reportId: report._id.toString(),
        } : null,
      };
    });

    return NextResponse.json({ candidates: candidateData });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
