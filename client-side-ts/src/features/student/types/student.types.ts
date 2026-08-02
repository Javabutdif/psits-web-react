export interface StudentProfile {
  id_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  course: string;
  year: string | number;
  email: string;
  campus: string;
}
export interface StudentProfileResponse {
  data: StudentProfile;
}
