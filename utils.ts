
import { POINT_RULES, HOLIDAY_RANGE } from './constants';
import { CheckInRecord } from './types';

export const calculatePoints = (hours: number): number => {
  // 1 point for check-in + (hours / 0.5) points
  const calculated = POINT_RULES.BASE_CHECKIN + (hours * 2);
  return Math.min(calculated, POINT_RULES.DAILY_CAP);
};

export const isHoliday = (date: Date): boolean => {
  return date >= HOLIDAY_RANGE.start && date <= HOLIDAY_RANGE.end;
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getWeekRange = (date: Date): { start: string; end: string } => {
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(current.setDate(diff));
  const sunday = new Date(current.setDate(diff + 6));
  return {
    start: formatDate(monday),
    end: formatDate(sunday)
  };
};

export const checkWeeklyFullAttendance = (records: CheckInRecord[], targetDate: Date): boolean => {
  const { start, end } = getWeekRange(targetDate);
  const weekRecords = records.filter(r => r.date >= start && r.date <= end);
  
  // A simplified check: if there are 7 distinct dates recorded for the week
  const uniqueDates = new Set(weekRecords.map(r => r.date));
  return uniqueDates.size === 7;
};
