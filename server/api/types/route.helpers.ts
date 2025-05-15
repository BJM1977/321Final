import { RequestHandler, Response } from 'express';
import { AuthenticatedRequest } from './auth.types';

export function authenticatedHandler<
  P = any,
  ResB = any,
  ReqB = any,
  ReqQ = any
>(
  handler: (
    req: AuthenticatedRequest<P, ResB, ReqB, ReqQ>,
    res: Response
  ) => any
): RequestHandler<P, ResB, ReqB, ReqQ> {
  return handler as unknown as RequestHandler<P, ResB, ReqB, ReqQ>;
}
