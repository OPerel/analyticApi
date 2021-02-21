import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import verifyAuth from './utils/verifyOktaToken';

import {
  uniqueUserCtrl,
  newUniqueUserCtrl,
  newPageHitCtrl,
  newErrorCtrl
} from './controllers/site';

import {
  userCountCtrl,
  pageHitCountCtrl,
  pageHitByDayCtrl,
  uniqueUserByDayCtrl,
  pageHitsByUserCtrl
} from './controllers/dashboard';

require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

/*** Users Endpoints ***/

app.get('/uniqueUser', (req, res) => {
  uniqueUserCtrl(req, res);
});

app.post('/newUniqueUser', (req, res) => {
  newUniqueUserCtrl(req, res);
});

/*** Page Hits Endpoint ***/

app.post('/newPageHit', (req, res) => {
  newPageHitCtrl(req, res);
});

/*** Errors Endpoint ***/

app.post('/logErrors', (req, res) => {
  newErrorCtrl(req, res);
})

/*** Dashboard Endpoints ***/

app.get(
  '/usersCount',
  (req, res, next) => { verifyAuth(req, res, next) },
  cors({origin: process.env.DASHBOARD_URL}),
  (req, res) => {
    userCountCtrl(req, res);
  }
);

app.get(
  '/pageHitsCount',
  (req, res, next) => { verifyAuth(req, res, next) },
  cors({origin: process.env.DASHBOARD_URL}),
  (req, res) => {
    pageHitCountCtrl(req, res);
  }
);

app.get(
  '/pageHitsByDay',
  (req, res, next) => { verifyAuth(req, res, next) },
  cors({origin: process.env.DASHBOARD_URL}),
  (req, res) => {
    pageHitByDayCtrl(req, res);
  }
)

app.get(
  '/uniqueUsersByDay',
  (req, res, next) => { verifyAuth(req, res, next) },
  cors({origin: process.env.DASHBOARD_URL}),
  (req, res) => {
    uniqueUserByDayCtrl(req, res);
  }
)

app.get(
  '/pageHitsByUser',
  (req, res, next) => { verifyAuth(req, res, next) },
  cors({origin: process.env.DASHBOARD_URL}),
  (req, res) => {
    pageHitsByUserCtrl(req, res);
  }
)

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at port: ${PORT}`);
});
