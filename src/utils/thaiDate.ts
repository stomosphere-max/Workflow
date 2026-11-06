export const THAI_MONTHS_FULL = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export const THAI_DAYS_FULL = [
  'อาทิตย์',
  'จันทร์',
  'อังคาร',
  'พุธ',
  'พฤหัสบดี',
  'ศุกร์',
  'เสาร์',
];

// Week starting Monday
export const THAI_DAYS_SHORT_MON_START = [
  { key: 1, full: 'วันจันทร์', short: 'จ.', code: 'Mon' },
  { key: 2, full: 'วันอังคาร', short: 'อ.', code: 'Tue' },
  { key: 3, full: 'วันพุธ', short: 'พ.', code: 'Wed' },
  { key: 4, full: 'วันพฤหัสบดี', short: 'พฤ.', code: 'Thu' },
  { key: 5, full: 'วันศุกร์', short: 'ศ.', code: 'Fri' },
  { key: 6, full: 'วันเสาร์', short: 'ส.', code: 'Sat' },
  { key: 0, full: 'วันอาทิตย์', short: 'อา.', code: 'Sun' },
];

/**
 * Returns year in Buddhist Era (พ.ศ.)
 */
export function getBuddhistYear(date: Date = new Date()): number {
  return date.getFullYear() + 543;
}

/**
 * Formats a date into Thai format with Buddhist Era (พ.ศ.)
 * e.g., "5 พฤศจิกายน 2569" or "5 พ.ย. 2569"
 */
export function formatThaiDate(
  dateInput: string | Date | undefined,
  options?: {
    shortMonth?: boolean;
    includeDayName?: boolean;
    includeTime?: boolean;
    hideYear?: boolean;
  }
): string {
  if (!dateInput) return '-';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '-';

  const day = d.getDate();
  const monthIdx = d.getMonth();
  const yearBE = d.getFullYear() + 543;
  const monthName = options?.shortMonth
    ? THAI_MONTHS_SHORT[monthIdx]
    : THAI_MONTHS_FULL[monthIdx];

  let result = `${day} ${monthName}`;
  if (!options?.hideYear) {
    result += ` ${yearBE}`;
  }

  if (options?.includeDayName) {
    const dayName = THAI_DAYS_FULL[d.getDay()];
    result = `วัน${dayName}ที่ ${result}`;
  }

  if (options?.includeTime) {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    result += ` เวลา ${hours}:${minutes} น.`;
  }

  return result;
}

/**
 * Formats YYYY-MM-DD string to Thai short date e.g. "5 พ.ย. 69"
 */
export function formatThaiDateShort(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const month = parseInt(parts[1], 10) - 1;
  const yearBE = (parseInt(parts[0], 10) + 543) % 100;
  return `${day} ${THAI_MONTHS_SHORT[month]} ${yearBE}`;
}

/**
 * Converts a Date to ISO date string "YYYY-MM-DD"
 */
export function toIsoDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns human-readable relative Thai due status
 */
export function getRelativeDueLabel(dueDateStr: string): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  isSoon: boolean;
  colorClass: string;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [y, m, d] = dueDateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `เกินกำหนด ${Math.abs(diffDays)} วัน`,
      isOverdue: true,
      isToday: false,
      isSoon: false,
      colorClass: 'text-rose-600 bg-rose-50 border-rose-200',
    };
  } else if (diffDays === 0) {
    return {
      label: 'ครบกำหนดวันนี้',
      isOverdue: false,
      isToday: true,
      isSoon: true,
      colorClass: 'text-amber-700 bg-[#FFF0D9] border-amber-200',
    };
  } else if (diffDays === 1) {
    return {
      label: 'ครบกำหนดพรุ่งนี้',
      isOverdue: false,
      isToday: false,
      isSoon: true,
      colorClass: 'text-purple-700 bg-[#E9E1FF] border-purple-200',
    };
  } else {
    return {
      label: `อีก ${diffDays} วัน`,
      isOverdue: false,
      isToday: false,
      isSoon: false,
      colorClass: 'text-slate-600 bg-slate-50 border-slate-200',
    };
  }
}

/**
 * Checks if two time ranges overlap on the same date
 */
export function hasTimeConflict(
  start1?: string,
  end1?: string,
  start2?: string,
  end2?: string
): boolean {
  if (!start1 || !end1 || !start2 || !end2) return false;
  return start1 < end2 && start2 < end1;
}

/**
 * Generates calendar month days starting from Monday
 */
export interface CalendarCell {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function generateCalendarMonth(year: number, month: number): CalendarCell[] {
  const cells: CalendarCell[] = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const todayStr = toIsoDateString(new Date());

  // In JS: 0=Sun, 1=Mon, ..., 6=Sat
  // Monday-start offset: 0 -> Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7;

  // Preceding month filler
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    const dateStr = toIsoDateString(d);
    cells.push({
      date: d,
      dateStr,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(year, month, i);
    const dateStr = toIsoDateString(d);
    cells.push({
      date: d,
      dateStr,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Trailing next month filler to complete 6 weeks (42 cells) or 5 weeks (35 cells)
  const remaining = (7 - (cells.length % 7)) % 7;
  const targetTotal = cells.length + remaining < 35 ? 35 : cells.length + remaining;
  const extraCount = targetTotal - cells.length;

  for (let i = 1; i <= extraCount; i++) {
    const d = new Date(year, month + 1, i);
    const dateStr = toIsoDateString(d);
    cells.push({
      date: d,
      dateStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  return cells;
}

/**
 * Generates 7 days of the week starting from Monday for a given reference date
 */
export function generateWeekDays(refDate: Date): CalendarCell[] {
  const currentDay = refDate.getDay();
  // Monday is 1, Sunday is 0 -> offset from Monday
  const mondayOffset = (currentDay + 6) % 7;
  const monday = new Date(refDate);
  monday.setDate(refDate.getDate() - mondayOffset);

  const days: CalendarCell[] = [];
  const todayStr = toIsoDateString(new Date());

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = toIsoDateString(d);
    days.push({
      date: d,
      dateStr,
      dayNumber: d.getDate(),
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  return days;
}
