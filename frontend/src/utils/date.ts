const formatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric"
});

export const toDate = (input: string | Date): Date =>
  input instanceof Date ? input : new Date(input);

export const formatDisplayDate = (input: string | Date): string => formatter.format(toDate(input));

export const isDateWithinRange = (
  target: string | Date,
  start: string | Date,
  end: string | Date
): boolean => {
  const t = toDate(target).getTime();
  const s = toDate(start).setHours(0, 0, 0, 0);
  const e = toDate(end).setHours(23, 59, 59, 999);
  return t >= s && t <= e;
};

export const getWeekDates = (anchor: Date = new Date()): Date[] => {
  const week: Date[] = [];
  const day = anchor.getDay();
  const start = new Date(anchor);
  start.setDate(anchor.getDate() - day);
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    week.push(date);
  }
  return week;
};

