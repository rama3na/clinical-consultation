'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Appointment, AppointmentStatus } from '../../types'
import { getTodayAppointments, updateAppointmentStatus } from '../../lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'ALL' | AppointmentStatus>('ALL')

  const filteredAppointments = appointments.filter((appt) => {
    if (statusFilter === 'ALL') return true
    return appt.status === statusFilter
  })

  const loadAppointments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getTodayAppointments()
      setAppointments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load today appointments')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const handleStatusChange = async (appt: Appointment, newStatus: AppointmentStatus) => {
    if (newStatus === appt.status) return

    try {
      setUpdatingId(appt._id)
      setStatusError(null)
      const updated = await updateAppointmentStatus(appt._id, newStatus)
      setAppointments((prev) =>
        prev.map((a) => (a._id === appt._id ? { ...a, status: updated.status } : a))
      )
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to update appointment status')
    } finally {
      setUpdatingId(null)
    }
  }

  const renderStatusControl = (appt: Appointment) => {
    const isUpdating = updatingId === appt._id

    const stopEvents = (e: React.SyntheticEvent) => {
      e.stopPropagation()
    }

    switch (appt.status) {
      case 'COMPLETED':
        return (
          <span
            title="Appointment completed"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Completed
          </span>
        )
      case 'IN_PROGRESS':
        return (
          <div
            className="inline-flex items-center gap-1.5"
            onClick={stopEvents}
            onMouseDown={stopEvents}
            onPointerDown={stopEvents}
          >
            {isUpdating && (
              <svg className="animate-spin w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            <select
              value="IN_PROGRESS"
              onChange={(e) => {
                stopEvents(e)
                handleStatusChange(appt, e.target.value as AppointmentStatus)
              }}
              onClick={stopEvents}
              onMouseDown={stopEvents}
              onPointerDown={stopEvents}
              disabled={isUpdating}
              title="Change appointment status"
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-300 hover:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
            >
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        )
      case 'WAITING':
      default:
        return (
          <div
            className="inline-flex items-center gap-1.5"
            onClick={stopEvents}
            onMouseDown={stopEvents}
            onPointerDown={stopEvents}
          >
            {isUpdating && (
              <svg className="animate-spin w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            <select
              value="WAITING"
              onChange={(e) => {
                stopEvents(e)
                handleStatusChange(appt, e.target.value as AppointmentStatus)
              }}
              onClick={stopEvents}
              onMouseDown={stopEvents}
              onPointerDown={stopEvents}
              disabled={isUpdating}
              title="Change appointment status"
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 hover:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer disabled:opacity-50"
            >
              <option value="WAITING">Waiting</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>
          </div>
        )
    }
  }



  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length
  const inProgressCount = appointments.filter((a) => a.status === 'IN_PROGRESS').length
  const waitingCount = appointments.filter((a) => a.status === 'WAITING').length

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Today&apos;s Appointments
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Select a patient to view their profile, consultation history, or start a new clinical note.
          </p>
        </div>

        <button
          onClick={loadAppointments}
          disabled={isLoading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
        >
          <svg
            className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : 'text-slate-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Total Scheduled</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {isLoading ? '-' : appointments.length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-amber-600 block">Waiting</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {isLoading ? '-' : waitingCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-blue-600 block">In Progress</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {isLoading ? '-' : inProgressCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-emerald-600 block">Completed</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {isLoading ? '-' : completedCount}
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold">Unable to fetch appointments</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={loadAppointments}
            className="text-xs font-semibold px-3 py-1.5 bg-white border border-red-300 rounded-lg text-red-700 hover:bg-red-100 transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="h-4 w-36 bg-slate-200 rounded-md animate-pulse"></div>
            <div className="h-3 w-28 bg-slate-200 rounded-md animate-pulse"></div>
          </div>
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="sm:col-span-2">Time</div>
            <div className="sm:col-span-6">Patient &amp; Reason</div>
            <div className="sm:col-span-2 text-center">Status</div>
            <div className="sm:col-span-2 text-right">Action</div>
          </div>
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="px-6 py-4.5 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center animate-pulse">
                <div className="sm:col-span-2">
                  <div className="w-20 h-7 bg-slate-100 rounded-xl"></div>
                </div>
                <div className="sm:col-span-6 space-y-1.5">
                  <div className="w-36 h-4 bg-slate-100 rounded-md"></div>
                  <div className="w-64 h-3 bg-slate-100 rounded-md"></div>
                </div>
                <div className="sm:col-span-2 flex sm:justify-center">
                  <div className="w-20 h-6 bg-slate-100 rounded-full"></div>
                </div>
                <div className="sm:col-span-2 flex sm:justify-end">
                  <div className="w-24 h-4 bg-slate-100 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Error Alert */}
      {statusError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{statusError}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusError(null)}
            className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Appointments List */}
      {!isLoading && !error && appointments.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-800">No appointments for today</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            There are no appointments scheduled for today in the database.
          </p>
        </div>
      )}

      {!isLoading && !error && appointments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Patient Queue ({filteredAppointments.length})
            </span>
            <div className="flex items-center gap-2">
              <label htmlFor="status-filter" className="text-xs font-semibold text-slate-600">
                Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | AppointmentStatus)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs cursor-pointer"
              >
                <option value="ALL">All</option>
                <option value="WAITING">Waiting</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-800">No appointments found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No appointments match the selected status.
              </p>
            </div>
          ) : (
            <>
              {/* Table Column Headers */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-3 bg-slate-100/70 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="sm:col-span-2">Time</div>
                <div className="sm:col-span-6">Patient &amp; Reason</div>
                <div className="sm:col-span-2 text-center">Status</div>
                <div className="sm:col-span-2 text-right">Action</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-slate-100">
                {filteredAppointments.map((appt) => (
                  <div
                    key={appt._id}
                    onClick={() => router.push(`/patients/${appt.patientId}`)}
                    className="group px-6 py-4.5 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    {/* Time Column (col-span-2) */}
                    <div className="flex items-center justify-between sm:col-span-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-mono text-xs font-bold group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                        <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {appt.appointmentTime}
                      </div>

                      {/* Mobile-only status badge */}
                      <div className="sm:hidden">
                        {renderStatusControl(appt)}
                      </div>
                    </div>

                    {/* Patient & Reason Column (col-span-6) */}
                    <div className="sm:col-span-6 min-w-0 pr-2">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors block">
                        {appt.patientName}
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        Reason: <span className="text-slate-700 font-medium">{appt.reason}</span>
                      </p>
                    </div>

                    {/* Status Column (col-span-2 - desktop) */}
                    <div className="hidden sm:flex sm:col-span-2 sm:justify-center">
                      {renderStatusControl(appt)}
                    </div>

                    {/* Action Column (col-span-2) */}
                    <div className="flex justify-end sm:col-span-2 items-center">
                      <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all inline-flex items-center gap-1">
                        Open Profile
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

