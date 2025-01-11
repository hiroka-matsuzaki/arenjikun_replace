// Event.ts
export interface Event {
  id: number;
  subject: string;
  description: string;
  url: string;
  lock_version: number;
  created_at: string; // ISO 8601形式の日時
  updated_at: string; // ISO 8601形式の日時
  created_by: number;
  updated_by: number;
  [key: string]: any; // 動的なキーアクセスを許可
}

export interface EventDate {
  id: number;
  event_id: number;
  dated_on: string; // ISO 8601形式の日付
  start_time: number; // 分単位
  end_time: number; // 分単位
  created_at: string; // ISO 8601形式の日時
  updated_at: string; // ISO 8601形式の日時
}

export interface UserPossibility {
  event_date_id: number;
  user_id: number;
  possibility: number; // 0: 不可能, 1: 可能
  comment: string;
  user_name: string;
  email: string;
}

export interface EventResponse {
  events: Event;
  event_dates: EventDate[];
  user_possibilities: UserPossibility[];
}

// イベントの配列型
export type EventList = Event[];

export interface Respondent {
  user_id: number;
  user_name: string;
}
