import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import verifyAuth from './utils/verifyOktaToken';
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// handle cors
const corsHandler = (req: any, res: any, next: any) => {
  const { origin } = req.headers;
  console.log('origin: ', origin)
  if (origin !== process.env.DASHBOARD_URL) {
    res.status(400).json('origin not allowed'); 
  }
  next();
}

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
const userSchema = new mongoose.Schema({ createdAt: Date }, { timestamps: { createdAt: true, updatedAt: false } });
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
}, { timestamps: { createdAt: true, updatedAt: false } });
const PageHit = mongoose.model('PageHit', pageHitSchema, 'pageHits');

/*** Users Endpoints ***/

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
const errorSchema = new mongoose.Schema({}, { timestamps: true });
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

/*** Dashboard ***/

app.get(
  '/usersCount',
  (req, res, next) => { verifyAuth(req, res, next) },
  cors({origin: process.env.DASHBOARD_URL}),
  (req, res) => {
    User.countDocuments((err, users) => {
      if (err) {
        console.log('error getting users: ', err);
        res.status(500).json(err);
      }
      res.status(200).json(users);
    })
  }
);

app.get(
  '/pageHitsCount',
  (req, res, next) => { verifyAuth(req, res, next) },
  cors({origin: process.env.DASHBOARD_URL}),
  (req, res) => {
    PageHit.countDocuments((err, pageHits) => {
      if (err) {
        console.log('error getting page hits: ', err);
        res.status(500).json(err);
      }
      res.status(200).json(pageHits);
    })
  }
);

app.get(
  '/pageHitsByDay',
  (req, res, next) => { verifyAuth(req, res, next) },
  cors({origin: process.env.DASHBOARD_URL}),
  (req, res) => {
    PageHit.aggregate([
      {
        '$group': {
          '_id': {
            '$dateToString': {
              'format': '%Y-%m-%d', 
              'date': '$createdAt'
            }
          }, 
          'count': {
            '$sum': 1
          }
        }
      }, {
        '$sort': {
          '_id': 1
        }
      }
    ]).then(data => {
      res.status(200).json(data)
    })
    .catch(err => {
      console.log('Error getting aggregated page hits: ', err)
      res.status(500).json(err);
    })
  }
)

app.get(
  '/pageHitsByUser',
  (req, res, next) => { verifyAuth(req, res, next) },
  cors({origin: process.env.DASHBOARD_URL}),
  (req, res) => {
    // needs sorting by first pageHit.createdAt
    PageHit.aggregate([
      {
        '$group': {
          '_id': {
            'user': '$userId'
          }, 
          'pageHitsCount': {
            '$sum': 1
          }, 
          'pageHits': {
            '$push': '$$ROOT'
          }
        }
      }
    ]).then(data => {
      res.status(200).json(data)
    })
    .catch(err => {
      console.log('Error getting pageHits by user: ', err)
      res.status(500).json(err);
    })
  }
)

app.get(
  '/uniqueUsersByDay',
  (req, res, next) => { verifyAuth(req, res, next) },
  cors({origin: process.env.DASHBOARD_URL}),
  (req, res) => {
    User.aggregate([
      {
        '$group': {
          '_id': {
            '$dateToString': {
              'format': '%Y-%m-%d', 
              'date': '$createdAt'
            }
          }, 
          'count': {
            '$sum': 1
          }
        }
      }, {
        '$sort': {
          '_id': 1
        }
      }
    ]).then(data => {
      res.status(200).json(data)
    })
    .catch(err => {
      console.log('Error getting aggregated users: ', err)
      res.status(500).json(err);
    })
  }
)

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at port: ${PORT}`);
});
