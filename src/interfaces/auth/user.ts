import type { UserRole } from "../../enums/auth/userRole";

export interface User {
  id: number;
  username: string;
  email: string;
  isVerified: boolean;
  role: UserRole;
}
