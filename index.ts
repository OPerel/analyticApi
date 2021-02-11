import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

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
const userSchema = new mongoose.Schema({}, { timestamps: { createdAt: true, updatedAt: false } });
const User = mongoose.model('User', userSchema, 'uniqueUsers');

// Define pageHit schema and model
const pageHitSchema = new mongoose.Schema({
  userId: String,
  referrer: String,
  platform: String,
  country: String,
  city: String,
  IP: String
}, { timestamps: { createdAt: true, updatedAt: false } });
const PageHit = mongoose.model('PageHit', pageHitSchema, 'pageHits');

/*** Users Endpoints ***/

// app.get('/users', (req, res) => {
//   User.find((err, users) => {
//     if (err) {
//       console.log('error getting users: ', err);
//       res.status(500).json(err);
//     }
//     console.log('users: ', users)
//     res.status(200).json(users);
//   })
// });

app.get('/uniqueUser', (req, res) => {
  User.findById(req.query.userId, (err: Error, user: { _id: string }) => {
    if (err) {
      console.log('error getting unique user: ', err);
      res.status(500).json(err);
    }
    console.log('unique user: ', user)
    res.status(200).json(user);
  })
});

app.post('/newUniqueUser', (req, res) => {
  const newUser = new User({});
  newUser.save((err, user) => {
    if (err) {
      console.log('error creating unique user: ', err);
      res.status(500).json(err);
    }
    console.log('unique user created: ', user)
    res.status(200).json(user);
  })
});

/*** Page Hits Endpoints ***/

app.post('/newPageHit', (req, res) => {
  if (req.body.IP !== process.env.MY_IP) {
    const newPageHit = new PageHit({ ...req.body });
    newPageHit.save((err, pageHit) => {
      if (err) {
        console.log('error creating new page hit: ', err);
        res.status(500).json(err);
      }
      console.log('page hit created: ', pageHit)
      res.status(200).json(pageHit);
    })
  } else {
    console.log('hello ori')
    res.status(200).json('hello ori');
  }
});

/*** Errors ***/
const errorSchema = new mongoose.Schema({ newErr: Error }, { timestamps: true });
const NewError = mongoose.model('NewError', errorSchema, 'errorsLog');

app.post('/logErrors', (req, res) => {
  const newErr = new NewError({ ...req.body });
  newErr.save((err, newErr) => {
    if (err) {
      console.log('error logging client newErr: ', err);
      res.status(500).json(err);
    }
    console.log('client newErr created: ', newErr);
    res.status(200).json();
  })
})


const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at port: ${PORT}`);
});
