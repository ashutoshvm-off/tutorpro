import { useState, useMemo } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";

interface AvailabilitySlot {
  dayOfWeek: number; // 0-6, Sunday=0
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
}

interface BookedSession {
  startTime: string | Date;
  endTime: string | Date;
  topic: string;
}

interface BookingCalendarProps {
  /** Tutor's weekly recurring availability slots */
  availability: AvailabilitySlot[];
  /** Already-booked sessions to show as occupied */
  bookedSessions?: BookedSession[];
  /** Called when the student selects a slot to book */
  onBook?: (date: Date, startTime: string, endTime: string) => void;
  className?: string;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function BookingCalendar({
  availability,
  bookedSessions = [],
  onBook,
  className = "",
}: BookingCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookingSlot, setBookingSlot] = useState<{ start: string; end: string } | null>(null);
  const [bookingTopic, setBookingTopic] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(viewYear, viewMonth, d));
    return days;
  }, [viewYear, viewMonth, daysInMonth, firstDay]);

  // Available slots for the selected date
  const slotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    const dow = selectedDate.getDay();
    return availability.filter(s => s.dayOfWeek === dow);
  }, [selectedDate, availability]);

  // Check if a day has availability
  const availableDays = useMemo(() => {
    const set = new Set<number>();
    availability.forEach(s => set.add(s.dayOfWeek));
    return set;
  }, [availability]);

  // Check if a slot is already booked on the selected date
  function isSlotBooked(slot: AvailabilitySlot) {
    if (!selectedDate) return false;
    const slotStart = new Date(selectedDate);
    const [sh, sm] = slot.startTime.split(":").map(Number);
    slotStart.setHours(sh, sm, 0, 0);
    const slotEnd = new Date(selectedDate);
    const [eh, em] = slot.endTime.split(":").map(Number);
    slotEnd.setHours(eh, em, 0, 0);

    return bookedSessions.some(session => {
      const sStart = new Date(session.startTime);
      const sEnd = new Date(session.endTime);
      return sStart < slotEnd && sEnd > slotStart;
    });
  }

  function handlePrevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }

  function handleNextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  function handleSelectSlot(slot: AvailabilitySlot) {
    if (isSlotBooked(slot)) return;
    setBookingSlot({ start: slot.startTime, end: slot.endTime });
    setBookingTopic("");
    setBookingConfirmed(false);
  }

  function handleConfirmBooking() {
    if (!selectedDate || !bookingSlot || !bookingTopic.trim()) return;
    onBook?.(selectedDate, bookingSlot.start, bookingSlot.end);
    setBookingConfirmed(true);
    setTimeout(() => {
      setBookingSlot(null);
      setBookingConfirmed(false);
      setBookingTopic("");
    }, 1800);
  }

  const isPast = (date: Date) => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return date < t;
  };

  return (
    <div className={`glass rounded-[1.5rem] p-5 sm:p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Availability</p>
          <h2 className="mt-2 text-xl font-bold text-[#203336]">Book a session</h2>
        </div>
        <CalendarDays className="h-5 w-5 text-[#5b8d7b]" />
      </div>

      {/* Month navigation */}
      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="grid h-8 w-8 place-items-center rounded-lg bg-white/60 text-slate-600 hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-bold text-[#203336]">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </p>
        <button
          onClick={handleNextMonth}
          className="grid h-8 w-8 place-items-center rounded-lg bg-white/60 text-slate-600 hover:bg-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="mt-4 grid grid-cols-7 gap-1">
        {DAY_LABELS.map(d => (
          <p key={d} className="text-center text-[10px] font-bold uppercase tracking-[.1em] text-slate-400">
            {d}
          </p>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="mt-2 grid grid-cols-7 gap-1">
        {calendarDays.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const hasSlots = availableDays.has(date.getDay());
          const past = isPast(date);

          return (
            <button
              key={date.toISOString()}
              disabled={past || !hasSlots}
              onClick={() => { setSelectedDate(date); setBookingSlot(null); }}
              className={`
                relative flex h-9 items-center justify-center rounded-lg text-xs font-semibold transition-all
                ${isSelected
                  ? "bg-[#203a3a] text-white shadow-md"
                  : isToday
                    ? "bg-[#dceee6] text-[#39705e] font-bold"
                    : hasSlots && !past
                      ? "bg-white/50 text-slate-700 hover:bg-[#e5f0e9] hover:text-[#39705e]"
                      : "text-slate-300 cursor-default"
                }
              `}
            >
              {date.getDate()}
              {hasSlots && !past && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#5b8d7b]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Time slots for selected date */}
      {selectedDate && slotsForDate.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">
            Available on {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {slotsForDate.map((slot, i) => {
              const booked = isSlotBooked(slot);
              const active = bookingSlot?.start === slot.startTime && bookingSlot?.end === slot.endTime;
              return (
                <button
                  key={i}
                  disabled={booked}
                  onClick={() => handleSelectSlot(slot)}
                  className={`
                    flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all
                    ${booked
                      ? "border-slate-200 bg-slate-100 text-slate-400 cursor-default"
                      : active
                        ? "border-[#5b8d7b] bg-[#dceee6] text-[#39705e] shadow-sm"
                        : "border-transparent bg-white/60 text-slate-700 hover:border-[#cfe2d8] hover:bg-white/80"
                    }
                  `}
                >
                  <Clock3 className="h-3.5 w-3.5" />
                  {slot.startTime} – {slot.endTime}
                  {booked && <span className="ml-auto text-[9px] font-semibold uppercase text-slate-400">Booked</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Booking form */}
      {bookingSlot && !bookingConfirmed && (
        <div className="mt-4 rounded-xl border border-[#cfe2d8] bg-[#e5f0e9]/60 p-4">
          <p className="text-xs font-bold text-[#39705e]">
            {bookingSlot.start} – {bookingSlot.end} on {selectedDate?.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </p>
          <input
            value={bookingTopic}
            onChange={e => setBookingTopic(e.target.value)}
            placeholder="What would you like to cover?"
            className="mt-3 w-full rounded-lg border bg-white/80 px-3 py-2 text-sm outline-none focus:border-[#5b8d7b]"
          />
          <button
            onClick={handleConfirmBooking}
            disabled={!bookingTopic.trim()}
            className="mt-3 w-full rounded-xl bg-[#203a3a] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >
            Book this slot
          </button>
        </div>
      )}

      {/* Confirmation */}
      {bookingConfirmed && (
        <div className="mt-4 rounded-xl border border-[#5b8d7b]/30 bg-[#dceee6] p-4 text-center">
          <p className="text-sm font-bold text-[#39705e]">✓ Session booked!</p>
          <p className="mt-1 text-xs text-[#49645d]">You'll see it in your schedule shortly.</p>
        </div>
      )}

      {/* No availability */}
      {availability.length === 0 && (
        <p className="mt-6 rounded-2xl bg-white/45 p-4 text-sm text-slate-500">
          Your tutor hasn't set availability yet. Check back soon.
        </p>
      )}
    </div>
  );
}
