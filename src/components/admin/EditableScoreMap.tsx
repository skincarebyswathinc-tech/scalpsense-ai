import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { InfoTip } from "@/components/ui/info-tip";

interface EditableScoreMapProps {
  /** Card title shown to the admin */
  title: string;
  /** Plain-language explanation of what this score map controls */
  description: string;
  /** Tooltip — appears in the (i) icon next to the title */
  help: React.ReactNode;
  /** Current key→value map */
  value: Record<string, number>;
  /** Called whenever the admin changes the map (any add/edit/rename/delete) */
  onChange: (next: Record<string, number>) => void;
  /** Min/max for the value input (defaults: 0 / 100) */
  min?: number;
  max?: number;
  step?: number;
  /** Placeholder for the field-name input */
  keyPlaceholder?: string;
  /** Placeholder for the value input */
  valuePlaceholder?: string;
}

/**
 * No-code editor for a free-form `Record<string, number>` used in the scoring
 * config (weights, shedding scores, stress scores, etc.).
 *
 * Admins can:
 *   • add new fields (rows)
 *   • rename existing field keys
 *   • change values
 *   • delete fields
 *
 * Every change goes through `onChange` so the parent can persist atomically.
 */
export const EditableScoreMap: React.FC<EditableScoreMapProps> = ({
  title, description, help, value, onChange,
  min = 0, max = 100, step = 1,
  keyPlaceholder = "field_name",
  valuePlaceholder = "0",
}) => {
  const entries = Object.entries(value);

  // Renaming is a two-step process: edit the key locally, commit on blur.
  // We keep an internal "draft keys" map so typing doesn't immediately
  // collapse duplicate keys.
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});

  const setDraft = (origKey: string, next: string) =>
    setDrafts(d => ({ ...d, [origKey]: next }));

  const commitRename = (origKey: string) => {
    const next = (drafts[origKey] ?? origKey).trim();
    setDrafts(d => { const c = { ...d }; delete c[origKey]; return c; });
    if (!next || next === origKey) return;
    if (Object.prototype.hasOwnProperty.call(value, next)) return; // duplicate
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k === origKey ? next : k] = v;
    }
    onChange(out);
  };

  const updateVal = (key: string, raw: string) => {
    const n = parseFloat(raw);
    onChange({ ...value, [key]: isNaN(n) ? 0 : n });
  };

  const removeKey = (key: string) => {
    const out = { ...value };
    delete out[key];
    onChange(out);
  };

  const addKey = () => {
    let base = "new_field";
    let candidate = base;
    let i = 1;
    while (Object.prototype.hasOwnProperty.call(value, candidate)) {
      candidate = `${base}_${i++}`;
    }
    onChange({ ...value, [candidate]: 0 });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {title}
              <InfoTip>{help}</InfoTip>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button size="sm" variant="hero" onClick={addKey}>
            <Plus className="h-3 w-3 mr-1" /> Add field
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No fields yet. Click "Add field" to create your first row.
          </p>
        ) : (
          <div className="space-y-2">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_140px_40px] gap-2 text-xs uppercase tracking-wider text-muted-foreground px-1">
              <div>Field name (key)</div>
              <div>Value</div>
              <div className="text-right"> </div>
            </div>
            {entries.map(([key, val]) => (
              <div key={key} className="grid grid-cols-[1fr_140px_40px] gap-2 items-center">
                <Input
                  value={drafts[key] ?? key}
                  placeholder={keyPlaceholder}
                  onChange={e => setDraft(key, e.target.value)}
                  onBlur={() => commitRename(key)}
                  className="font-mono text-sm"
                />
                <Input
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  placeholder={valuePlaceholder}
                  value={val}
                  onChange={e => updateVal(key, e.target.value)}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeKey(key)}
                  aria-label={`Remove ${key}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EditableScoreMap;
