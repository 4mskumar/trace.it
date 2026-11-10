
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { searchCodeChunks } from "@/lib/ai/search";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { repositoryId, question } = body;

    if (
      typeof repositoryId !== "string" ||
      typeof question !== "string" ||
      !question.trim()
    ) {
      return NextResponse.json(
        { error: "repositoryId and question are required" },
        { status: 400 }
      );
    }

    const repository = await prisma.repository.findFirst({
      where: {
        id: repositoryId,
        userId: session.user.id,
      },
      select: { id: true },
    });

    if (!repository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    const chunks = await searchCodeChunks(
      repository.id,
      question.trim()
    );

    return NextResponse.json({
      question,
      results: chunks,
    });
  } catch (error) {
    console.error("Code search failed:", error);

    return NextResponse.json(
      { error: "Code search failed" },
      { status: 500 }
    );
  }
}
