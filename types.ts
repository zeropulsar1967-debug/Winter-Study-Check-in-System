
export interface CheckInRecord {
  id: string;
  date: string; // ISO format
  content: string;
  images: string[];
  studyHours: number;
  points: number;
  isHoliday?: boolean;
}

export interface UserStats {
  totalPoints: number;
  streak: number;
  checkInCount: number;
  totalStudyHours: number;
}

export interface WeeklyProgress {
  day: string;
  points: number;
  completed: boolean;
}
