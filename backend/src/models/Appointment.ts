import { Schema, model, Document, Types } from 'mongoose'

export type AppointmentStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED'

export interface IAppointment extends Document {
  patientId: Types.ObjectId
  appointmentDate: Date
  appointmentTime: string
  reason: string
  status: AppointmentStatus
  createdAt: Date
  updatedAt: Date
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    appointmentDate: {
      type: Date,
      required: true,
      index: true
    },
    appointmentTime: {
      type: String,
      required: true,
      trim: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['WAITING', 'IN_PROGRESS', 'COMPLETED'],
      default: 'WAITING',
      required: true
    }
  },
  {
    timestamps: true
  }
)

export const Appointment = model<IAppointment>('Appointment', appointmentSchema)
