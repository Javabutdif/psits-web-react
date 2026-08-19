import api from "@/api/axios";
import axios, { AxiosError } from "axios";
import backendConnection from "../../../api/backendApi";
import { showToast } from "../../../utils/alertHelper";
import type {
  AddAttendeeFormData,
  AddAttendeeV2Payload,
  AddAttendeeV2Response,
  AddWalkInAttendeeV2Payload,
  AddWalkInAttendeeV2Response,
  ApiErrorResponse,
  ChangeAttendeePasswordV2Payload,
  ChangeAttendeePasswordV2Response,
  CreateEventData,
  CreateEventResponse,
  CreateEventV2Payload,
  CreateEventV2Response,
  DrawRaffleWinnerResponse,
  EditableAttendeeResponse,
  EditAttendeeV2Payload,
  EditAttendeeV2Response,
  Event,
  EventCheckData,
  EventStatisticsResponse,
  GetAttendeesParams,
  GetRafflePoolResponse,
  MarkAttendanceV2Payload,
  MarkAttendanceV2Response,
  PaginatedAttendeesResponse,
  RaffleQueryParams,
  RaffleResponse,
  RaffleWinnerResponse,
  RemoveAttendeeFormData,
  RemoveRaffleResponse,
  StatisticsData,
  StudentSearchResult,
  UpdateSettingsFormData,
} from "../types/event.types";

const getAuthToken = (): string | null => {
  return sessionStorage.getItem("Token");
};

// Helper function to handle API errors
const handleApiError = (
  error: unknown,
  shouldReload: boolean = false
): false => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.data) {
      if (shouldReload) {
        //uncomment the line if its not error
        // window.location.reload();
      }
      console.error(
        "Error:",
        axiosError.response.data.message || "An error occurred"
      );
    } else {
      console.error("Error:", "An error occurred");
    }
  } else {
    console.error("Error:", error);
  }
  return false;
};

// Optional: You can define an interface for the expected API response shape
interface EventApiResponse {
  data: Event[];
}

interface EventByIdApiResponse {
  data: Event;
}

export const getEvents = async (): Promise<Event[] | false> => {
  try {
    const response = await api.get<EventApiResponse>(
      "/api/v2/events/get-all-event"
    );

    const eventsArray = response.data.data;

    return Array.isArray(eventsArray) ? eventsArray : [];
  } catch (error) {
    return handleApiError(error, true);
  }
};

export const getAllEventsRaw = async (): Promise<Event[] | false> => {
  try {
    const response = await api.get<EventApiResponse>(
      "/api/v2/events/get-all-events-raw"
    );

    const eventsArray = response.data.data;

    return Array.isArray(eventsArray) ? eventsArray : [];
  } catch (error) {
    return handleApiError(error, true);
  }
};
/**
 * GET /api/v2/events/my-events
 *
 * Returns all events where each event's `attendees` array contains only the
 * requesting student's record (from the JWT), or an empty array if they are
 * not listed.
 */
export const getMyEvents = async (): Promise<Event[]> => {
  const response = await api.get<{ data: Event[] }>("/api/v2/events/my-events");
  return Array.isArray(response.data.data) ? response.data.data : [];
};

