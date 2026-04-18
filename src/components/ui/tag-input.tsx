import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Maximum number of tags allowed */
  max?: number;
  /** If true, lowercases every tag for normalization */
  lowercase?: boolean;
  id?: string;
  "aria-describedby"?: string;
}

/**
 * Chip / tag input. Users type a value, then press Comma or Enter
 * to commit it as a tag. Supports paste of comma-separated values.
 * Backspace on empty input removes the last tag.
 *
 * Usage:
 *   <TagInput value={tags} onChange={setTags} placeholder="Dry Scalp, Oily Scalp" />
 */
export const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
  disabled,
  max,
  lowercase,
  id,
  "aria-describedby": ariaDescribedBy,
}) => {
  const [draft, setDraft] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const normalize = (raw: string) => {
    const t = raw.trim();
    if (!t) return "";
    return lowercase ? t.toLowerCase() : t;
  };

  const commit = (raw: string) => {
    const parts = raw
      .split(",")
      .map(normalize)
      .filter(Boolean);
    if (parts.length === 0) return;
    const merged = [...value];
    for (const p of parts) {
      if (max && merged.length >= max) break;
      if (!merged.includes(p)) merged.push(p);
    }
    if (merged.length !== value.length || merged.some((v, i) => v !== value[i])) {
      onChange(merged);
    }
    setDraft("");
  };

  const removeAt = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (draft.trim()) commit(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      e.preventDefault();
      removeAt(value.length - 1);
    } else if (e.key === "Tab" && draft.trim()) {
      // Soft-commit on Tab so users don't lose the in-progress tag
      commit(draft);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (text.includes(",") || text.includes("\n")) {
      e.preventDefault();
      commit(text.replace(/\n/g, ","));
    }
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 min-h-10 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, idx) => (
        <Badge
          key={`${tag}-${idx}`}
          variant="secondary"
          className="gap-1 font-normal pl-2 pr-1 py-0.5"
        >
          <span className="truncate max-w-[180px]">{tag}</span>
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={(e) => {
              e.stopPropagation();
              removeAt(idx);
            }}
            className="rounded-sm opacity-60 hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <input
        ref={inputRef}
        id={id}
        aria-describedby={ariaDescribedBy}
        className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground py-0.5"
        placeholder={value.length === 0 ? placeholder : ""}
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => draft.trim() && commit(draft)}
      />
    </div>
  );
};

export default TagInput;
