import { Schema, model, Document, Types } from 'mongoose'

export interface IStructuredNote {
  chiefComplaint?: string
  symptoms?: string[] | string
  relevantHistory?: string
  medicationsMentioned?: string[] | string
  doctorPlan?: string
  missingInformation?: string[] | string
}

export interface IConsultation extends Document {
  patientId: Types.ObjectId
  appointmentId?: Types.ObjectId
  rawNotes: string
  aiDraft?: IStructuredNote
  finalNote?: IStructuredNote
  createdAt: Date
  updatedAt: Date
}

const structuredNoteSchema = new Schema<IStructuredNote>(
  {
    chiefComplaint: {
      type: String,
      default: ''
    },
    symptoms: {
      type: Schema.Types.Mixed,
      default: () => []
    },
    relevantHistory: {
      type: String,
      default: ''
    },
    medicationsMentioned: {
      type: Schema.Types.Mixed,
      default: () => []
    },
    doctorPlan: {
      type: String,
      default: ''
    },
    missingInformation: {
      type: Schema.Types.Mixed,
      default: () => []
    }
  },
  {
    _id: false
  }
)

const consultationSchema = new Schema<IConsultation>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: false
    },
    rawNotes: {
      type: String,
      required: true
    },
    aiDraft: {
      type: structuredNoteSchema,
      required: false
    },
    finalNote: {
      type: structuredNoteSchema,
      required: false
    }
  },
  {
    timestamps: true
  }
)

export const Consultation = model<IConsultation>('Consultation', consultationSchema)
