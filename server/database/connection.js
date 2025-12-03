import mongoose from 'mongoose';
import { MONGODB_URI } from '../config/env.js';

const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  };
};

export default connectDatabase;