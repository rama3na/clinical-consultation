import { Elysia } from 'elysia'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'

// Ensure local environment variables are loaded from backend/.env
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile()
  } catch {
    // env file already loaded or not present
  }
}

interface StructureNoteBody {
  rawNotes?: string
}

export interface StructuredClinicalNote {
  chiefComplaint: string
  symptoms: string[]
  relevantHistory: string
  medicationsMentioned: string[]
  doctorPlan: string
  missingInformation: string[]
}

const SYSTEM_PROMPT = `You are a clinical documentation assistant helping doctors convert unstructured rough notes into a structured medical draft note.

CRITICAL CLINICAL & SAFETY RULES:
1. Do NOT diagnose the patient.
2. Do NOT recommend treatments, medications, or clinical interventions.
3. Do NOT add medical facts, vitals, symptoms, history, or numbers that are not explicitly written in the doctor's input notes.
4. Do NOT infer or extrapolate missing medical details.
5. ONLY organize, structure, and summarize the information explicitly provided in the doctor's rough notes.
6. If any category was not mentioned by the doctor, leave the string empty ("") or the array empty ([]).
7. If critical expected clinical context appears absent from the notes (e.g., duration, dosage, allergy status), list it succinctly under "missingInformation".
8. The output is strictly a DRAFT for the attending doctor to review, edit, and confirm before saving.

Output strictly valid JSON with this exact schema:
{
  "chiefComplaint": "string",
  "symptoms": ["string"],
  "relevantHistory": "string",
  "medicationsMentioned": ["string"],
  "doctorPlan": "string",
  "missingInformation": ["string"]
}`

export const aiRoutes = new Elysia({ prefix: '/ai' })
  .post('/structure-note', async ({ body, set }) => {
    try {
      const payload = body as StructureNoteBody

      if (!payload || typeof payload !== 'object') {
        set.status = 400
        return {
          success: false,
          message: 'Request body is required'
        }
      }

      const { rawNotes } = payload

      if (!rawNotes || typeof rawNotes !== 'string' || !rawNotes.trim()) {
        set.status = 400
        return {
          success: false,
          message: 'rawNotes is required and cannot be empty'
        }
      }

      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
        set.status = 500
        return {
          success: false,
          message: 'Gemini API key is not configured on the server. Please set GEMINI_API_KEY in backend/.env'
        }
      }

      const genAI = new GoogleGenerativeAI(apiKey.trim())

      const model = genAI.getGenerativeModel({
        model: 'gemini-3.6-flash',
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              chiefComplaint: { type: SchemaType.STRING },
              symptoms: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING }
              },
              relevantHistory: { type: SchemaType.STRING },
              medicationsMentioned: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING }
              },
              doctorPlan: { type: SchemaType.STRING },
              missingInformation: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING }
              }
            },
            required: [
              'chiefComplaint',
              'symptoms',
              'relevantHistory',
              'medicationsMentioned',
              'doctorPlan',
              'missingInformation'
            ]
          }
        }
      })

      const result = await model.generateContent(
        `Here are the doctor's rough clinical notes to structure:\n\n${rawNotes.trim()}`
      )

      let content = result.response.text()?.trim()
      if (!content) {
        set.status = 502
        return {
          success: false,
          message: 'Received empty response from AI model'
        }
      }

      // Strip markdown code fences if model enclosed JSON in them
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim()
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '').trim()
      }

      let parsed: unknown
      try {
        parsed = JSON.parse(content)
      } catch {
        set.status = 502
        return {
          success: false,
          message: 'Failed to parse AI response as JSON'
        }
      }

      // Validate and normalize the structured output
      const rawObj = (parsed && typeof parsed === 'object') ? (parsed as Record<string, unknown>) : {}

      const normalizeString = (val: unknown): string => (typeof val === 'string' ? val.trim() : '')
      const normalizeStringArray = (val: unknown): string[] => {
        if (Array.isArray(val)) {
          return val.map((item) => String(item).trim()).filter(Boolean)
        }
        if (typeof val === 'string' && val.trim()) {
          return [val.trim()]
        }
        return []
      }

      const structuredNote: StructuredClinicalNote = {
        chiefComplaint: normalizeString(rawObj.chiefComplaint),
        symptoms: normalizeStringArray(rawObj.symptoms),
        relevantHistory: normalizeString(rawObj.relevantHistory),
        medicationsMentioned: normalizeStringArray(rawObj.medicationsMentioned),
        doctorPlan: normalizeString(rawObj.doctorPlan),
        missingInformation: normalizeStringArray(rawObj.missingInformation)
      }

      return {
        success: true,
        data: structuredNote
      }
    } catch (error) {
      console.error('Error in AI note structuring:', error instanceof Error ? error.message : 'Unknown error')
      set.status = 500
      return {
        success: false,
        message: error instanceof Error ? error.message : 'AI note structuring failed'
      }
    }
  })
