import {
  Appointment,
  AppointmentStatus,
  Patient,
  Consultation,
  ApiResponse,
  StructuredClinicalNote,
  StructuredNote
} from '../types'


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  })

  let json: ApiResponse<T>
  try {
    json = await res.json()
  } catch {
    throw new Error(`Server returned ${res.status} with non-JSON response`)
  }

  if (!res.ok || !json.success) {
    throw new Error(json.message || `API error (${res.status})`)
  }

  return json.data as T
}

export async function getTodayAppointments(): Promise<Appointment[]> {
  return fetchJson<Appointment[]>('/appointments/today')
}

export async function getPatient(id: string): Promise<Patient> {
  return fetchJson<Patient>(`/patients/${id}`)
}

export async function getPatientConsultations(patientId: string): Promise<Consultation[]> {
  return fetchJson<Consultation[]>(`/patients/${patientId}/consultations`)
}

export async function structureNoteWithAi(rawNotes: string): Promise<StructuredClinicalNote> {
  return fetchJson<StructuredClinicalNote>('/ai/structure-note', {
    method: 'POST',
    body: JSON.stringify({ rawNotes })
  })
}

export async function createConsultation(payload: {
  patientId: string
  appointmentId?: string
  rawNotes: string
  aiDraft?: StructuredClinicalNote | StructuredNote | Record<string, unknown>
  finalNote?: StructuredNote | Record<string, unknown>
}): Promise<Consultation> {
  return fetchJson<Consultation>('/consultations', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<Appointment> {
  return fetchJson<Appointment>(`/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
}

