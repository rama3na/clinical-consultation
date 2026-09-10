# AI Usage

## Tools Used

- Antigravity IDE: Used for coding, debugging, and project implementation. 
- Google Gemini API: Used to convert rough doctor notes into structured clinical notes.

## How AI Was Used

Gemini is used only for structuring doctor-provided consultation notes.

The doctor enters rough notes, and Gemini returns:
- Chief complaint
- Symptoms
- Relevant history
- Medications mentioned
- Doctor plan
- Missing information

The AI output is shown as a draft. The doctor can review and edit it before saving.

## Important AI Rules

- Do not invent patient information.
- Do not generate a diagnosis.
- Do not recommend treatment.
- Only structure information provided in the doctor's notes.
- AI output must be reviewed by the doctor before saving.

## Useful Prompts

1. "Create the backend API for structuring rough clinical notes using Gemini."
2. "Make the AI return a consistent structured JSON response."
3. "Debug the Mongoose error caused by a mismatch between string and string array fields."
4. "Keep the Gemini API key on the backend and never expose it to the frontend."
5. "Write clean, optimal, and maintainable code following development best practices."

## AI Issue and Fix

During development, I initially had a mismatch between the structure returned by the AI and the MongoDB consultation schema.

For example, the AI returned fields such as symptoms, medicationsMentioned, and missingInformation as arrays, while the MongoDB schema was initially expecting strings. Because of this mismatch, saving the consultation resulted in a Mongoose validation/casting error and the API returned a 500 error.

I debugged the issue by checking the backend error, looking at the actual AI response, and comparing it with the MongoDB schema and the data being sent from the frontend.

I then updated the consultation schema and added backend normalization/validation so these fields are handled consistently before they are saved to MongoDB.

## Engineering Decision

- The Gemini API call is made from the backend instead of the frontend.

- I decided to keep the UI simple instead of using a fashionable or overly designed interface. I used a clean black-and-white style so doctors can quickly find and understand the required information.

I also kept the main workflow simple with the dashboard, patient profile, consultation history, and consultation modal instead of adding unnecessary screens or navigation.
