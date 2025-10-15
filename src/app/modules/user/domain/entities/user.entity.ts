export interface User {
  id: number; // Changé de string à number pour correspondre au backend
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
