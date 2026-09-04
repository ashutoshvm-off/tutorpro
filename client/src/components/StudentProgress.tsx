import { useMemo } from "react";
import { Award, BookOpen, TrendingUp } from "lucide-react";
import { XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";

interface StudentProgressProps {
  completedLessons: number;
  reviewedLessons: number;
  topicsCovered: string[];
  improvementPct: number;
  /** Optional: pass session-level data for the trend chart */
  sessionHistory?: { date: string; score: number }[];
  className?: string;
}

/** Generates mock trend data when real session history isn't available */
function generateTrendData(completed: number): { date: string; score: number }[] {
  if (completed === 0) return [];
  const points = Math.min(completed, 8);
  return Array.from({ length: points }, (_, i) => ({
    date: `W${i + 1}`,
    score: Math.min(100, 30 + i * (70 / points) + Math.round(Math.random() * 8 - 4)),
  }));
}

const MASTERY_COLORS = [
  "bg-[#dceee6] text-[#39705e]",
  "bg-[#e5e0f0] text-[#5a4e72]",
  "bg-[#f3ead9] text-[#806b4c]",
  "bg-[#e7c2ae] text-[#674b3d]",
  "bg-[#d9ecf3] text-[#3b6d80]",
];

export function StudentProgress({
  completedLessons,
  reviewedLessons,
  topicsCovered,
  improvementPct,
  sessionHistory,
  className = "",
}: StudentProgressProps) {
  const trendData = useMemo(
    () => sessionHistory ?? generateTrendData(completedLessons),
    [sessionHistory, completedLessons]
  );

  return (
    <div className={`glass rounded-[1.5rem] p-5 sm:p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Progress overview</p>
          <h2 className="mt-2 text-xl font-bold text-[#203336]">
            Building momentum.
          </h2>
        </div>
        <TrendingUp className="h-5 w-5 text-[#5b8d7b]" />
      </div>

      {/* Metrics row */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <MetricTile
          icon={<BookOpen className="h-4 w-4" />}
          label="Completed"
          value={completedLessons}
          accent="bg-[#dceee6] text-[#39705e]"
        />
        <MetricTile
          icon={<Award className="h-4 w-4" />}
          label="Reviewed"
          value={reviewedLessons}
          accent="bg-[#e5e0f0] text-[#5a4e72]"
        />
        <MetricTile
          icon={<TrendingUp className="h-4 w-4" />}
          label="Growth"
          value={`${improvementPct}%`}
          accent="bg-[#f3ead9] text-[#806b4c]"
        />
      </div>

      {/* Skill mastery badges */}
      {topicsCovered.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">
            Topics mastered
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {topicsCovered.map((topic, i) => (
              <span
                key={topic}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${MASTERY_COLORS[i % MASTERY_COLORS.length]}`}
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Improvement trend chart */}
      {trendData.length > 1 && (
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">
            Improvement trend
          </p>
          <div className="mt-3 h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5b8d7b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#5b8d7b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(255,255,255,.92)",
                    border: "1px solid rgba(0,0,0,.08)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                  }}
                  labelStyle={{ fontWeight: 700, color: "#203336" }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#5b8d7b"
                  strokeWidth={2.5}
                  fill="url(#progressGrad)"
                  dot={{ r: 3, fill: "#5b8d7b", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#39705e", strokeWidth: 2, stroke: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Empty state */}
      {completedLessons === 0 && (
        <p className="mt-6 rounded-2xl bg-white/45 p-4 text-sm text-slate-500">
          Complete your first lesson to start tracking progress here.
        </p>
      )}
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="rounded-xl bg-white/50 p-3 text-center">
      <span
        className={`mx-auto mb-2 grid h-8 w-8 place-items-center rounded-lg ${accent}`}
      >
        {icon}
      </span>
      <p className="text-2xl font-extrabold tracking-[-.04em] text-[#203336]">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">
        {label}
      </p>
    </div>
  );
}
