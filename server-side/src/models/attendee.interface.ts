export interface IAttendanceSessionType {
  attended: boolean;
  timestamp: Date | null;
}
export interface IAttendanceSession {
  morning: IAttendanceSessionType;
  afternoon: IAttendanceSessionType;
  evening: IAttendanceSessionType;
}

export interface IAttendee {
  id_number: string;
  name: string;
  course: string;
  year: number;
  campus: string;
  requirements: IAttendeeRequirements;
  attendance: IAttendanceSession;
  confirmedBy: string;
  shirtSize: string;
  shirtPrice: number;
  raffleIsRemoved: boolean;
  raffleIsWinner: boolean;
  transactBy: string;
  transactDate: Date | null;
}

export interface IAttendeeRequirements {
  insurance: boolean;
  prelim_payment: boolean;
  midterm_payment: boolean;
}
