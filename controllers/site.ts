import { Request, Response } from 'express';
import { User, PageHit, NewError } from '../schemas';

/** Get the user from DB */
const uniqueUserCtrl = (req: Request, res: Response) => {
  User.findById(req.query.userId, (err: Error, user: { _id: string }) => {
    if (err) {
      console.log('error getting unique user: ', err);
      res.status(500).json(err);
    }
    console.log('unique user: ', user)
    res.status(200).json(user);
  })
}

/** Add new user to DB */
const newUniqueUserCtrl = (req: Request, res: Response) => {
  const newUser = new User({});
  newUser.save((err, user) => {
    if (err) {
      console.log('error creating unique user: ', err);
      res.status(500).json(err);
    }
    console.log('unique user created: ', user)
    res.status(200).json(user);
  })
}

/** Add new pageHit to DB */
const newPageHitCtrl = (req: Request, res: Response) => {
  const newPageHit = new PageHit({ ...req.body });
  newPageHit.save((err, pageHit) => {
    if (err) {
      console.log('error creating new page hit: ', err);
      res.status(500).json(err);
    }
    console.log('page hit created: ', pageHit)
    res.status(200).json(pageHit);
  })
}

/** Add an Error to DB */
const newErrorCtrl = (req: Request, res: Response) => {
  const newErr = new NewError({ ...req.body });
  newErr.save((err, newErr) => {
    if (err) {
      console.log('error logging client newErr: ', err);
      res.status(500).json(err);
    }
    console.log('client newErr created: ', newErr);
    res.status(200).json();
  })
}

export {
  uniqueUserCtrl,
  newUniqueUserCtrl,
  newPageHitCtrl,
  newErrorCtrl
}