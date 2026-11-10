
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 1. Get all repositories belonging to this user.
    const repositories = await prisma.repository.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });

    const repositoryIds = repositories.map((repo) => repo.id);

    // If the user has no repositories, all repository-related
    // statistics will be zero.
    if (repositoryIds.length === 0) {
      return NextResponse.json({
        repoCount: 0,
        messagesSent: 0,
        messagesReceived: 0,
        codeEntityCount: 0,
      });
    }

    // 2. Count messages and indexed code entities.
    const [
      messagesSent,
      messagesReceived,
      codeEntityCount,
    ] = await Promise.all([
      prisma.chatMessage.count({
        where: {
          role: "user",
          conversation: {
            repositoryId: {
              in: repositoryIds,
            },
          },
        },
      }),

      prisma.chatMessage.count({
        where: {
          role: "assistant",
          conversation: {
            repositoryId: {
              in: repositoryIds,
            },
          },
        },
      }),

      prisma.codeEntity.count({
        where: {
          repositoryId: {
            in: repositoryIds,
          },
        },
      }),
    ]);

    return NextResponse.json({
      repoCount: repositories.length,
      messagesSent,
      messagesReceived,
      codeEntityCount,
    });

  } catch (error) {
    console.error("Profile stats error:", error);

    return NextResponse.json(
      { error: "Could not load profile statistics" },
      { status: 500 }
    );
  }
}
