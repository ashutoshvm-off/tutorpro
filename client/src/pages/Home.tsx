import { ArrowRight, CalendarDays, Check, ChevronRight, CirclePlay, Clock3, PenLine, Sparkles, Users } from "lucide-react";
import { Link } from "wouter";

const principles = [
  "Prepare without starting from a blank page",
  "Keep the lesson record close while you teach",
  "Send the next step before the conversation goes cold",
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f5ef] text-[#263537]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_11%_12%,rgba(208,230,220,.48),transparent_29%),radial-gradient(circle_at_84%_9%,rgba(238,222,193,.4),transparent_25%)]" />
      <header className="relative z-10 border-b border-[#263537]/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="TutorFlow home">
            <img src="/tutorflow-logo.png" alt="TutorFlow logo" className="h-10 w-10 rounded-[13px] object-cover shadow-sm" />
            <span className="font-[Manrope] text-lg font-extrabold tracking-[-.05em]">tutor<span className="text-[#5b8d7b]">flow</span></span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#workflow" className="transition-colors hover:text-[#203a3a]">How it works</a>
            <a href="#for-tutors" className="transition-colors hover:text-[#203a3a]">For tutors</a>
            <a href="#for-students" className="transition-colors hover:text-[#203a3a]">For students</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-sm font-bold text-slate-600 hover:text-[#203a3a] sm:block">Log in</Link>
            <Link href="/signup" className="rounded-full bg-[#203a3a] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(32,58,58,.14)] transition-transform hover:-translate-y-0.5">Start free</Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <section className="grid items-start gap-14 border-b border-[#263537]/10 py-16 lg:grid-cols-[.9fr_1.1fr] lg:gap-24 lg:py-24">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[.2em] text-[#5b8d7b]"><span className="h-px w-8 bg-[#5b8d7b]" /> Independent tutoring, considered</div>
            <h1 className="mt-6 text-5xl font-extrabold leading-[.98] tracking-[-.065em] text-[#203336] sm:text-7xl">The work between lessons <span className="font-[Newsreader] font-medium italic text-[#5b8d7b]">matters.</span></h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-600">TutorFlow gives tutors a clear place to prepare, teach, and follow through — so students feel the thread from one lesson to the next.</p>
            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link href="/signup" className="group inline-flex items-center gap-3 rounded-full bg-[#203a3a] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(32,58,58,.16)] transition-transform hover:-translate-y-0.5">Create your workspace <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              <a href="#workflow" className="inline-flex items-center gap-2 px-2 py-3 text-sm font-bold text-slate-600 hover:text-[#203a3a]"><CirclePlay className="h-4 w-4 text-[#5b8d7b]" /> Take the short tour</a>
            </div>
            <div className="mt-12 grid gap-5 border-t border-[#263537]/10 pt-5 text-sm text-slate-600 sm:grid-cols-3">
              {principles.map((item, index) => <div key={item} className="flex gap-2.5"><span className="mt-0.5 text-xs font-extrabold text-[#5b8d7b]">0{index + 1}</span><span className="leading-5">{item}</span></div>)}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:pt-8">
            <div className="absolute -right-3 top-0 h-20 w-20 rounded-full border border-[#203a3a]/10 bg-[#efe3cf]/45" />
            <div className="relative rotate-[1deg] border border-[#203a3a]/10 bg-white p-3 shadow-[0_25px_70px_rgba(32,58,58,.12)] sm:p-4">
              <div className="border border-[#203a3a]/10 bg-[#203a3a] p-5 text-white sm:p-7">
                <div className="flex items-start justify-between border-b border-white/15 pb-5"><div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#a9c8bb]">Monday · 14 May</p><h2 className="mt-3 text-2xl font-bold tracking-[-.04em]">A lesson with a little room around it.</h2></div><span className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-[#b7dfcd]"><PenLine className="h-4 w-4" /></span></div>
                <div className="mt-6 grid gap-3 sm:grid-cols-[.8fr_1.2fr]">
                  <div className="border border-white/15 bg-white/[.06] p-4"><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#a9c8bb]">Next session</p><p className="mt-4 text-3xl font-bold">10:30</p><p className="mt-1 text-sm text-[#c6d4cf]">Aarav Mehta · Algebra</p><div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#d9efe4] px-2.5 py-1 text-[10px] font-extrabold text-[#2f6958]"><Clock3 className="h-3 w-3" /> Ready to begin</div></div>
                  <div className="bg-[#f4ead9] p-4 text-[#273638]"><div className="flex items-center justify-between"><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#8c7661]">Your note</p><Sparkles className="h-4 w-4 text-[#8a765f]" /></div><p className="mt-5 max-w-xs text-lg font-semibold leading-7">Slow the written work down. Let the confidence catch up.</p><div className="mt-6 border-t border-[#8c7661]/20 pt-3 text-xs text-[#6d7776]">Plan · notes · next step</div></div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -left-5 flex items-center gap-3 border border-[#203a3a]/10 bg-[#f7f5ef] px-4 py-3 shadow-[0_15px_35px_rgba(32,58,58,.1)] sm:-left-9"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#dceee6] text-[#39705e]"><Check className="h-4 w-4" /></span><div><p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-slate-400">After the lesson</p><p className="mt-1 text-sm font-bold text-[#203336]">A clear next step, sent.</p></div></div>
          </div>
        </section>

        <section id="workflow" className="grid gap-10 border-b border-[#263537]/10 py-20 lg:grid-cols-[.72fr_1.28fr] lg:py-28">
          <div><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-[#5b8d7b]">The TutorFlow rhythm</p><h2 className="mt-5 max-w-md text-4xl font-extrabold leading-[1.02] tracking-[-.06em] text-[#203336] sm:text-5xl">Good teaching is a sequence of small, thoughtful moves.</h2></div>
          <div className="divide-y divide-[#263537]/10 border-y border-[#263537]/10">
            <FlowStep number="01" icon={<CalendarDays />} title="Before the lesson" text="Gather goals, recent notes, and the right amount of structure. Start with context, not admin." />
            <FlowStep number="02" icon={<Users />} title="In the room" text="Keep the plan, live notes, and student-facing material together while the conversation moves." />
            <FlowStep number="03" icon={<ArrowRight />} title="After the lesson" text="Close the loop with an honest summary and a next step the student can actually use." />
          </div>
        </section>

        <section className="grid gap-5 py-20 md:grid-cols-2 lg:py-24">
          <div id="for-tutors" className="bg-[#203a3a] p-7 text-white sm:p-10"><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-[#a9c8bb]">For tutors</p><h3 className="mt-5 max-w-md text-3xl font-bold leading-tight tracking-[-.04em]">A calmer practice, from first note to final follow-up.</h3><p className="mt-5 max-w-md leading-7 text-[#c6d4cf]">Keep student context close, build repeatable lesson materials, and let the system carry the small things.</p><Link href="/dashboard/tutor" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#d9efe4]">Explore the tutor workspace <ChevronRight className="h-4 w-4" /></Link></div>
          <div id="for-students" className="border border-[#203a3a]/10 bg-[#e7efe9] p-7 sm:p-10"><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-[#39705e]">For students</p><h3 className="mt-5 max-w-md text-3xl font-bold leading-tight tracking-[-.04em] text-[#203336]">Know where you are, and what comes next.</h3><p className="mt-5 max-w-md leading-7 text-[#49645d]">Your schedule, notes, history, and homework live in one simple, readable place — without the noise.</p><Link href="/dashboard/student" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#386d5d]">See the student view <ChevronRight className="h-4 w-4" /></Link></div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[#263537]/10"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-7 text-xs text-slate-500 sm:px-8"><div className="flex items-center gap-2"><img src="/tutorflow-logo.png" alt="" className="h-6 w-6 rounded-md object-cover" /><span>© 2026 TutorFlow</span></div><span>Made for focused learning.</span></div></footer>
    </div>
  );
}

function FlowStep({ number, icon, title, text }: { number: string; icon: React.ReactNode; title: string; text: string }) {
  return <article className="grid gap-4 py-6 sm:grid-cols-[3rem_1fr] sm:items-start"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#dceee6] text-[#39705e]">{icon}</span><div><div className="flex items-center gap-3"><span className="text-xs font-extrabold text-[#5b8d7b]">{number}</span><h3 className="text-lg font-bold text-[#203336]">{title}</h3></div><p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">{text}</p></div></article>;
}
