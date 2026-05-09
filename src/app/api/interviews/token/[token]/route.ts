import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Interview } from "@/models";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    await dbConnect();
    const interview = await Interview.findOne({ linkToken: token });
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }
    return NextResponse.json({ interview });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
