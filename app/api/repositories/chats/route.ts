import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const githubId = searchParams.get("repositoryId");

    if (!githubId) {
      return NextResponse.json(
        { error: "repositoryId is required" },
        { status: 400 },
      );
    }

    const repository = await prisma.repository.findFirst({
      where: {
        githubId,
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!repository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 },
      );
    }

    // Step 2: Use Prisma ID to fetch chat history.
    const chats = await prisma.chatConversation.findMany({
      where: {
        repositoryId: repository.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    return NextResponse.json({ chats });
  } catch (error) {
    console.error("Get chats error:", error);

    return NextResponse.json(
      { error: "Could not load chats" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repositoryId, title } = await request.json();

    if (typeof repositoryId !== "string" || !repositoryId.trim()) {
      return NextResponse.json(
        { error: "repositoryId is required" },
        { status: 400 },
      );
    }

    // Find the repository using its GitHub ID.
    // Also retrieve its actual Neon/Prisma ID.
    const repository = await prisma.repository.findFirst({
      where: {
        githubId: repositoryId,
        userId: session.user.id,
      },
      select: {
        id: true,
        githubId: true,
      },
    });

    if (!repository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 },
      );
    }

    // IMPORTANT: Use repository.id, NOT repositoryId.
    const chat = await prisma.chatConversation.create({
      data: {
        repositoryId: repository.id,
        title:
          typeof title === "string" && title.trim()
            ? title.trim().slice(0, 100)
            : "New chat",
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ chat }, { status: 201 });
  } catch (error) {
    console.error("Create chat error:", error);

    return NextResponse.json(
      { error: "Could not create chat" },
      { status: 500 },
    );
  }
}