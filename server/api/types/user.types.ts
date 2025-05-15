export interface UserInput {
  username: string
  password: string
  role?: 'User' | 'Moderator' | 'Admin'
}
