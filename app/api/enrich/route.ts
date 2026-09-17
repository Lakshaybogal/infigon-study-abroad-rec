import { NextRequest, NextResponse } from "next/server";
import { fetchLiveFacts } from "@/lib/gemini";

// In-memory rate limiting map (IP -> timestamps)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local-client";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { universityId, universityName, programName, customQuery } = body;

    if (!universityName || !programName) {
      return NextResponse.json(
        { error: "universityName and programName are required." },
        { status: 400 }
      );
    }

    const liveFact = await fetchLiveFacts(universityName, programName, customQuery);

    return NextResponse.json({
      success: true,
      universityId,
      liveFact,
    });
  } catch (error: any) {
    console.error("Enrich route error:", error);
    return NextResponse.json(
      {
        error: "Failed to enrich programme facts",
        details: error?.message,
        liveFact: {
          tuitionUSD: null,
          deadline: null,
          scholarship: null,
          sources: [],
          fetchedAt: new Date().toISOString(),
          isUnverified: true,
        },
      },
      { status: 500 }
    );
  }
}
