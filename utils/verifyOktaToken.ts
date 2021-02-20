import { Request, Response, NextFunction } from 'express';
const OktaJwtVerifier = require('@okta/jwt-verifier');
require('dotenv').config();

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: `${process.env.OKTA_DOMAIN}/oauth2/default`,
  clientId: process.env.OKTA_CLIENT_ID
});

const verifyAuth = (req: Request, res: Response, next: NextFunction) => {
  const tokenBearer = req.headers['authorization'];
  if (tokenBearer) {
    const token = tokenBearer.split(' ')[1]
    oktaJwtVerifier.verifyAccessToken(token, 'api://default').then((jwt: any) => {
      next();
    })
    .catch((err: Error) => {
      console.log('Error verifying JWT: ', err);
      res.status(500).json('Error verifying JWT');
    })
  } else {
    console.log('No auth bearer');
    res.status(400).json('request is not authenticated');
  }
}

export default verifyAuth;