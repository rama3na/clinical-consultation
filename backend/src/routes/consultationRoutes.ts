import { Elysia } from 'elysia'
import mongoose from 'mongoose'
import { Consultation } from '../models/Consultation.js'
import { Patient } from '../models/Patient.js'

interface CreateConsultationBody {
  patientId: string
  appointmentId?: string
  rawNotes: string
  aiDraft?: Record<string, unknown>
  finalNote?: Record<string, unknown>
}

interface UpdateConsultationBody {
  rawNotes?: string
  aiDraft?: Record<string, unknown>
  finalNote?: Record<string, unknown>
}

function sanitizeStructuredNote(note?: unknown): Record<string, unknown> | undefined {
  if (!note || typeof note !== 'object') return undefined
  const obj = note as Record<string, unknown>

  const chiefComplaint = typeof obj.chiefComplaint === 'string' ? obj.chiefComplaint.trim() : ''
  const symptoms = Array.isArray(obj.symptoms)
    ? obj.symptoms.map((s) => String(s).trim()).filter(Boolean)
    : typeof obj.symptoms === 'string' && obj.symptoms.trim()
      ? [obj.symptoms.trim()]
      : []
  const relevantHistory = typeof obj.relevantHistory === 'string' ? obj.relevantHistory.trim() : ''
  const medicationsMentioned = Array.isArray(obj.medicationsMentioned)
    ? obj.medicationsMentioned.map((s) => String(s).trim()).filter(Boolean)
    : typeof obj.medicationsMentioned === 'string' && obj.medicationsMentioned.trim()
      ? [obj.medicationsMentioned.trim()]
      : []
  const doctorPlan = typeof obj.doctorPlan === 'string' ? obj.doctorPlan.trim() : ''
  const missingInformation = Array.isArray(obj.missingInformation)
    ? obj.missingInformation.map((s) => String(s).trim()).filter(Boolean)
    : typeof obj.missingInformation === 'string' && obj.missingInformation.trim()
      ? [obj.missingInformation.trim()]
      : []

  const hasAnyContent =
    Boolean(chiefComplaint) ||
    symptoms.length > 0 ||
    Boolean(relevantHistory) ||
    medicationsMentioned.length > 0 ||
    Boolean(doctorPlan) ||
    missingInformation.length > 0

  if (!hasAnyContent) {
    return undefined
  }

  return {
    chiefComplaint,
    symptoms,
    relevantHistory,
    medicationsMentioned,
    doctorPlan,
    missingInformation
  }
}

export const consultationRoutes = new Elysia({ prefix: '/consultations' })
  .post('/', async ({ body, set }) => {
    try {
      const payload = body as CreateConsultationBody

      if (!payload || typeof payload !== 'object') {
        set.status = 400
        return {
          success: false,
          message: 'Request body is required'
        }
      }

      const { patientId, appointmentId, rawNotes, aiDraft, finalNote } = payload

      if (!patientId || typeof patientId !== 'string' || !patientId.trim()) {
        set.status = 400
        return {
          success: false,
          message: 'patientId is required'
        }
      }

      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        set.status = 400
        return {
          success: false,
          message: 'Invalid patientId format'
        }
      }

      if (!rawNotes || typeof rawNotes !== 'string' || !rawNotes.trim()) {
        set.status = 400
        return {
          success: false,
          message: 'rawNotes is required'
        }
      }

      if (appointmentId && (!mongoose.Types.ObjectId.isValid(appointmentId) || typeof appointmentId !== 'string')) {
        set.status = 400
        return {
          success: false,
          message: 'Invalid appointmentId format'
        }
      }

      const patientExists = await Patient.exists({ _id: patientId })
      if (!patientExists) {
        set.status = 404
        return {
          success: false,
          message: 'Patient not found'
        }
      }

      const cleanedAiDraft = sanitizeStructuredNote(aiDraft)
      const cleanedFinalNote = sanitizeStructuredNote(finalNote)

      const newConsultation = await Consultation.create({
        patientId,
        appointmentId: appointmentId || undefined,
        rawNotes: rawNotes.trim(),
        aiDraft: cleanedAiDraft,
        finalNote: cleanedFinalNote
      })

      set.status = 201
      return {
        success: true,
        data: newConsultation
      }
    } catch (error) {
      console.error('Error creating consultation:', error)
      set.status = 500
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create consultation'
      }
    }
  })
  .patch('/:id', async ({ params: { id }, body, set }) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        set.status = 400
        return {
          success: false,
          message: 'Invalid consultation ID format'
        }
      }

      const payload = body as UpdateConsultationBody

      if (!payload || typeof payload !== 'object') {
        set.status = 400
        return {
          success: false,
          message: 'Request body is required'
        }
      }

      const { rawNotes, aiDraft, finalNote } = payload
      const updateData: Record<string, unknown> = {}

      if (rawNotes !== undefined) {
        if (typeof rawNotes !== 'string' || !rawNotes.trim()) {
          set.status = 400
          return {
            success: false,
            message: 'rawNotes must be a non-empty string if provided'
          }
        }
        updateData.rawNotes = rawNotes.trim()
      }

      if (aiDraft !== undefined) {
        updateData.aiDraft = sanitizeStructuredNote(aiDraft)
      }

      if (finalNote !== undefined) {
        updateData.finalNote = sanitizeStructuredNote(finalNote)
      }

      if (Object.keys(updateData).length === 0) {
        set.status = 400
        return {
          success: false,
          message: 'No valid fields provided to update'
        }
      }

      const updatedConsultation = await Consultation.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )

      if (!updatedConsultation) {
        set.status = 404
        return {
          success: false,
          message: 'Consultation not found'
        }
      }

      return {
        success: true,
        data: updatedConsultation
      }
    } catch (error) {
      console.error(`Error updating consultation ${id}:`, error)
      set.status = 500
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update consultation'
      }
    }
  })
