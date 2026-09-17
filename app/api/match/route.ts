import { NextRequest, NextResponse } from "next/server";
import { StudentProfile } from "@/lib/types";
import { searchAndMatchProgrammes } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const profile: StudentProfile = await req.json();

    if (!profile) {
      return NextResponse.json(
        { error: "Student profile payload is required." },
        { status: 400 }
      );
    }

    const matches = await searchAndMatchProgrammes(profile);

    return NextResponse.json({
      success: true,
      totalEvaluated: matches.length,
      shortlistedCount: matches.length,
      results: matches,
    });
  } catch (error: any) {
    console.error("Match route error:", error);
    return NextResponse.json(
      { error: "Failed to score university programmes", details: error?.message },
      { status: 500 }
    );
  }
}