export const getEventById = async (eventId: string): Promise<Event | false> => {
  try {
    if (!eventId?.trim()) {
      return false;
    }

    const response = await api.get<EventByIdApiResponse>(
      `/api/v2/events/${eventId}`
    );

    return response.data.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createEventV2 = async (
  payload: CreateEventV2Payload
): Promise<CreateEventV2Response | false> => {
  try {
    const formData = new FormData();
    formData.append("eventName", payload.eventName);
    formData.append("eventDescription", payload.eventDescription ?? "");
    formData.append("eventDate", payload.eventDate);
    if (payload.eventEndDate)
      formData.append("eventEndDate", payload.eventEndDate);
    formData.append("attendanceType", payload.attendanceType);
    if (payload.status) formData.append("status", payload.status);
    formData.append("sessionConfig", JSON.stringify(payload.sessionConfig));
    if (payload.limit && payload.limit.length > 0) {
      formData.append("limit", JSON.stringify(payload.limit));
    }
    if (payload.eventVenue) formData.append("eventVenue", payload.eventVenue);
    if (payload.eventTheme) formData.append("eventTheme", payload.eventTheme);
    if (payload.eventVenueSpecific)
      formData.append("eventVenueSpecific", payload.eventVenueSpecific);
    if (payload.eventStartTime)
      formData.append("eventStartTime", payload.eventStartTime);
    if (payload.eventEndTime)
      formData.append("eventEndTime", payload.eventEndTime);
    payload.images?.forEach((file) => formData.append("images", file));

    const response = await api.post<CreateEventV2Response>(
      "/api/v2/events",
      formData,
      { headers: { "Content-Type": undefined } }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create event";
      showToast("error", String(message));
    } else {
      console.error("Error creating event:", error);
      showToast("error", "Failed to create event");
    }
    return false;
  }
};

export const createEvent = async (
  data: CreateEventData
): Promise<CreateEventResponse | false> => {
  try {
    const token = getAuthToken();
    const response = await axios.post<CreateEventResponse>(
      `${backendConnection()}/api/events/create-event`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    return handleApiError(error, true);
  }
};

export const updateEvent = async (
  eventId: string,
  data: Partial<Event>
): Promise<boolean> => {
  try {
    const token = getAuthToken();
    const response = await axios.put(
      `${backendConnection()}/api/events/update-event/${eventId}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      showToast("success", "Event updated successfully!");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating event:", error);
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Failed to update event"
      : "Failed to update event";
    showToast("error", errorMessage);
    return false;
  }
};

export const getAttendees = async (
  eventId: string,
  params: GetAttendeesParams = {}
): Promise<PaginatedAttendeesResponse | false> => {
  try {
    if (!eventId?.trim()) {
      return false;
    }

    const normalizedParams = {
      ...params,
      attendanceStatus:
        params.attendanceStatus && params.attendanceStatus.length > 0
          ? params.attendanceStatus.join(",")
          : undefined,
      course:
        params.course && params.course.length > 0
          ? params.course.join(",")
          : undefined,
      yearLevel:
        params.yearLevel && params.yearLevel.length > 0
          ? params.yearLevel.join(",")
          : undefined,
    };

    const response = await api.get<PaginatedAttendeesResponse>(
      `/api/v2/events/${eventId}/attendees`,
      { params: normalizedParams }
    );

    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const markAsPresent = async (
  eventId: string,
  attendeeId: string,
  campus: string,
  course: string,
  year: string,
  attendeeName: string
): Promise<boolean | undefined> => {
  try {
    const token = getAuthToken();
    const url = `${backendConnection()}/api/events/attendance/${eventId}/${attendeeId}`;

    const response = await axios.put(
      url,
      {
        campus,
        attendeeName,
        course,
        year,
        currentDate: new Date(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      showToast("success", "Attendance successfully recorded!");
      return true;
    }
  } catch (error) {
    console.error("Error marking attendance:", error);

    if (axios.isAxiosError(error) && error.response) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred while recording attendance.");
    }
  }
};

export const getEventCheck = async (
  eventId: string
): Promise<EventCheckData | false> => {
  try {
    const token = getAuthToken();
    const response = await axios.get<{ data: EventCheckData }>(
      `${backendConnection()}/api/events/check-limit/${eventId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateEventSettings = async (
  formData: UpdateSettingsFormData,
  eventId: string
): Promise<boolean> => {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${backendConnection()}/api/events/update-settings/${eventId}`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.status === 200;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getEligibleRaffleAttendees = async (
  eventId: string
): Promise<RaffleResponse | AxiosError> => {
  try {
    const token = getAuthToken();
    const response = await axios.get<RaffleResponse>(
      `${backendConnection()}/api/events/raffle/${eventId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching eligible attendees:", error);
    return error as AxiosError;
  }
};

export const getEligibleRaffleAttendeesV2 = async (
  eventId: string,
  params?: RaffleQueryParams
): Promise<GetRafflePoolResponse> => {
  const { data } = await api.get<GetRafflePoolResponse>(
    `${backendConnection()}/api/v2/events/raffle/${eventId}`,
    { params }
  );
  return data;
};

export const drawRaffleWinner = async (
  eventId: string,
  params?: RaffleQueryParams
): Promise<DrawRaffleWinnerResponse> => {
  const { data } = await api.post<DrawRaffleWinnerResponse>(
    `${backendConnection()}/api/v2/events/raffle/${eventId}/draw`,
    undefined,
    { params }
  );
  return data;
};

export const undoRaffleWinner = async (
  eventId: string,
  attendeeId: string
): Promise<{ message: string }> => {
  const { data } = await api.post<{ message: string }>(
    `${backendConnection()}/api/v2/events/raffle/${eventId}/undo/${attendeeId}`
  );
  return data;
};

export const raffleWinner = async (
  eventId: string,
  attendeeId: string,
  attendeeName: string
): Promise<RaffleWinnerResponse | AxiosError> => {
  try {
    const token = getAuthToken();
    const response = await axios.post<RaffleWinnerResponse>(
      `${backendConnection()}/api/events/raffle/winner/${eventId}/${attendeeId}`,
      { attendeeName },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking attendee as raffle winner:", error);
    return error as AxiosError;
  }
};

export const removeRaffleAttendee = async (
  eventId: string,
  attendeeId: string,
  attendeeName: string
): Promise<RemoveRaffleResponse | false> => {
  try {
    const token = getAuthToken();
    const response = await axios.put<RemoveRaffleResponse>(
      `${backendConnection()}/api/events/raffle/remove/${eventId}/${attendeeId}`,
      { attendeeName },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error removing attendee from raffle:", error);
    return false;
  }
};

export const addAttendee = async (
  formData: AddAttendeeFormData
): Promise<boolean> => {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${backendConnection()}/api/events/add-attendee`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    showToast(
      response.status === 200 ? "success" : "error",
      response.data.message
    );
    return response.status === 200;
  } catch (error) {
    console.error("Error adding attendee:", error);
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Something went wrong"
      : "Something went wrong";
    showToast("error", errorMessage);
    return false;
  }
};

export const addAttendeeV2 = async (
  eventId: string,
  payload: AddAttendeeV2Payload
): Promise<AddAttendeeV2Response | false> => {
  try {
    if (!eventId?.trim()) {
      showToast("error", "Event ID is required");
      return false;
    }

    const response = await api.post<AddAttendeeV2Response>(
      `/api/v2/events/${eventId}/attendees`,
      payload
    );

    if (
      response.data.data.isNewStudent &&
      response.data.data.emailSent === false
    ) {
      showToast("warning", response.data.message);
    } else {
      showToast("success", response.data.message);
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.message || "Failed to add attendee";
      showToast("error", message);
    } else {
      console.error("Error adding attendee V2:", error);
      showToast("error", "An unexpected error occurred");
    }
    return false;
  }
};

// ─── Walk-in Attendee V2 ─────────────────────────────────────────────────────

export const addWalkInAttendeeV2 = async (
  eventId: string,
  payload: AddWalkInAttendeeV2Payload
): Promise<AddWalkInAttendeeV2Response | false> => {
  try {
    if (!eventId?.trim()) {
      showToast("error", "Event ID is required");
      return false;
    }

    const response = await api.post<AddWalkInAttendeeV2Response>(
      `/api/v2/events/${eventId}/attendees/walk-in`,
      payload
    );

    showToast("success", response.data.message);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.message || "Failed to add walk-in attendee";
      showToast("error", message);
    } else {
      console.error("Error adding walk-in attendee V2:", error);
      showToast("error", "An unexpected error occurred");
    }
    return false;
  }
};

// ─── Student Search V2 ───────────────────────────────────────────────────────

export const searchStudentsV2 = async (
  query: string
): Promise<StudentSearchResult[] | false> => {
  try {
    if (!query?.trim()) {
      return [];
    }

    const response = await api.get<{ data: StudentSearchResult[] }>(
      `/api/v2/students/search`,
      { params: { q: query.trim() } }
    );

    return response.data.data ?? [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.message || "Failed to search students";
      showToast("error", message);
    } else {
      console.error("Error searching students V2:", error);
      showToast("error", "An unexpected error occurred");
    }
    return false;
  }
};

interface ApplyToEventResponse {
  message: string;
  data: {
    id_number: string;
    name: string;
    campus: string;
  };
}

export const applyToEvent = async (
  eventId: string
): Promise<ApplyToEventResponse | false> => {
  try {
    if (!eventId?.trim()) {
      showToast("error", "Event ID is required");
      return false;
    }

    const response = await api.post<ApplyToEventResponse>(
      `/api/v2/events/${eventId}/apply`
    );

    showToast("success", response.data.message);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.message || "Failed to apply to event";
      showToast("error", message);
    } else {
      console.error("Error applying to event:", error);
      showToast("error", "An unexpected error occurred");
    }
    return false;
  }
};

export const getStatistic = async (
  eventId: string
): Promise<StatisticsData | [] | false> => {
  try {
    const token = getAuthToken();
    const response = await axios.get<StatisticsData>(
      `${backendConnection()}/api/events/get-statistics/${eventId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.status === 200 ? response.data : [];
  } catch (error) {
    return handleApiError(error);
  }
};

export const getEventStatisticsV2 = async (
  eventId: string
): Promise<EventStatisticsResponse | false> => {
  try {
    if (!eventId?.trim()) {
      return false;
    }

    const response = await api.get<EventStatisticsResponse>(
      `/api/v2/events/${eventId}/statistics`
    );

    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const removeAttendee = async (
  formData: RemoveAttendeeFormData
): Promise<boolean | AxiosError> => {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${backendConnection()}/api/events/remove-attendance`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    showToast(
      response.status === 200 ? "success" : "error",
      response.data.message
    );
    return response.status === 200;
  } catch (error) {
    return error as AxiosError;
  }
};

export const removeEvent = async (
  eventId: string
): Promise<boolean | AxiosError> => {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${backendConnection()}/api/events/remove-event`,
      { eventId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    showToast(
      response.status === 200 ? "success" : "error",
      response.data.message
    );
    return response.status === 200;
  } catch (error) {
    return error as AxiosError;
  }
};

// ─── Attendance V2 ───────────────────────────────────────────────────────────

export const markAttendanceV2 = async (
  eventId: string,
  idNumber: string,
  payload: MarkAttendanceV2Payload
): Promise<MarkAttendanceV2Response | false> => {
  try {
    if (!eventId?.trim() || !idNumber?.trim()) {
      showToast("error", "Event ID and Student ID are required");
      return false;
    }

    const response = await api.put<MarkAttendanceV2Response>(
      `/api/v2/events/${eventId}/attendance/${idNumber}`,
      payload
    );

    showToast("success", response.data.message);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.message || "Failed to mark attendance";
      showToast("error", message);
    } else {
      console.error("Error marking attendance V2:", error);
      showToast("error", "An unexpected error occurred");
    }
    return false;
  }
};

// ─── Edit Attendee V2 ────────────────────────────────────────────────────────

export const getEditableAttendee = async (
  eventId: string,
  idNumber: string
): Promise<EditableAttendeeResponse | false> => {
  try {
    if (!eventId?.trim() || !idNumber?.trim()) {
      return false;
    }

    const response = await api.get<EditableAttendeeResponse>(
      `/api/v2/events/${eventId}/attendees/${idNumber}/editable`
    );

    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const editAttendeeV2 = async (
  eventId: string,
  idNumber: string,
  payload: EditAttendeeV2Payload
): Promise<EditAttendeeV2Response | false> => {
  try {
    if (!eventId?.trim() || !idNumber?.trim()) {
      showToast("error", "Event ID and Student ID are required");
      return false;
    }

    const response = await api.put<EditAttendeeV2Response>(
      `/api/v2/events/${eventId}/attendees/${idNumber}`,
      payload
    );

    showToast("success", response.data.message);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.message || "Failed to update attendee";
      showToast("error", message);
    } else {
      console.error("Error editing attendee V2:", error);
      showToast("error", "An unexpected error occurred");
    }
    return false;
  }
};

export const changeAttendeePasswordV2 = async (
  eventId: string,
  idNumber: string,
  payload: ChangeAttendeePasswordV2Payload
): Promise<ChangeAttendeePasswordV2Response | false> => {
  try {
    if (!eventId?.trim() || !idNumber?.trim()) {
      showToast("error", "Event ID and Student ID are required");
      return false;
    }

    const response = await api.put<ChangeAttendeePasswordV2Response>(
      `/api/v2/events/${eventId}/attendees/${idNumber}/password`,
      payload
    );

    showToast("success", response.data.message);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.message || "Failed to change password";
      showToast("error", message);
    } else {
      console.error("Error changing attendee password:", error);
      showToast("error", "An unexpected error occurred");
    }
    return false;
  }
};

/**
 * Fields the API expects as JSON rather than as plain scalars.
 *
 * Declaring these explicitly keeps the multipart and JSON request paths in
 * agreement. Inferring the encoding from `typeof value` at runtime meant a
 * nested object was stringified on the multipart path but sent as a real
 * object on the JSON path — so the controller received two different shapes
 * for `sessionConfig` depending on whether an image happened to be attached.
 */
const JSON_ENCODED_FIELDS = new Set(["sessionConfig", "limit"]);

export const updateEventDetails = async (
  eventId: string,
  payload: {
    eventName?: string;
    eventDescription?: string;
    eventDate?: string;
    eventEndDate?: string;
    eventVenue?: string;
    eventTheme?: string;
    eventVenueSpecific?: string;
    eventStartTime?: string;
    eventEndTime?: string;
    attendanceType?: string;
    status?: string;
    sessionConfig?: unknown;
    limit?: unknown;
    image?: File | null;
  }
): Promise<any> => {
  const { image, ...rest } = payload;

  if (image) {
    const formData = new FormData();

    for (const [key, value] of Object.entries(rest)) {
      if (value === undefined || value === null) continue;

      formData.append(
        key,
        JSON_ENCODED_FIELDS.has(key) || typeof value !== "string"
          ? JSON.stringify(value)
          : value
      );
    }

    formData.append("images", image);

    const response = await api.patch(`/api/v2/events/${eventId}`, formData, {
      headers: { "Content-Type": undefined },
    });
    return response.data;
  }

  const response = await api.patch(`/api/v2/events/${eventId}`, rest);
  return response.data;
};
