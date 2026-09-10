import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { connectDB } from './config/database.js'
import { appointmentRoutes } from './routes/appointmentRoutes.js'
import { patientRoutes } from './routes/patientRoutes.js'
import { consultationRoutes } from './routes/consultationRoutes.js'
import { aiRoutes } from './routes/aiRoutes.js'

// Connect to MongoDB on startup
try {
  await connectDB()
} catch (error) {
  console.error('Initial MongoDB connection failed. Exiting process.')
  process.exit(1)
}

const port = Number(process.env.PORT) || 3001

const app = new Elysia({ adapter: node() })
  .onRequest(({ set }) => {
    set.headers['Access-Control-Allow-Origin'] = '*'
    set.headers['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, PUT, DELETE, OPTIONS'
    set.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
  })
  .options('/*', ({ set }) => {
    set.status = 204
    return ''
  })
  .get('/', () => ({ message: 'Mini AI-Powered Clinical Consultation System API' }))
  .use(appointmentRoutes)
  .use(patientRoutes)
  .use(consultationRoutes)
  .use(aiRoutes)
  .listen(port)

console.log(`Backend server is running on http://localhost:${port}`)

export type App = typeof app
