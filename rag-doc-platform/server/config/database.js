import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURL = process.env.MONGO_URL || 'mongodb://mongo:27017/rag-doc-platform';
    await mongoose.connect(mongoURL);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
