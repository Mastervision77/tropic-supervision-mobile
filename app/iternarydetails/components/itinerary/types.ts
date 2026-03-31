export interface Attachment {
  id: number;
  name: string;
  url: string;
}

export interface Comment {
  id: number;
  comment: string;
  created_at: string;
}

export interface Task {
  id: number;
  name: string;
  description: string;
  can_checkin: number;
  is_checked_in: number;
  checkin_time: string;
  latitude: string;
  longitude: string;
  created_at: string;
  comments: Comment[];
}

export interface Day {
  id: number;
  day_number: number;
  day_date: string;
  title: string;
  description: string;
  attachments: Attachment[];
  tasks: Task[];
}

export interface ProgramTrip {
  id: number;
  program: string;
  travel_date: string;
  return_date: string;
}

export interface ItineraryDetail {
  id: number;
  name: string;
  description: string;
  program_trip: ProgramTrip;
  days: Day[];
  total_expenses: number;
}

export interface ApiResponse {
  data: ItineraryDetail;
}