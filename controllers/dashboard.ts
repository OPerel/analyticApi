import { Request, Response } from 'express';
import { User, PageHit } from '../schemas';

const groupAndSortByDay = [
  {
    '$group': {
      '_id': {
        '$dayOfYear': {
          'date': '$createdAt'
        }
      }, 
      'date': {
        '$first': '$createdAt'
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
];

/** Get users count */
const userCountCtrl = (req: Request, res: Response) => {
  User.countDocuments((err, users) => {
    if (err) {
      console.log('error getting user\'s count: ', err);
      res.status(500).json(err);
    }
    res.status(200).json(users);
  })
}

/** Get pageHit count */
const pageHitCountCtrl = (req: Request, res: Response) => {
  PageHit.countDocuments((err, pageHits) => {
    if (err) {
      console.log('error getting page hits: ', err);
      res.status(500).json(err);
    }
    res.status(200).json(pageHits);
  })
}

/** Get all pageHits grouped and sorted by day */
const pageHitByDayCtrl = (req: Request, res: Response) => {
  PageHit.aggregate(groupAndSortByDay)
    .then(data => {
      res.status(200).json(data)
    })
    .catch(err => {
      console.log('Error getting aggregated page hits: ', err)
      res.status(500).json(err);
    })
}

/** Get all users grouped and sorted by day */
const uniqueUserByDayCtrl = (req: Request, res: Response) => {
  User.aggregate(groupAndSortByDay)
    .then(data => {
      res.status(200).json(data)
    })
    .catch(err => {
      console.log('Error getting aggregated users: ', err)
      res.status(500).json(err);
    })
}

/** Get all pageHits grouped by user and sorted by day */
const pageHitsByUserCtrl = (req: Request, res: Response) => {
  PageHit.aggregate([
    {
      '$group': {
        '_id': {
          'user': '$userId'
        }, 
        'firstHit': {
          '$first': '$createdAt'
        }, 
        'pageHitsCount': {
          '$sum': 1
        }, 
        'pageHits': {
          '$push': '$$ROOT'
        }
      }
    }, {
      '$sort': {
        'firstHit': -1
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

export {
  userCountCtrl,
  pageHitCountCtrl,
  pageHitByDayCtrl,
  uniqueUserByDayCtrl,
  pageHitsByUserCtrl
}