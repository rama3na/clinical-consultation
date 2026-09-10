import mongoose from 'mongoose'
import { connectDB } from './config/database.js'
import { Patient } from './models/Patient.js'
import { Appointment } from './models/Appointment.js'
import { Consultation } from './models/Consultation.js'

async function seed(): Promise<void> {
  try {
    console.log('Connecting to database for seeding...')
    await connectDB()

    console.log('Clearing existing data...')
    await Promise.all([
      Patient.deleteMany({}),
      Appointment.deleteMany({}),
      Consultation.deleteMany({})
    ])

    console.log('Inserting synthetic patients...')
    const patients = await Patient.create([
      {
        firstName: 'Rahul',
        lastName: 'Sharma',
        dateOfBirth: new Date('1988-04-12'),
        gender: 'Male',
        phone: '+91 98765 43210',
        allergies: ['Penicillin'],
        existingConditions: ['Mild Hypertension']
      },
      {
        firstName: 'Priya',
        lastName: 'Singh',
        dateOfBirth: new Date('1995-08-23'),
        gender: 'Female',
        phone: '+91 98765 12345',
        allergies: ['Sulfa drugs', 'Peanuts'],
        existingConditions: ['Asthma']
      },
      {
        firstName: 'Amit',
        lastName: 'Kumar',
        dateOfBirth: new Date('1974-11-05'),
        gender: 'Male',
        phone: '+91 98123 45678',
        allergies: [],
        existingConditions: ['Type 2 Diabetes', 'Hyperlipidemia']
      },
      {
        firstName: 'Sneha',
        lastName: 'Reddy',
        dateOfBirth: new Date('2001-02-18'),
        gender: 'Female',
        phone: '+91 97654 32109',
        allergies: ['Aspirin'],
        existingConditions: []
      },
      {
        firstName: 'Arjun',
        lastName: 'Mehta',
        dateOfBirth: new Date('1962-07-30'),
        gender: 'Male',
        phone: '+91 99887 76655',
        allergies: [],
        existingConditions: ['Osteoarthritis', 'GERD']
      }
    ])

    console.log(`Inserted ${patients.length} patients.`)

    // Today's normalized date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    console.log("Inserting today's appointments...")
    const appointments = await Appointment.create([
      {
        patientId: patients[0]._id,
        appointmentDate: today,
        appointmentTime: '09:30 AM',
        reason: 'Follow-up for blood pressure monitoring and occasional morning dizziness',
        status: 'COMPLETED'
      },
      {
        patientId: patients[1]._id,
        appointmentDate: today,
        appointmentTime: '10:15 AM',
        reason: 'Seasonal wheezing flare-up and dry cough over past 3 days',
        status: 'IN_PROGRESS'
      },
      {
        patientId: patients[2]._id,
        appointmentDate: today,
        appointmentTime: '11:00 AM',
        reason: 'Quarterly diabetes checkup and routine fasting lab review',
        status: 'WAITING'
      },
      {
        patientId: patients[3]._id,
        appointmentDate: today,
        appointmentTime: '02:00 PM',
        reason: 'Acute sore throat, mild fever, and fatigue for 2 days',
        status: 'WAITING'
      },
      {
        patientId: patients[4]._id,
        appointmentDate: today,
        appointmentTime: '03:30 PM',
        reason: 'Bilateral knee joint stiffness and acid reflux exacerbation',
        status: 'WAITING'
      }
    ])

    console.log(`Inserted ${appointments.length} appointments.`)

    console.log('Inserting previous consultations...')
    const consultations = await Consultation.create([
      {
        patientId: patients[0]._id,
        appointmentId: appointments[0]._id,
        rawNotes:
          'Patient presents for routine BP follow-up. Reports mild dizziness when standing up quickly in the morning. Denies chest pain or shortness of breath. Current BP 138/88. Still taking Amlodipine 5mg. Advised to stay well hydrated, maintain low sodium diet. Follow up in 2 months.',
        aiDraft: {
          chiefComplaint: 'Morning dizziness and blood pressure follow-up',
          symptoms: 'Orthostatic lightheadedness, mild morning dizziness',
          relevantHistory: 'Essential hypertension on Amlodipine 5mg',
          medicationsMentioned: 'Amlodipine 5mg daily',
          doctorPlan: 'Continue Amlodipine 5mg once daily; emphasize hydration and slow posture changes; low sodium diet; follow up in 2 months.',
          missingInformation: 'Recent home BP log, latest metabolic panel/electrolytes'
        },
        finalNote: {
          chiefComplaint: 'Blood pressure monitoring and mild postural dizziness',
          symptoms: 'Occasional transient morning dizziness on standing; denies syncope, chest pain, palpitations, or dyspnea.',
          relevantHistory: 'Essential hypertension (mild), well-controlled overall.',
          medicationsMentioned: 'Amlodipine 5mg orally once daily in morning.',
          doctorPlan: '1. Maintain Amlodipine 5mg PO OD. 2. Postural hygiene education. 3. Monitor home BP 3x weekly. 4. Clinic review in 8 weeks.',
          missingInformation: 'Home BP records not brought to clinic.'
        }
      },
      {
        patientId: patients[1]._id,
        rawNotes:
          'Priya attended clinic complaining of sudden shortness of breath after jogging in pollen season. Audible expiratory wheeze noted. Albuterol inhaler prescribed. Encouraged to track peak flow and avoid known allergen triggers.',
        aiDraft: {
          chiefComplaint: 'Exercise-induced asthma exacerbation during pollen season',
          symptoms: 'Dyspnea, audible wheezing post-exercise',
          relevantHistory: 'Known bronchial asthma, peanut and sulfa allergies',
          medicationsMentioned: 'Albuterol inhaler',
          doctorPlan: 'Prescribe Albuterol inhaler 2 puffs PRN before exercise. Peak flow meter log.',
          missingInformation: 'Inhaler technique verification, baseline spirometry'
        },
        finalNote: {
          chiefComplaint: 'Asthma exacerbation provoked by outdoor exercise in high pollen',
          symptoms: 'Exertional dyspnea, expiratory wheezing',
          relevantHistory: 'Moderate persistent asthma, seasonal allergic rhinitis',
          medicationsMentioned: 'Albuterol HFA 90 mcg 2 puffs Q4-6H PRN',
          doctorPlan: 'Albuterol inhaler PRN. Avoid high pollen hours. Return if symptoms worsen.',
          missingInformation: 'None.'
        }
      },
      {
        patientId: patients[2]._id,
        rawNotes:
          'Amit in for diabetic review. HbA1c last week was 7.4%. Complains of mild tingling in right foot toes. Feet examined, monofilament test intact. Metformin 1000mg BID continued. Added diabetic foot care instructions.',
        aiDraft: {
          chiefComplaint: 'Routine type 2 diabetes management and mild toe tingling',
          symptoms: 'Distal sensory paresthesia in right foot',
          relevantHistory: 'Type 2 diabetes mellitus, dyslipidemia',
          medicationsMentioned: 'Metformin 1000mg twice daily',
          doctorPlan: 'Continue Metformin 1000mg BID. Foot exam performed. Comprehensive diabetic care counseling.',
          missingInformation: 'Urine microalbumin/creatinine ratio, dilated retinal exam date'
        },
        finalNote: {
          chiefComplaint: 'Diabetes follow-up (HbA1c 7.4%) and early peripheral neuropathy screening',
          symptoms: 'Intermittent tingling in right toes; sensation intact to 10g monofilament.',
          relevantHistory: 'Type 2 diabetes diagnosed 6 years ago, hyperlipidemia on Atorvastatin.',
          medicationsMentioned: 'Metformin 1000mg PO BID, Atorvastatin 20mg PO QHS.',
          doctorPlan: 'Continue current regimen. Daily self foot checks. Annual ophthalmology referral.',
          missingInformation: 'Awaiting updated lipid panel and urine microalbumin.'
        }
      }
    ])

    console.log(`Inserted ${consultations.length} previous consultations.`)
    console.log('Seeding completed successfully!')
  } catch (error) {
    console.error('Error during database seeding:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('Database connection closed.')
  }
}

seed()
