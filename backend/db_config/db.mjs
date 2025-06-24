import mongoose from 'mongoose';

// --- Connection Event Handlers ---
// These are attached once to the main mongoose.connection object.

// On successful connection
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully.');
});

// On connection error
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// On disconnection
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB has disconnected.');
});

// --- Main Connection Function ---
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    console.log('🚀 Attempting to connect to MongoDB...');

    // Mongoose v6+ handles deprecated options internally.
    // Setting a higher timeout can help with slow connections.
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, 
    });

  } catch (error) {
    console.error('❌ Failed to establish initial connection to MongoDB:', error.message);
    // If the initial connection fails, it's a fatal error, so exit.
    process.exit(1);
  }
};

export default connectDB;
