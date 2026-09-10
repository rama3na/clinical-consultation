'use client'

import { useState } from 'react'
import { createConsultation, structureNoteWithAi } from '../lib/api'
import { StructuredClinicalNote } from '../types'

interface ConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName: string
  onConsultationSaved: () => void
}

interface EditableFinalNote {
  chiefComplaint: string
  symptoms: string
  relevantHistory: string
  medicationsMentioned: string
  doctorPlan: string
  missingInformation: string
}

export function ConsultationModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  onConsultationSaved
}: ConsultationModalProps) {
  const [rawNotes, setRawNotes] = useState('')
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  // AI draft (persisted pristine) & final reviewed note (editable by doctor)
  const [aiDraft, setAiDraft] = useState<StructuredClinicalNote | null>(null)
  const [finalNote, setFinalNote] = useState<EditableFinalNote | null>(null)

  if (!isOpen) return null

  const handleGenerateAiDraft = async () => {
    if (!rawNotes.trim()) {
      setError('Please enter rough clinical notes before generating an AI draft.')
      return
    }

    try {
      setIsGeneratingAi(true)
      setAiError(null)
      setError(null)

      const structured = await structureNoteWithAi(rawNotes.trim())
      setAiDraft(structured)
      setFinalNote({
        chiefComplaint: structured.chiefComplaint || '',
        symptoms: (structured.symptoms || []).join(', '),
        relevantHistory: structured.relevantHistory || '',
        medicationsMentioned: (structured.medicationsMentioned || []).join(', '),
        doctorPlan: structured.doctorPlan || '',
        missingInformation: (structured.missingInformation || []).join(', ')
      })
    } catch {
      setAiError(
        'AI service is temporarily unavailable. You can continue by entering or editing the clinical note manually.'
      )
      // Provide editable fields so the doctor can document manually
      if (!finalNote) {
        setFinalNote({
          chiefComplaint: '',
          symptoms: '',
          relevantHistory: '',
          medicationsMentioned: '',
          doctorPlan: '',
          missingInformation: ''
        })
      }
    } finally {
      setIsGeneratingAi(false)
    }
  }

  const handleSave = async () => {
    if (!rawNotes.trim()) {
      setError('Please enter clinical notes before saving.')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      // Safely construct finalNote payload if doctor entered any structured content
      let finalNotePayload: Record<string, unknown> | undefined = undefined

      if (finalNote) {
        const chiefComplaint = finalNote.chiefComplaint.trim()
        const symptoms = finalNote.symptoms
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        const relevantHistory = finalNote.relevantHistory.trim()
        const medicationsMentioned = finalNote.medicationsMentioned
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        const doctorPlan = finalNote.doctorPlan.trim()
        const missingInformation = finalNote.missingInformation
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)

        const hasAnyContent =
          Boolean(chiefComplaint) ||
          symptoms.length > 0 ||
          Boolean(relevantHistory) ||
          medicationsMentioned.length > 0 ||
          Boolean(doctorPlan) ||
          missingInformation.length > 0

        if (hasAnyContent) {
          finalNotePayload = {
            chiefComplaint,
            symptoms,
            relevantHistory,
            medicationsMentioned,
            doctorPlan,
            missingInformation
          }
        }
      }

      await createConsultation({
        patientId,
        rawNotes: rawNotes.trim(),
        aiDraft: aiDraft || undefined,
        finalNote: finalNotePayload
      })

      // Reset state on successful save
      setRawNotes('')
      setAiDraft(null)
      setFinalNote(null)
      onConsultationSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save consultation')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (isSaving || isGeneratingAi) return
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-slate-900">
              New Clinical Consultation
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Patient: <span className="text-blue-700 font-semibold">{patientName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving || isGeneratingAi}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-200/60 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-160px)] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Doctor's Rough Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="rawNotes" className="block text-sm font-bold text-slate-900">
                Doctor&apos;s Rough Notes <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">Unstructured clinical entries</span>
            </div>
            <textarea
              id="rawNotes"
              rows={5}
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              disabled={isSaving || isGeneratingAi}
              placeholder="Enter rough clinical observations, symptoms, vitals, examination notes, medication notes, or treatment thoughts... (e.g., Pt presents with 3-day history of dry cough and mild wheezing. No fever. Denies chest pain. History of asthma. Taking albuterol PRN. Plan: continue inhaler, rest, follow up if worsens.)"
              className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
            />
          </div>

          {/* Action: Generate Structured Note */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">
                AI Clinical Documentation Assistant
              </span>
              <span className="text-xs text-slate-500">
                Structures only information provided above &middot; Never hallucinates or diagnoses
              </span>
            </div>
            <button
              type="button"
              onClick={handleGenerateAiDraft}
              disabled={isGeneratingAi || isSaving || !rawNotes.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isGeneratingAi ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Structuring Notes with AI...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Structured Note
                </>
              )}
            </button>
          </div>

          {/* AI Error Notification */}
          {aiError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
              <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="font-medium">{aiError}</p>
              </div>
            </div>
          )}

          {/* Section 2: AI Generated Draft & Doctor Review / Editing */}
          {finalNote ? (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              {/* Draft Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                  <span className="text-xs font-bold text-indigo-900">
                    {aiDraft ? 'AI Generated Draft — Review Before Saving' : 'Structured Clinical Note — Review Before Saving'}
                  </span>
                </div>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-white text-indigo-700 border border-indigo-200">
                  Doctor Review Required
                </span>
              </div>

              {/* Editable Fields Grid */}
              <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                {/* Chief Complaint */}
                <div>
                  <label htmlFor="chiefComplaint" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Chief Complaint
                  </label>
                  <input
                    id="chiefComplaint"
                    type="text"
                    value={finalNote.chiefComplaint}
                    onChange={(e) =>
                      setFinalNote({ ...finalNote, chiefComplaint: e.target.value })
                    }
                    disabled={isSaving}
                    placeholder="e.g., Persistent dry cough for 3 days"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Symptoms */}
                <div>
                  <label htmlFor="symptoms" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Symptoms <span className="text-slate-400 font-normal normal-case">(comma separated)</span>
                  </label>
                  <input
                    id="symptoms"
                    type="text"
                    value={finalNote.symptoms}
                    onChange={(e) =>
                      setFinalNote({ ...finalNote, symptoms: e.target.value })
                    }
                    disabled={isSaving}
                    placeholder="e.g., Dry cough, Wheezing on exertion"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Relevant History */}
                <div>
                  <label htmlFor="relevantHistory" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Relevant Medical History
                  </label>
                  <input
                    id="relevantHistory"
                    type="text"
                    value={finalNote.relevantHistory}
                    onChange={(e) =>
                      setFinalNote({ ...finalNote, relevantHistory: e.target.value })
                    }
                    disabled={isSaving}
                    placeholder="e.g., Known bronchial asthma"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Medications Mentioned */}
                <div>
                  <label htmlFor="medicationsMentioned" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Medications Mentioned <span className="text-slate-400 font-normal normal-case">(comma separated)</span>
                  </label>
                  <input
                    id="medicationsMentioned"
                    type="text"
                    value={finalNote.medicationsMentioned}
                    onChange={(e) =>
                      setFinalNote({ ...finalNote, medicationsMentioned: e.target.value })
                    }
                    disabled={isSaving}
                    placeholder="e.g., Albuterol HFA inhaler PRN"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Doctor's Plan */}
                <div>
                  <label htmlFor="doctorPlan" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Doctor&apos;s Treatment Plan &amp; Advice
                  </label>
                  <textarea
                    id="doctorPlan"
                    rows={3}
                    value={finalNote.doctorPlan}
                    onChange={(e) =>
                      setFinalNote({ ...finalNote, doctorPlan: e.target.value })
                    }
                    disabled={isSaving}
                    placeholder="e.g., Continue Albuterol inhaler. Adequate hydration. Clinic follow-up in 1 week if symptoms do not improve."
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Missing Information */}
                <div>
                  <label htmlFor="missingInformation" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Missing Information / Clinical Gaps <span className="text-slate-400 font-normal normal-case">(comma separated)</span>
                  </label>
                  <input
                    id="missingInformation"
                    type="text"
                    value={finalNote.missingInformation}
                    onChange={(e) =>
                      setFinalNote({ ...finalNote, missingInformation: e.target.value })
                    }
                    disabled={isSaving}
                    placeholder="e.g., Peak flow readings, allergy trigger details"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Placeholder before AI generation */
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-200/80 text-slate-500 mx-auto flex items-center justify-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                AI Structured Note Draft Area
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Click &ldquo;Generate Structured Note&rdquo; above to automatically organize your rough notes into Chief Complaint, Symptoms, History, Medications, and Plan for your review.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving || isGeneratingAi}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isGeneratingAi || !rawNotes.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving Consultation...
              </>
            ) : (
              'Save Consultation'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
