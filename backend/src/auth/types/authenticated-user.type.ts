import { AdminUser, User } from '@prisma/client';

export type AuthenticatedUser =
  | ({ kind: 'user' } & User)
  | ({ kind: 'admin' } & AdminUser);
