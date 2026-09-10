import { Schema, model, Document } from 'mongoose'

export interface IPatient extends Document {
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: string
  phone: string
  allergies: string[]
  existingConditions: string[]
  createdAt: Date
  updatedAt: Date
}

const patientSchema = new Schema<IPatient>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    allergies: {
      type: [String],
      default: []
    },
    existingConditions: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
)

export const Patient = model<IPatient>('Patient', patientSchema)
