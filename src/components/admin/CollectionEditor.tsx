import { useState, useEffect, type ReactNode } from "react";
import { Pencil, Trash2, Plus, X, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { AdminCard, PrimaryButton, GhostButton, Field, TextInput, TextArea, Toggle, Badge } from "./AdminLayout";
import { useAdminList, useUpsert, useDelete } from "@/lib/cms";
import { ImageField } from "./ImageField";
import { toast } from "sonner";

export type FieldDef =
  | { name: string; label: string; type: "text" | "url" | "number" }
  | { name: string; label: string; type: "textarea"; rows?: number }
  | { name: string; label: string; type: "image"; folder?: string };

interface Props<T> {
  table: string;
  invalidateKeys?: string[][];
  fields: FieldDef[];
  columns: { key: string; label: string; render?: (row: T) => ReactNode }[];
  emptyLabel?: string;
  singularName: string;
}

type Row = Record<string, any>;

export function CollectionEditor<T extends Row>({ table, fields, columns, invalidateKeys = [], singularName }: Props<T>) {
  const { data: rows, isLoading } = useAdminList<T>(table);
  const upsert = useUpsert(table, invalidateKeys);
  const del = useDelete(table, invalidateKeys);
  const [editing, setEditing] = useState<Row | null>(null);

  const empty: Row = { visible: true, position: (rows?.length ?? 0) };
  fields.forEach((f) => (empty[f.name] = ""));

  const move = async (row: T, dir: -1 | 1) => {
    const sorted = [...(rows ?? [])].sort((a: any, b: any) => a.position - b.position);
    const idx = sorted.findIndex((r: any) => r.id === (row as any).id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    await upsert.mutateAsync({ id: (row as any).id, position: (swap as any).position });
    await upsert.mutateAsync({ id: (swap as any).id, position: (row as any).position });
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <PrimaryButton onClick={() => setEditing(empty)}>
          <Plus className="size-4" /> Add {singularName}
        </PrimaryButton>
      </div>

      <AdminCard>
        {isLoading ? (
          <div className="p-10 text-center text-sm text-[#6B7280]">Loading…</div>
        ) : (rows?.length ?? 0) === 0 ? (
          <div className="p-10 text-center text-sm text-[#6B7280]">No {singularName.toLowerCase()}s yet. Add your first one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#EEF0F3]">
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#6B7280]">
                  <th className="px-6 py-3 w-16">Order</th>
                  {columns.map((c) => <th key={c.key} className="px-6 py-3">{c.label}</th>)}
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {[...rows!].sort((a: any, b: any) => a.position - b.position).map((row: any) => (
                  <tr key={row.id} className="hover:bg-[#FAFAFB]">
                    <td className="px-6 py-3">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => move(row as T, -1)} className="text-[#9CA3AF] hover:text-primary"><ArrowUp className="size-3.5" /></button>
                        <button onClick={() => move(row as T, 1)} className="text-[#9CA3AF] hover:text-primary"><ArrowDown className="size-3.5" /></button>
                      </div>
                    </td>
                    {columns.map((c) => (
                      <td key={c.key} className="px-6 py-3 align-top max-w-[380px]">
                        {c.render ? c.render(row as T) : <span className="line-clamp-2 text-[#374151]">{String(row[c.key] ?? "")}</span>}
                      </td>
                    ))}
                    <td className="px-6 py-3">
                      {row.visible ? <Badge tone="success">Visible</Badge> : <Badge>Hidden</Badge>}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={async () => {
                            await upsert.mutateAsync({ id: row.id, visible: !row.visible });
                            toast.success(row.visible ? "Hidden" : "Now visible");
                          }}
                          className="p-2 rounded-lg hover:bg-[#F5EFE5] text-[#6B7280]"
                          title={row.visible ? "Hide" : "Show"}
                        >
                          {row.visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                        <button onClick={() => setEditing(row)} className="p-2 rounded-lg hover:bg-[#F5EFE5] text-primary" title="Edit">
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete this ${singularName.toLowerCase()}?`)) return;
                            await del.mutateAsync(row.id);
                            toast.success("Deleted");
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {editing && (
        <EditorModal
          row={editing}
          fields={fields}
          title={editing.id ? `Edit ${singularName}` : `New ${singularName}`}
          onClose={() => setEditing(null)}
          onSave={async (payload) => {
            try {
              await upsert.mutateAsync(payload);
              toast.success("Saved");
              setEditing(null);
            } catch (e: any) {
              toast.error(e?.message ?? "Save failed");
            }
          }}
        />
      )}
    </>
  );
}

function EditorModal({ row, fields, title, onClose, onSave }: { row: Row; fields: FieldDef[]; title: string; onClose: () => void; onSave: (payload: Row) => Promise<void> }) {
  const [state, setState] = useState<Row>(row);
  useEffect(() => setState(row), [row]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-[#EEF0F3] flex items-center justify-between">
          <h3 className="font-display text-2xl text-primary">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F5EFE5]"><X className="size-4" /></button>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); onSave(state); }}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {fields.map((f) => (
            <Field key={f.name} label={f.label}>
              {f.type === "textarea" ? (
                <TextArea rows={f.rows ?? 4} value={state[f.name] ?? ""} onChange={(e) => setState({ ...state, [f.name]: e.target.value })} />
              ) : f.type === "image" ? (
                <ImageField value={state[f.name] ?? ""} onChange={(url) => setState({ ...state, [f.name]: url })} folder={f.folder ?? "general"} />
              ) : (
                <TextInput type={f.type === "url" ? "url" : f.type === "number" ? "number" : "text"} value={state[f.name] ?? ""} onChange={(e) => setState({ ...state, [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value })} />
              )}
            </Field>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#4B5563]">Visible on site</span>
              <Toggle checked={!!state.visible} onChange={(v) => setState({ ...state, visible: v })} />
            </div>
            <div className="flex gap-2">
              <GhostButton onClick={onClose}>Cancel</GhostButton>
              <PrimaryButton type="submit">Save changes</PrimaryButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
