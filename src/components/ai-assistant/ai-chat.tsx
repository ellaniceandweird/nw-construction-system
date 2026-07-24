"use client";
import * as React from "react";
import { Send, Sparkles, AlertTriangle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useProperties } from "@/hooks/use-properties";
import { useProjects } from "@/hooks/use-projects";
import { useEstimates } from "@/hooks/use-estimates";
import { useChangeOrders } from "@/hooks/use-change-orders";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { useBudgets } from "@/hooks/use-budgets";
import { useCostTransactions } from "@/hooks/use-cost-transactions";
import { useInvoices } from "@/hooks/use-invoices";
import { useMaintenanceTasks } from "@/hooks/use-maintenance-tasks";
import { useContacts } from "@/hooks/use-contacts";
import { useDocuments } from "@/hooks/use-documents";
import { buildDataDigest } from "@/lib/ai-assistant/build-data-digest";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "Which projects are behind schedule or over budget?",
  "How much have we spent on The Wick so far?",
  "What maintenance tasks are still open?",
  "Are there any outstanding vendor invoices?",
  "Summarize the whole portfolio in a few sentences.",
];

export function AiChat() {
  const properties = useProperties();
  const projects = useProjects();
  const estimates = useEstimates();
  const changeOrders = useChangeOrders();
  const purchaseOrders = usePurchaseOrders();
  const budgets = useBudgets();
  const transactions = useCostTransactions();
  const invoices = useInvoices();
  const maintenanceTasks = useMaintenanceTasks();
  const contacts = useContacts();
  const documents = useDocuments();

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(question?: string) {
    const content = (question ?? input).trim();
    if (!content || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    const dataDigest = buildDataDigest(
      projects, properties, estimates, changeOrders, purchaseOrders, budgets, transactions, invoices, maintenanceTasks, contacts, documents
    );

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, dataDigest }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-[calc(100vh-220px)] flex-col">
      <div className="flex-1 overflow-y-auto rounded-t-lg border border-b-0 border-border bg-card p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <Sparkles className="size-8 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Ask about your properties, projects, budgets, or maintenance</p>
              <p className="mt-1 text-sm text-muted-foreground">Answers are grounded in your real current data — nothing invented.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground hover:bg-accent"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> Thinking…
              </div>
            </div>
          )}
          {error && (
            <p className="flex items-start gap-2 rounded-lg bg-destructive-soft p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {error}
            </p>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      <Card className="flex items-end gap-2 rounded-t-none p-3">
        <Textarea
          placeholder="Ask a question about your properties, projects, or budgets…"
          className="min-h-[44px] flex-1 resize-none border-0 shadow-none focus-visible:ring-0"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={() => handleSend()} disabled={!input.trim() || loading}>
          <Send className="size-4" />
        </Button>
      </Card>
    </div>
  );
}
