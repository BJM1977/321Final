export type RoleType = 'User' | 'Moderator' | 'Admin'

export interface RoleUpdateBody {
  role: RoleType
}