import { Request } from 'express';
import { IGetUser } from './get-user';

export interface RequestCustom extends Request {
  user: IGetUser;
}