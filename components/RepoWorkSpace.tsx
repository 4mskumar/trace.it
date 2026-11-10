"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  Bot,
  FileCode2,
  GitBranch,
  Loader2,
  MessageSquare,
  Plus,
  SendHorizontal,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type SearchResult = {
  id: string;
  content: string;
  filePath: string;
  startLine: number;
  endLine: number;
  similarity: number;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  results?: SearchResult[] | null;
  createdAt: string;
};

type ChatSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
};

type RepoWorkspaceProps = {
  owner: string;
  repo: string;
  repositoryId: string;
};


const SUGGESTIONS = [
  "Where is authentication handled?",
  "Where is state management in this repo?",
  "Explain the main API endpoints",
];


export default function RepoWorkspace({
  owner,
  repo,
  repositoryId,
}: RepoWorkspaceProps) {
  /* ------------------------------- Chat state ----------------------------- */
  console.log(repositoryId);
  

  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  /* ------------------------------ Input state ----------------------------- */

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  /* ---------------------------- Code panel state -------------------------- */

  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const currentResult =
    results.find((result) => result.id === activeResultId) ?? null;

  const refreshChats = useCallback(async () => {
    const response = await fetch(
      `/api/repositories/chats?repositoryId=${encodeURIComponent(
        repositoryId
      )}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load chat history.");
    }

    setChats(data.chats ?? []);
  }, [repositoryId]);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const response = await fetch(
          `/api/repositories/chats?repositoryId=${encodeURIComponent(
            repositoryId
          )}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load chat history.");
        }

        if (!cancelled) {
          setChats(data.chats ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not load chat history."
          );
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [repositoryId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* ------------------------------------------------------------------------ */
  /*                              CREATE NEW CHAT                             */
  /* ------------------------------------------------------------------------ */

  async function createChat(firstQuestion: string): Promise<string> {
    const response = await fetch("/api/repositories/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repositoryId,
        title: firstQuestion.slice(0, 60),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not create a new chat.");
    }

    setActiveChatId(data.chat.id);
    console.log('create chat ', data);
    

    return data.chat.id as string;
  }

  /* ------------------------------------------------------------------------ */
  /*                             OPEN PREVIOUS CHAT                            */
  /* ------------------------------------------------------------------------ */

  async function openChat(chatId: string) {
    if (loading || chatId === activeChatId) {
      return;
    }

    setHistoryLoading(true);

    try {
      const response = await fetch(
        `/api/repositories/chats/${encodeURIComponent(chatId)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not open this conversation.");
      }

      const loadedMessages: ChatMessage[] = data.chat.messages ?? [];
      console.log("Open chat ", data);
      

      setActiveChatId(data.chat.id);
      setMessages(loadedMessages);
      setSelectedMessageId(null);

      /*
       * When opening an old conversation, display the code results
       * belonging to its latest assistant response.
       */

      const latestAssistant = [...loadedMessages]
        .reverse()
        .find((message) => message.role === "assistant");

      const latestResults = Array.isArray(latestAssistant?.results)
        ? latestAssistant.results
        : [];

      setResults(latestResults);
      setActiveResultId(latestResults[0]?.id ?? null);

      setInput("");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not open conversation."
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                                NEW CHAT                                  */
  /* ------------------------------------------------------------------------ */

  function startNewChat() {
    if (loading) {
      return;
    }

    setActiveChatId(null);
    setMessages([]);
    setResults([]);
    setActiveResultId(null);
    setSelectedMessageId(null);
    setInput("");
  }

  /* ------------------------------------------------------------------------ */
  /*                              SEND MESSAGE                                */
  /* ------------------------------------------------------------------------ */

  async function handleSend(text?: string) {
    const question = (text ?? input).trim();

    if (!question || loading) {
      return;
    }

    if (!repositoryId) {
      toast.error("Repository ID is missing.");
      return;
    }

    setInput("");
    setLoading(true);

    try {
      let chatId = activeChatId;
      console.log('chat id', chatId);
      
      
      /*
      * If the user is starting a new conversation,
      * create a chat before sending the question.
      */
     
     if (!chatId) {
       chatId = await createChat(question);
       console.log('chat id', chatId);
      }

      /*
       * This endpoint should:
       * 1. Save the user message.
       * 2. Search the repository.
       * 3. Generate a custom assistant response.
       * 4. Save the assistant response and search results.
       */

      const response = await fetch(
        `/api/repositories/chats/${encodeURIComponent(
          chatId
        )}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not send your message.");
      }

      const userMessage: ChatMessage = data.userMessage;
      const assistantMessage: ChatMessage = data.assistantMessage;

      const responseResults: SearchResult[] = Array.isArray(
        assistantMessage.results
      )
        ? assistantMessage.results
        : [];

      /*
       * Add both messages to the current conversation.
       */

      setMessages((previous) => [
        ...previous,
        userMessage,
        assistantMessage,
      ]);

      /*
       * Display the code results belonging to this response.
       */

      setSelectedMessageId(assistantMessage.id);
      setResults(responseResults);
      setActiveResultId(responseResults[0]?.id ?? null);

      /*
       * Refresh the sidebar so the newly created chat appears.
       */

      await refreshChats();
    } catch (error) {
      console.error("Chat request failed:", error);

      const message =
        error instanceof Error ? error.message : "Something went wrong.";

      toast.error(message);

      // Restore the question so the user can retry.
      setInput(question);
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                       DISPLAY OLD MESSAGE CODE RESULTS                    */
  /* ------------------------------------------------------------------------ */

  function showMessageResults(message: ChatMessage) {
    if (message.role !== "assistant") {
      return;
    }

    const savedResults = Array.isArray(message.results)
      ? message.results
      : [];

    /*
     * Important:
     * We use the results saved with this message.
     * We do NOT run the search API again.
     */

    setSelectedMessageId(message.id);
    setResults(savedResults);
    setActiveResultId(savedResults[0]?.id ?? null);
  }

  /* ------------------------------------------------------------------------ */
  /*                           KEYBOARD SHORTCUT                              */
  /* ------------------------------------------------------------------------ */

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                                  UI                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="ml-9 h-[calc(100svh-3.5rem)] bg-zinc-950 text-zinc-200">
      <ResizablePanelGroup orientation="horizontal">
        {/* ================================================================== */}
        {/*                           LEFT PANEL                               */}
        {/* ================================================================== */}

        <ResizablePanel defaultSize="40%" minSize="28%">
          <div className="flex h-full flex-col">
            {/* Repository header */}

            <div className="flex items-center gap-3 border-b border-zinc-800 px-5 py-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-900/50 text-emerald-300 ring-1 ring-emerald-700/40">
                <GitBranch className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="truncate text-sm font-semibold text-white">
                  {owner}/{repo}
                </h1>

                <p className="text-xs text-zinc-500">
                  Repository conversations
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={startNewChat}
                disabled={loading}
                className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
              >
                <Plus className="mr-1 size-4" />
                New chat
              </Button>
            </div>

            {/* ============================================================ */}
            {/*                        CHAT HISTORY                         */}
            {/* ============================================================ */}

            <div className="max-h-44 shrink-0 overflow-y-auto border-b border-zinc-800 p-3">
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Chat history
              </p>

              {historyLoading && chats.length === 0 ? (
                <p className="px-2 py-3 text-xs text-zinc-500">
                  Loading conversations...
                </p>
              ) : chats.length === 0 ? (
                <p className="px-2 py-3 text-xs text-zinc-600">
                  No saved conversations yet.
                </p>
              ) : (
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => openChat(chat.id)}
                      disabled={loading}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition",
                        activeChatId === chat.id
                          ? "bg-zinc-800 text-emerald-300"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                      )}
                    >
                      <MessageSquare className="size-3.5 shrink-0" />

                      <span className="min-w-0 flex-1 truncate">
                        {chat.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/*                       CHAT MESSAGES                          */}
            {/* ============================================================ */}

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
              {messages.length === 0 && !loading && (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-zinc-900 ring-1 ring-zinc-800">
                    <Sparkles className="size-5 text-emerald-400" />
                  </div>

                  <div>
                    <p className="font-medium text-white">
                      Start the analysis
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Ask a question about {repo}.
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSend(suggestion)}
                        disabled={loading}
                        className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-emerald-700/60 hover:text-emerald-300 disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  selected={selectedMessageId === message.id}
                  onClick={() => showMessageResults(message)}
                />
              ))}

              {loading && <TypingIndicator />}

              <div ref={bottomRef} />
            </div>

            {/* ============================================================ */}
            {/*                         MESSAGE INPUT                         */}
            {/* ============================================================ */}

            <div className="border-t border-zinc-800 p-4">
              <div className="flex items-end gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-2 focus-within:border-emerald-700/60">
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about this repository..."
                  rows={1}
                  disabled={loading}
                  className="max-h-40 min-h-9 resize-none border-0 bg-transparent px-2 py-1.5 text-sm shadow-none focus-visible:ring-0"
                />

                <Button
                  size="icon"
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <SendHorizontal className="size-4" />
                  )}
                </Button>
              </div>

              <p className="mt-2 text-center text-[11px] text-zinc-600">
                Enter to send · Shift+Enter for a new line
              </p>
            </div>
          </div>
        </ResizablePanel>

        {/* ================================================================== */}
        {/*                           RESIZE HANDLE                            */}
        {/* ================================================================== */}

        <ResizableHandle withHandle className="bg-zinc-800" />

        {/* ================================================================== */}
        {/*                           RIGHT PANEL                              */}
        {/* ================================================================== */}

        <ResizablePanel defaultSize="60%" minSize="30%">
          <div className="flex h-full flex-col">
            {/* Code result tabs */}

            <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-800 px-3 py-2">
              {results.length === 0 ? (
                <span className="px-2 py-1 text-xs text-zinc-600">
                  No retrieved code for this response
                </span>
              ) : (
                results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => setActiveResultId(result.id)}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition",
                      result.id === activeResultId
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                    )}
                  >
                    <FileCode2 className="size-3.5" />

                    {result.filePath}

                    <span className="text-zinc-600">#{index + 1}</span>
                  </button>
                ))
              )}
            </div>

            {/* Code viewer */}

            <div className="flex-1 overflow-auto p-4">
              {loading ? (
                <CodeSkeleton />
              ) : currentResult ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {currentResult.filePath}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Lines {currentResult.startLine}–
                        {currentResult.endLine}
                      </p>
                    </div>

                    <Badge
                      variant="secondary"
                      className="bg-emerald-900/40 text-emerald-400"
                    >
                      {(currentResult.similarity * 100).toFixed(1)}% similarity
                    </Badge>
                  </div>

                  <CodeBlock>
                    <CodeBlockHeader>
                      <CodeBlockTitle>
                        {currentResult.filePath}
                      </CodeBlockTitle>

                      <CodeBlockActions>
                        <CodeBlockCopyButton
                          value={currentResult.content}
                        />
                      </CodeBlockActions>
                    </CodeBlockHeader>

                    <CodeBlockContent>
                      {currentResult.content}
                    </CodeBlockContent>
                  </CodeBlock>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-zinc-900 ring-1 ring-zinc-800">
                    <FileCode2 className="size-5 text-zinc-600" />
                  </div>

                  <p className="text-sm font-medium text-zinc-400">
                    No code selected
                  </p>

                  <p className="mt-1 max-w-xs text-xs text-zinc-600">
                    Send a question to retrieve relevant code, or select an
                    earlier assistant response to view its saved results.
                  </p>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              MESSAGE BUBBLE                                */
/* -------------------------------------------------------------------------- */

type MessageBubbleProps = {
  message: ChatMessage;
  selected: boolean;
  onClick: () => void;
};

function MessageBubble({
  message,
  selected,
  onClick,
}: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";

  const hasResults =
    isAssistant &&
    Array.isArray(message.results) &&
    message.results.length > 0;

  return (
    <div
      className={cn(
        "flex gap-3",
        isAssistant ? "items-start" : "items-start justify-end"
      )}
    >
      {isAssistant && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-900/40 text-emerald-400">
          <Bot className="size-4" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] rounded-xl border px-4 py-3",
          isAssistant
            ? "border-zinc-800 bg-zinc-900/70"
            : "border-emerald-800/40 bg-emerald-950/30"
        )}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-300">
            {isAssistant ? "Code Assistant" : "You"}
          </span>

          {isAssistant && hasResults && (
            <Badge
              variant="secondary"
              className="bg-zinc-800 text-zinc-400"
            >
              {message.results!.length} code matches
            </Badge>
          )}
        </div>

        <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300">
          {message.content}
        </p>

        {hasResults && (
          <button
            onClick={onClick}
            className={cn(
              "mt-3 flex items-center gap-2 rounded-md border px-3 py-2 text-xs transition",
              selected
                ? "border-emerald-700/60 bg-emerald-900/30 text-emerald-300"
                : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-emerald-700/60 hover:text-emerald-300"
            )}
          >
            <FileCode2 className="size-3.5" />
            {selected ? "Viewing retrieved code" : "View retrieved code"}
          </button>
        )}
      </div>

      {!isAssistant && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
          <User className="size-4" />
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              TYPING INDICATOR                              */
/* -------------------------------------------------------------------------- */

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-900/40 text-emerald-400">
        <Bot className="size-4" />
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
        <Loader2 className="size-3.5 animate-spin text-emerald-400" />

        <span className="text-xs text-zinc-400">
          Searching your repository...
        </span>
      </div>
    </div>
  );
}

function CodeSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
        <div className="h-4 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="mt-2 h-3 w-28 animate-pulse rounded bg-zinc-800" />
      </div>

      <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="h-3 animate-pulse rounded bg-zinc-800"
            style={{
              width: `${55 + ((index * 17) % 40)}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}