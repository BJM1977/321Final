import { Request } from 'express';

export interface AuthenticatedUser {
  id: number;
  username: string;
  role: 'User' | 'Moderator' | 'Admin';
  active: boolean;
}

export interface AuthenticatedRequest<
  Params = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<Params, ResBody, ReqBody, ReqQuery> {
  user: AuthenticatedUser;
}

export interface AuthRequestBody {
  username: string;
  password: string;
}

export type DeletePostRequest = AuthenticatedRequest<{ id: string }>;

export type CreateCommentRequest = AuthenticatedRequest<
  {},                          // keine URL-Parameter
  {},                          // keine spezielle Response
  { content: string; post_id: number } // Request-Body
>;

export interface AuthenticatedUser {
  id: number;
  username: string;
  role: 'User' | 'Moderator' | 'Admin';
  active: boolean; // Das muss rein!
}
