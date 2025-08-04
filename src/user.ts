import type { UserRole } from "./enums/userRole";

export interface User {
  id: number;
  username: string;
  email: string;
  isVerified: boolean;
  role: UserRole;
}
