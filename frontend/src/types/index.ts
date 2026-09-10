export interface Patient {
  _id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  phone: string
  allergies: string[]
  existingConditions: string[]
  createdAt?: string
  updatedAt?: string
}

export type AppointmentStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED'

export interface Appointment {
  _id: string
  appointmentDate: string
  appointmentTime: string
  reason: string
  status: AppointmentStatus
  patientId: string
  patientName: string
}

export interface StructuredClinicalNote {
  chiefComplaint: string
  symptoms: string[]
  relevantHistory: string
  medicationsMentioned: string[]
  doctorPlan: string
  missingInformation: string[]
}

export interface StructuredNote {
  chiefComplaint?: string
  symptoms?: string | string[]
  relevantHistory?: string
  medicationsMentioned?: string | string[]
  doctorPlan?: string
  missingInformation?: string | string[]
}

export interface Consultation {
  _id: string
  patientId: string
  appointmentId?: string
  rawNotes: string
  aiDraft?: StructuredNote
  finalNote?: StructuredNote
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}
