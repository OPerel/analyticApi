import mongoose from 'mongoose';

// Connect to db
const mongoDB = `${process.env.MONGODB}`;
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

// Get the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('mongoDB connected with mongoose')
});

// Define uniqueUser schema and model
const userSchema = new mongoose.Schema({
  createdAt: Date
}, { 
  timestamps: { createdAt: true, updatedAt: false }
});
const User = mongoose.model('User', userSchema, 'uniqueUsers');

// Define pageHit schema and model
const pageHitSchema = new mongoose.Schema({
  userId: String,
  referrer: String,
  platform: String,
  country: String,
  flagSVG: String,
  city: String,
  IP: String
}, {
  timestamps: { createdAt: true, updatedAt: false }
});
const PageHit = mongoose.model('PageHit', pageHitSchema, 'pageHits');

// Define Errors schema and model
const errorSchema = new mongoose.Schema({
  error: String
}, { 
  timestamps: { createdAt: true, updatedAt: false }
});
const NewError = mongoose.model('NewError', errorSchema, 'errorsLog');

export {
  User,
  PageHit,
  NewError
}