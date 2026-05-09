import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { Interview, Session, Report } from "@/models";

// GET /api/dashboard/stats — dashboard KPI stats for the logged-in recruiter
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const recruiterId = (session.user as any).id;

    const interviews = await Interview.find({ recruiterId });
    const interviewIds = interviews.map(i => i._id);

    const sessions = await Session.find({ interviewId: { $in: interviewIds } });
    const completedSessions = sessions.filter(s => s.status === "completed");

    const reports = await Report.find({
      sessionId: { $in: completedSessions.map(s => s._id) }
    });

    const avgScore = reports.length
      ? Math.round(reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length)
      : 0;
    const completionRate = sessions.length
      ? Math.round((completedSessions.length / sessions.length) * 100)
      : 0;

    // Weekly volume for chart (last 7 days)
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyVolume = days.map((name, i) => {
      const count = sessions.filter(s => {
        if (!s.startedAt) return false;
        const day = new Date(s.startedAt).getDay();
        return day === (i + 1) % 7;
      }).length;
      return { name, interviews: count };
    });

    return NextResponse.json({
      totalInterviews: sessions.length,
      completionRate,
      avgScore,
      timeToFeedback: "~2m",
      weeklyVolume,
      recentCandidates: completedSessions.slice(0, 5).map(s => {
        const report = reports.find(r => r.sessionId.toString() === s._id.toString());
        return {
          sessionId: s._id.toString(),
          name: s.candidateName,
          email: s.candidateEmail,
          score: report?.overallScore ?? 0,
          sentiment: report?.sentiment ?? "N/A",
          completedAt: s.completedAt,
        };
      }),
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
