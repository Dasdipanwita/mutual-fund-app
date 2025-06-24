import mongoose from 'mongoose';

const testConnection = async () => {
  try {
    console.log('🚀 Testing MongoDB connection...');
    await mongoose.connect('mongodb://localhost:27017/test');
    console.log('✅ MongoDB connection successful');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      }
    });
  }
};

await testConnection();
