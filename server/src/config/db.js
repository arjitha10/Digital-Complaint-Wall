const mongoose = require('mongoose');

async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/complaint-wall';

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
      autoIndex: true,
    });
    console.log('Connected to MongoDB successfully:', mongoUri);
    const collections = (await mongoose.connection.db.listCollections().toArray()).map((c) => c.name);
    console.log('Existing collections:', collections);
  } catch (error) {
    console.error('MongoDB connection error:', { message: error.message, stack: error.stack });
    process.exit(1);
  }
}

module.exports = { connectToDatabase };



