import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createGitHubClient } from "@/lib/github";
import { isCodeFile } from "@/lib/helperFunctions";
import { parseRepositoryFiles } from "@/lib/ast/ingest";
import { parseRepositoryDependencies } from "@/lib/ast/dependencies";
import { createRepositoryChunks } from "@/lib/ast/chunk";
import { generateCodeEmbedding } from "@/lib/ai/embedding";
import { embedRepositoryChunks } from "@/lib/ai/store-embedding";

function isValidTextContent(content: string): boolean {
  // PostgreSQL text fields cannot contain null bytes.
  if (content.includes("\0")) {
    return false;
  }

  return true;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({
        error: "Unauthorized",
      });
    }

    const { owner, repo } = await request.json();

    if (!owner || !repo) {
      throw new Error("Missing credentials");
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github",
      },
    });

    // console.log("GitHub account:", {
    //   found: !!account,
    //   provider: account?.provider,
    //   providerAccountId: account?.providerAccountId,
    //   hasAccessToken: !!account?.access_token,
    //   tokenLength: account?.access_token?.length,
    // });

    if (!account?.access_token) {
      return NextResponse.json({
        error: "Github not connected",
        status: 401,
      });
    }

    const accessToken = (session as any).accessToken;

    const github = createGitHubClient(accessToken);

    const { data: githubRepo } = await github.repos.get({
      //get info about the repo
      owner,
      repo,
    });

    const { data: tree } = await github.git.getTree({
      //files ka info nikalo for eg: pages/page.tsx, pages/page2.tsx
      owner,
      repo,
      tree_sha: githubRepo.default_branch,
      recursive: "true",
    });

    const files = tree.tree.filter((item) => item.type === "blob"); // filter out blob type ke files

    const repository = await prisma.repository.upsert({
      where: {
        githubId: githubRepo.id.toString(),
      },

      update: {
        name: githubRepo.name,
        fullName: githubRepo.full_name,
        description: githubRepo.description,
        url: githubRepo.html_url,
        defaultBranch: githubRepo.default_branch,
        owner: githubRepo.owner.login,
      },

      create: {
        githubId: githubRepo.id.toString(),
        name: githubRepo.name,
        fullName: githubRepo.full_name,
        description: githubRepo.description,
        url: githubRepo.html_url,
        defaultBranch: githubRepo.default_branch,
        owner: githubRepo.owner.login,

        userId: session.user.id,
      },
    });

    const codeFiles = files.filter(
      (file) => file.path && isCodeFile(file.path),
    );

    const fileRecords = [];

    for (const file of codeFiles) {
      try {
        const { data } = await github.repos.getContent({
          owner,
          repo,
          path: file.path!,
          ref: githubRepo.default_branch,
        });

        if ("content" in data && data.content) {
          const content = Buffer.from(data.content, "base64").toString("utf-8");

          // Skip files containing binary null bytes.
          if (!isValidTextContent(content)) {
            console.log(`Skipping binary file: ${file.path}`);
            continue;
          }

          fileRecords.push({
            path: file.path!,
            name: file.path!.split("/").pop()!,
            extension: file.path!.includes(".")
              ? file.path!.split(".").pop()
              : null,
            content,
            repositoryId: repository.id,
          });
        }
      } catch (error) {
        console.error(`Failed to fetch file: ${file.path}`, error);
      }
    }
    await prisma.repositoryFiles.createMany({
      data: fileRecords,
      skipDuplicates: true,
    });

    const entitiesFound = await parseRepositoryFiles(repository.id);

    const dependenciesFound = await parseRepositoryDependencies(repository.id);
    const chunksFound = await createRepositoryChunks(repository.id);
    const embeddingResult = await embedRepositoryChunks(repository.id);

    // 9. Return result
    return NextResponse.json({
      message: "Repository analyzed successfully",
      repository: {
        id: repository.id,
        name: repository.name,
        fullName: repository.fullName,
      },
      filesSaved: fileRecords.length,
      entitiesFound,
      dependenciesFound,
      chunksFound,
      embeddingsCreated: embeddingResult.embeddedCount,
      embeddingBatchLimitReached: embeddingResult.remainingBatchLimitReached,
    });
  } catch (error) {
    console.error("Repository analysis error:", error);

    return NextResponse.json(
      { error: "Failed to analyze repository" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const id = session?.user.id
    const analyzedRepoIds = await prisma.repository.findMany({
      where: {userId: id},
      select: {
        githubId: true,
        updatedAt: true
      }
    })

    return NextResponse.json({session, analyzedRepoIds});
  } catch (error) {
    console.log(error);
  }
}
