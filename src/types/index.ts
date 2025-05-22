
export type UserRole = 'Employee' | 'Manager' | 'Admin';

export type AccessLevel = 'Read' | 'Write' | 'Admin';

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface User {
  id: number;
  username: string;
  role: UserRole;
}

export interface Software {
  id: number;
  name: string;
  description: string;
  accessLevels: AccessLevel[];
}

export interface AccessRequest {
  id: number;
  user: User;
  software: Software;
  accessType: AccessLevel;
  reason: string;
  status: RequestStatus;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}
