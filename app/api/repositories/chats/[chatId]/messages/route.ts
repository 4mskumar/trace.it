
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { searchCodeChunks } from "@/lib/ai/search";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ chatId: string }>;
};

type SearchResult = {
  id: string;
  content: string;
  filePath: string;
  startLine: number;
  endLine: number;
  similarity: number;
};

function createAssistantReply(
  question: string,
  results: SearchResult[]
): string {
  if (results.length === 0) {
    return (
      `I searched the repository for "${question}", but couldn't find a sufficiently relevant code section.\n\n` +
      "Try asking about a specific function, file, API endpoint, class, or feature. " +
      "You can also use the exact name of a component or function."
    );
  }

  const best = results[0];
  const files = [...new Set(results.map((result) => result.filePath))];

  const locations = results
    .slice(0, 5)
    .map(
      (result, index) =>
        `${index + 1}. ${result.filePath} (lines ${result.startLine}-${result.endLine})`
    )
    .join("\n");

  const confidence = (best.similarity * 100).toFixed(1);

  return (
    `I searched the repository for "${question}".\n\n` +
    `I found ${results.length} relevant code section(s) across ${files.length} file(s).\n\n` +
    `The strongest match is in ${best.filePath}, lines ${best.startLine}-${best.endLine}, ` +
    `with a similarity score of ${confidence}%.\n\n` +
    `Relevant locations:\n${locations}\n\n` +
    "I've restored the retrieved code in the code panel. Select any result to inspect its snippet.\n\n" +
    "Note: these are retrieved code matches, not a complete explanation of the repository."
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    const body = await request.json();
    const question =
      typeof body.question === "string" ? body.question.trim() : "";

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const chat = await prisma.chatConversation.findFirst({
      where: {
        id: chatId,
        repository: { userId: session.user.id },
      },
      select: {
        id: true,
        title: true,
        repositoryId: true,
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const chunks = await searchCodeChunks(chat.repositoryId, question);
    const results = chunks as SearchResult[];
    const reply = createAssistantReply(question, results);

    const [userMessage, assistantMessage] = await prisma.$transaction(
      async (tx) => {
        const userMessage = await tx.chatMessage.create({
          data: {
            conversationId: chat.id,
            role: "user",
            content: question,
          },
        });

        const assistantMessage = await tx.chatMessage.create({
          data: {
            conversationId: chat.id,
            role: "assistant",
            content: reply,
            results: results as unknown as Prisma.InputJsonValue,
          },
        });

        await tx.chatConversation.update({
          where: { id: chat.id },
          data: {
            updatedAt: new Date(),
            ...(chat.title === "New chat"
              ? { title: question.slice(0, 60) }
              : {}),
          },
        });

        return [userMessage, assistantMessage];
      }
    );

    return NextResponse.json({
      userMessage,
      assistantMessage: {
        ...assistantMessage,
        results,
      },
    });
  } catch (error) {
    console.error("Send chat message error:", error);
    return NextResponse.json(
      { error: "Could not process your repository question" },
      { status: 500 }
    );
  }
}
