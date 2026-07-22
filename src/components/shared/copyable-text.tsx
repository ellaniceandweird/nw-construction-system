"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  value: string;
  href?: string;
  icon?: React.ReactNode;
}

/** Shows a value with a small copy button — click to copy, brief checkmark confirms it. */
export function CopyableText({ value, href, icon }: Props) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access can fail in some contexts; the link below still works as a fallback
    }
  }

  return (
    <span className="group inline-flex items-center gap-1.5">
      {href ? (
        <a href={href} className="inline-flex items-center gap-1 hover:text-primary hover:underline">
          {icon} {value}
        </a>
      ) : (
        <span className="inline-flex items-center gap-1">{icon} {value}</span>
      )}
      <button
        type="button"
        onClick={handleCopy}
        title="Copy"
        className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
      >
        {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
      </button>
    </span>
  );
}
