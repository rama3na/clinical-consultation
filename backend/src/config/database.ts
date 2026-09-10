import mongoose from 'mongoose'

// Load .env natively in Node.js if available
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile()
  } catch {
    // env file already loaded or not present
  }
}

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    const errorMsg = 'MongoDB connection error: MONGODB_URI is not defined in environment variables'
    console.error(errorMsg)
    throw new Error(errorMsg)
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}
