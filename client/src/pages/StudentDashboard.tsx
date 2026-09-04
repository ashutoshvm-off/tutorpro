import DashboardLayout from "@/components/DashboardLayout";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { StudentProgress } from "@/components/StudentProgress";
import { BookingCalendar } from "@/components/BookingCalendar";
import { ArrowUpRight, BookOpen, CalendarDays, Check, ChevronRight, Clock3, FileText, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function StudentDashboard() {
  const { data: liveSessions } = trpc.sessions.mine.useQuery();
  const { data: currentProfile } = trpc.profile.me.useQuery();
  const { data: progress } = trpc.progress.student.useQuery();

  // We pass tutorId = 1 as a placeholder; in a real flow, the student's assigned tutor id comes from their profile or session data
  const { data: availabilitySlots } = trpc.availability.public.useQuery({ tutorId: 1 });

  const completedCount = progress?.completedLessons ?? 0;
  const streakWeeks = Math.min(Math.ceil(completedCount / 2), 52);

  const timeline = liveSessions?.length
    ? liveSessions.map(session => ({
        date: new Date(session.startTime).getDate().toString().padStart(2, "0"),
        month: new Date(session.startTime).toLocaleString([], { month: "short" }).toUpperCase(),
        day: new Date(session.startTime).toLocaleString([], { weekday: "long" }),
        title: session.topic,
        tutor: "with your tutor",
        time: new Date(session.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        badge: session.state.replace("_", " "),
      }))
    : [
        { date: "14", month: "MAY", day: "Today", title: "Algebra foundations", tutor: "with Maya Rivera", time: "10:30 AM", badge: "Next up" },
        { date: "17", month: "MAY", day: "Saturday", title: "Quadratic equations", tutor: "with Maya Rivera", time: "11:00 AM", badge: "Scheduled", muted: true },
        { date: "20", month: "MAY", day: "Tuesday", title: "Practice review", tutor: "with Maya Rivera", time: "4:30 PM", badge: "Scheduled", muted: true },
      ];

  const historyItems =
    liveSessions
      ?.filter(session => session.state === "completed" || session.state === "ai_reviewed")
      .map(session => ({
        title: session.topic,
        date: new Date(session.endTime).toLocaleDateString(),
        note: String(session.aiSummary || "Your tutor will add a reflection after this lesson."),
      })) ?? [
      { title: "Linear equations", date: "10 May 2026", note: "You're getting faster at isolating variables." },
      { title: "Graphing slope", date: "06 May 2026", note: "Strong visual reasoning — keep labeling axes." },
    ];

  const homeworkText = String(
    liveSessions?.find(session => session.homework)?.homework ||
      "Your tutor's next practice set will appear here after a completed lesson."
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f5f4ef] px-1 py-2 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-7xl">
          {/* Profile banner */}
          <div className="glass overflow-hidden rounded-[1.75rem]">
            <div className="relative bg-[#1d3336] px-5 py-7 text-white sm:px-8">
              <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#5b8d7b]/25 blur-3xl" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                <ProfileAvatar
                  name={currentProfile?.fullName || "Alex Chen"}
                  avatarUrl={currentProfile?.avatarUrl}
                  className="h-20 w-20 rounded-[1.5rem] border-4 border-white/15 text-2xl"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a9c8bb]">Student profile</p>
                  <h1 className="mt-2 text-3xl font-extrabold tracking-[-.05em]">
                    Hi, {currentProfile?.fullName || "Alex Chen"}.
                  </h1>
                  <p className="mt-2 text-sm text-[#c1d0cb]">
                    {currentProfile?.classGrade || "Grade 10"} · {currentProfile?.schoolCollege || "Northbridge Academy"}
                    {liveSessions ? ` · ${liveSessions.length} records synced` : ""}
                  </p>
                </div>
                <div className="sm:ml-auto">
                  <button className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15">
                    View profile
                  </button>
                </div>
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-7">
              <Stat
                label="Learning focus"
                value={progress?.topicsCovered?.[0] || "Algebra foundations"}
                icon={<BookOpen />}
              />
              <Stat
                label="Sessions completed"
                value={`${completedCount} this year`}
                icon={<Check />}
              />
              <Stat
                label="Current streak"
                value={`${streakWeeks} week${streakWeeks !== 1 ? "s" : ""}`}
                icon={<Sparkles />}
              />
            </div>
          </div>

          {/* Progress section */}
          {progress && (
            <div className="mt-6">
              <StudentProgress
                completedLessons={progress.completedLessons}
                reviewedLessons={progress.reviewedLessons}
                topicsCovered={progress.topicsCovered}
                improvementPct={progress.improvementPct}
              />
            </div>
          )}

          {/* Schedule + Booking calendar */}
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
            <div className="glass rounded-[1.5rem] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Your schedule</p>
                  <h2 className="mt-2 text-xl font-bold">Upcoming lessons</h2>
                </div>
                <CalendarDays className="h-5 w-5 text-[#5b8d7b]" />
              </div>
              <div className="mt-6 space-y-3">
                {timeline.map(lesson => (
                  <Lesson key={`${lesson.date}-${lesson.title}`} {...lesson} />
                ))}
              </div>
            </div>

            {/* Booking calendar replaces the old static "next step" card */}
            <BookingCalendar
              availability={availabilitySlots ?? []}
              bookedSessions={liveSessions?.map(s => ({
                startTime: s.startTime,
                endTime: s.endTime,
                topic: s.topic,
              })) ?? []}
              onBook={(date, startTime, endTime) => {
                // In a real flow, this would call sessions.schedule
                console.log("Book:", date, startTime, endTime);
              }}
            />
          </div>

          {/* History + Notes */}
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_.86fr]">
            <div className="glass rounded-[1.5rem] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Lesson history</p>
                  <h2 className="mt-2 text-xl font-bold">Keep your progress close.</h2>
                </div>
                <button className="text-sm font-bold text-[#39705e]">View all</button>
              </div>
              <div className="mt-5 divide-y divide-slate-200/70">
                {historyItems.map(item => (
                  <div key={item.title} className="flex items-center gap-4 py-4 first:pt-0">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef1ed] text-[#5b8d7b]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800">{item.title}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{item.note}</p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-xs font-semibold text-slate-500">{item.date}</p>
                      <ChevronRight className="ml-auto mt-2 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-[1.5rem] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f3ead9] text-[#806b4c]">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="eyebrow">Read-only notes</p>
                  <h2 className="mt-1 text-xl font-bold">Your learning record.</h2>
                </div>
              </div>
              <p className="mt-6 text-sm leading-6 text-slate-600">
                Your tutor's notes and AI summaries stay available here after every completed session.
              </p>
              <Link
                href="/session/aarav"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#39705e]"
              >
                Open latest lesson <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f0ea] text-[#39705e]">
        {icon}
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-[.11em] text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-bold text-[#203336]">{value}</p>
      </div>
    </div>
  );
}

function Lesson({
  date,
  month,
  day,
  title,
  tutor,
  time,
  badge,
  muted,
}: {
  date: string;
  month: string;
  day: string;
  title: string;
  tutor: string;
  time: string;
  badge: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border border-transparent p-3 ${
        muted ? "bg-white/35" : "bg-[#e8f0ea]/70"
      }`}
    >
      <div className="w-10 shrink-0 text-center">
        <p className="text-xl font-extrabold text-[#203336]">{date}</p>
        <p className="text-[10px] font-bold uppercase tracking-[.1em] text-slate-400">{month}</p>
      </div>
      <div className="h-10 w-px bg-slate-200" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-800">{title}</p>
        <p className="mt-1 text-xs text-slate-500">
          {tutor} · {day}
        </p>
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-xs font-semibold text-slate-700">{time}</p>
        <span className="mt-1 inline-block rounded-full bg-white/70 px-2 py-1 text-[10px] font-bold text-[#5b8d7b]">
          {badge}
        </span>
      </div>
    </div>
  );
}
