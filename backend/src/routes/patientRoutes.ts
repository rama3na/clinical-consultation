import { Elysia } from 'elysia'
import mongoose from 'mongoose'
import { Patient } from '../models/Patient.js'
import { Consultation } from '../models/Consultation.js'

export const patientRoutes = new Elysia({ prefix: '/patients' })
  .get('/:id', async ({ params: { id }, set }) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        set.status = 400
        return {
          success: false,
          message: 'Invalid patient ID format'
        }
      }

      const patient = await Patient.findById(id).lean()

      if (!patient) {
        set.status = 404
        return {
          success: false,
          message: 'Patient not found'
        }
      }

      return {
        success: true,
        data: patient
      }
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error)
      set.status = 500
      return {
        success: false,
        message: 'Failed to retrieve patient profile'
      }
    }
  })
  .get('/:id/consultations', async ({ params: { id }, set }) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        set.status = 400
        return {
          success: false,
          message: 'Invalid patient ID format'
        }
      }

      const patientExists = await Patient.exists({ _id: id })
      if (!patientExists) {
        set.status = 404
        return {
          success: false,
          message: 'Patient not found'
        }
      }

      const consultations = await Consultation.find({ patientId: id })
        .sort({ createdAt: -1 })
        .lean()

      return {
        success: true,
        data: consultations
      }
    } catch (error) {
      console.error(`Error fetching consultations for patient ${id}:`, error)
      set.status = 500
      return {
        success: false,
        message: 'Failed to retrieve patient consultations'
      }
    }
  })
