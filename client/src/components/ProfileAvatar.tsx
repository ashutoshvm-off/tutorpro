import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileAvatar({ name, avatarUrl, className = "h-10 w-10" }: { name: string; avatarUrl?: string | null; className?: string }) {
  const initials = name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
  return <Avatar className={`border border-white/70 ${className}`}><AvatarImage src={avatarUrl ?? undefined} alt={`${name} profile`} /><AvatarFallback className="bg-[#e7c2ae] text-xs font-bold text-[#674b3d]">{initials || "TF"}</AvatarFallback></Avatar>;
}
