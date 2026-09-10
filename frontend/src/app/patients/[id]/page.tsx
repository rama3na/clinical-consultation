'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Patient, Consultation } from '../../../types'
import { getPatient, getPatientConsultations } from '../../../lib/api'
import { ConsultationModal } from '../../../components/ConsultationModal'

export default function PatientProfilePage() {
  const params = useParams()
  const patientId = params?.id as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  const loadPatientData = useCallback(async () => {
    if (!patientId) return
    try {
      setIsLoading(true)
      setError(null)
      const [patientData, consultationsData] = await Promise.all([
        getPatient(patientId),
        getPatientConsultations(patientId)
      ])
      setPatient(patientData)
      setConsultations(consultationsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patient profile')
    } finally {
      setIsLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    loadPatientData()
  }, [loadPatientData])

  const handleConsultationSaved = () => {
    loadPatientData()
    setSuccessToast('Consultation saved successfully!')
    setTimeout(() => {
      setSuccessToast(null)
    }, 4000)
  }

  const calculateAge = (dobString: string): number => {
    const dob = new Date(dobString)
    const diffMs = Date.now() - dob.getTime()
    const ageDate = new Date(diffMs)
    return Math.abs(ageDate.getUTCFullYear() - 1970)
  }

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-36 bg-slate-200 rounded-md animate-pulse"></div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 animate-pulse">
          <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="h-12 bg-slate-100 rounded-xl"></div>
            <div className="h-12 bg-slate-100 rounded-xl"></div>
            <div className="h-12 bg-slate-100 rounded-xl"></div>
            <div className="h-12 bg-slate-100 rounded-xl"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-28 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-center">
          <h2 className="text-base font-bold">Error Loading Patient</h2>
          <p className="text-xs text-red-600 mt-1">{error || 'Patient not found'}</p>
          <button
            onClick={loadPatientData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const patientFullName = `${patient.firstName} ${patient.lastName}`

  return (
    <div className="space-y-6">
      {/* Navigation & Success Toast */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {successToast && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {successToast}
          </div>
        )}
      </div>

      {/* Patient Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center shrink-0">
              {patient.firstName[0]}
              {patient.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {patientFullName}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {patient.gender} &middot; {calculateAge(patient.dateOfBirth)} years old &middot; Born {formatDate(patient.dateOfBirth)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Start Consultation
          </button>
        </div>

        {/* Demographics & Medical Background Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          {/* Contact Details */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Contact Phone
            </span>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {patient.phone}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Allergies
            </span>
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {patient.allergies.map((allergy, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                  >
                    <svg className="w-3 h-3 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">No known allergies</span>
            )}
          </div>

          {/* Existing Conditions */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Existing Conditions
            </span>
            {patient.existingConditions && patient.existingConditions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {patient.existingConditions.map((condition, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">No chronic conditions recorded</span>
            )}
          </div>
        </div>
      </div>

      {/* Previous Consultations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Consultation History
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {consultations.length}
            </span>
          </h2>
        </div>

        {consultations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No previous consultations</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click &quot;Start Consultation&quot; above to record the first consultation note for this patient.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((consultation) => {
              const note = consultation.finalNote || consultation.aiDraft
              return (
                <div
                  key={consultation._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
                >
                  {/* Consultation Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span className="text-sm font-bold text-slate-900">
                        Consultation &middot; {formatDateTime(consultation.createdAt)}
                      </span>
                    </div>
                    {consultation.finalNote && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Structured Note Available
                      </span>
                    )}
                  </div>

                  {/* Structured Details when available */}
                  {note && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                      {note.chiefComplaint && (
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                            Chief Complaint
                          </span>
                          <p className="text-xs font-medium text-slate-800 mt-0.5">
                            {note.chiefComplaint}
                          </p>
                        </div>
                      )}

                      {note.symptoms && (
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                            Symptoms
                          </span>
                          <p className="text-xs font-medium text-slate-800 mt-0.5">
                            {note.symptoms}
                          </p>
                        </div>
                      )}

                      {note.doctorPlan && (
                        <div className="md:col-span-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                            Doctor Plan
                          </span>
                          <p className="text-xs font-medium text-slate-800 mt-0.5 whitespace-pre-line">
                            {note.doctorPlan}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Doctor's Raw Notes */}
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Doctor&apos;s Clinical Notes
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-100 whitespace-pre-line">
                      {consultation.rawNotes}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Consultation Modal */}
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patientId={patient._id}
        patientName={patientFullName}
        onConsultationSaved={handleConsultationSaved}
      />
    </div>
  )
}

