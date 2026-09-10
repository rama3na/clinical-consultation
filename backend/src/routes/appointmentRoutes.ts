import { Elysia } from 'elysia'
import mongoose from 'mongoose'
import { Appointment, AppointmentStatus } from '../models/Appointment.js'
import { IPatient } from '../models/Patient.js'

// Helper to convert 12-hour "hh:mm AM/PM" to minutes for sorting
const parseTimeToMinutes = (timeStr: string): number => {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return 0
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const period = match[3].toUpperCase()
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

export const appointmentRoutes = new Elysia({ prefix: '/appointments' })
  .get('/today', async ({ set }) => {
    try {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59, 999)

      const appointments = await Appointment.find({
        appointmentDate: { $gte: startOfDay, $lte: endOfDay }
      })
        .populate<{ patientId: IPatient }>('patientId', 'firstName lastName')
        .lean()

      const formatted = appointments.map((appt) => {
        const patient = appt.patientId as unknown as IPatient | null
        return {
          _id: appt._id,
          appointmentDate: appt.appointmentDate,
          appointmentTime: appt.appointmentTime,
          reason: appt.reason,
          status: appt.status,
          patientId: patient?._id || appt.patientId,
          patientName: patient
            ? `${patient.firstName} ${patient.lastName}`.trim()
            : 'Unknown Patient'
        }
      })

      formatted.sort(
        (a, b) => parseTimeToMinutes(a.appointmentTime) - parseTimeToMinutes(b.appointmentTime)
      )

      return {
        success: true,
        data: formatted
      }
    } catch (error) {
      console.error('Error fetching today appointments:', error)
      set.status = 500
      return {
        success: false,
        message: 'Failed to retrieve appointments'
      }
    }
  })
  .patch('/:id/status', async ({ params: { id }, body, set }) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        set.status = 400
        return {
          success: false,
          message: 'Invalid appointment ID format'
        }
      }

      const payload = body as { status?: string }
      const newStatus = payload?.status?.trim() as AppointmentStatus | undefined

      const validStatuses: AppointmentStatus[] = ['WAITING', 'IN_PROGRESS', 'COMPLETED']
      if (!newStatus || !validStatuses.includes(newStatus)) {
        set.status = 400
        return {
          success: false,
          message: `Invalid status. Allowed statuses: ${validStatuses.join(', ')}`
        }
      }

      const appointment = await Appointment.findById(id)
      if (!appointment) {
        set.status = 404
        return {
          success: false,
          message: 'Appointment not found'
        }
      }

      const currentStatus = appointment.status

      if (currentStatus === newStatus) {
        set.status = 400
        return {
          success: false,
          message: `Appointment is already in ${currentStatus} status`
        }
      }

      const isAllowedTransition =
        (currentStatus === 'WAITING' && newStatus === 'IN_PROGRESS') ||
        (currentStatus === 'IN_PROGRESS' && newStatus === 'COMPLETED')

      if (!isAllowedTransition) {
        set.status = 400
        return {
          success: false,
          message: `Invalid status transition from ${currentStatus} to ${newStatus}. Allowed transitions: WAITING -> IN_PROGRESS, IN_PROGRESS -> COMPLETED.`
        }
      }

      appointment.status = newStatus
      await appointment.save()

      return {
        success: true,
        data: appointment,
        message: 'Appointment status updated successfully'
      }
    } catch (error) {
      console.error(`Error updating status for appointment ${id}:`, error)
      set.status = 500
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update appointment status'
      }
    }
  })

