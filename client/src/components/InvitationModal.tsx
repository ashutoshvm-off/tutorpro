import { useState } from "react";
import { Check, Copy, Link2, Loader2, Share2, UserPlus, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface InvitationModalProps {
  onClose: () => void;
}

type ModalState = "form" | "loading" | "display" | "shared";

export function InvitationModal({ onClose }: InvitationModalProps) {
  const [state, setState] = useState<ModalState>("form");
  const [label, setLabel] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const createMutation = trpc.invitations.create.useMutation();
  const { data: existingLinks } = trpc.invitations.list.useQuery();

  const inviteUrl = generatedCode
    ? `${window.location.origin}/signup?invite=${generatedCode}`
    : "";

  async function handleGenerate() {
    setState("loading");
    try {
      const result = await createMutation.mutateAsync({ label: label || undefined });
      setGeneratedCode(result.code);
      setState("display");
    } catch {
      setState("form");
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = inviteUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on TutorFlow",
          text: `I'd like to invite you to my tutoring sessions on TutorFlow.`,
          url: inviteUrl,
        });
        setState("shared");
        setTimeout(() => setState("display"), 2400);
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#203336]/20 p-5 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-[1.5rem] p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#dceee6] text-[#39705e]">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="eyebrow">Invite</p>
              <h2 className="mt-1 text-xl font-bold text-[#203336]">Add a student</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-sm font-bold text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Generate form */}
        {state === "form" && (
          <div className="mt-6">
            <p className="text-sm leading-6 text-slate-600">
              Generate a unique invitation link. Share it with a student so they can join your roster.
            </p>
            <label className="mt-5 block text-xs font-bold uppercase tracking-[.12em] text-slate-500">
              Label (optional)
              <input
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Aarav — Grade 10"
                className="mt-2 w-full rounded-xl border bg-white/60 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-slate-800 outline-none focus:border-[#5b8d7b]"
              />
            </label>
            <button
              onClick={handleGenerate}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#203a3a] px-4 py-3 text-sm font-bold text-white"
            >
              <Link2 className="h-4 w-4" />
              Generate invitation link
            </button>
          </div>
        )}

        {/* Loading */}
        {state === "loading" && (
          <div className="mt-10 flex flex-col items-center gap-3 pb-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#5b8d7b]" />
            <p className="text-sm font-semibold text-slate-500">Generating link…</p>
          </div>
        )}

        {/* Display generated link */}
        {state === "display" && (
          <div className="mt-6">
            <p className="text-sm text-slate-600">
              Your invitation link is ready. It expires in 7 days.
            </p>

            {/* Link display */}
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#cfe2d8] bg-[#e5f0e9]/50 px-3 py-2.5">
              <Link2 className="h-4 w-4 shrink-0 text-[#5b8d7b]" />
              <p className="min-w-0 flex-1 truncate text-xs font-mono text-[#39705e]">
                {inviteUrl}
              </p>
            </div>

            {/* Action buttons */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={handleCopy}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                  copied
                    ? "border-[#5b8d7b] bg-[#dceee6] text-[#39705e]"
                    : "border-slate-200 bg-white/60 text-slate-700 hover:border-[#cfe2d8] hover:bg-white/80"
                }`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#203a3a] px-4 py-2.5 text-sm font-bold text-white"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>

            {/* Generate another */}
            <button
              onClick={() => { setState("form"); setLabel(""); setGeneratedCode(""); setCopied(false); }}
              className="mt-4 w-full text-center text-xs font-bold text-[#5b8d7b] hover:text-[#39705e]"
            >
              Generate another link
            </button>
          </div>
        )}

        {/* Shared confirmation */}
        {state === "shared" && (
          <div className="mt-8 flex flex-col items-center gap-3 pb-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[#dceee6]">
              <Check className="h-6 w-6 text-[#39705e]" />
            </div>
            <p className="text-sm font-bold text-[#39705e]">Shared successfully!</p>
          </div>
        )}

        {/* Existing links */}
        {existingLinks && existingLinks.length > 0 && state !== "loading" && (
          <div className="mt-6 border-t border-slate-200/50 pt-5">
            <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">
              Previous invitations
            </p>
            <div className="mt-3 max-h-32 space-y-2 overflow-y-auto">
              {existingLinks.map(link => (
                <div
                  key={link.code}
                  className="flex items-center gap-3 rounded-lg bg-white/40 px-3 py-2"
                >
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-700">
                      {link.label || link.code}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {link.usedByStudentId ? "Redeemed" : new Date(link.expiresAt) < new Date() ? "Expired" : "Active"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      link.usedByStudentId
                        ? "bg-[#dceee6] text-[#39705e]"
                        : new Date(link.expiresAt) < new Date()
                          ? "bg-red-50 text-red-400"
                          : "bg-[#f3ead9] text-[#806b4c]"
                    }`}
                  >
                    {link.usedByStudentId ? "Used" : new Date(link.expiresAt) < new Date() ? "Expired" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
