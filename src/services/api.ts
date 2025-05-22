
import { AccessRequest, Software, User } from '@/types';
import { 
  loginWithSupabase, 
  signupWithSupabase,
  getSoftwareListFromSupabase,
  createSoftwareInSupabase,
  createAccessRequestInSupabase,
  getUserRequestsFromSupabase,
  getPendingRequestsFromSupabase,
  updateRequestStatusInSupabase
} from './supabaseApi';

// Auth APIs
export const login = async (username: string, password: string) => {
  return loginWithSupabase(username, password);
};

export const signup = async (username: string, password: string) => {
  return signupWithSupabase(username, password);
};

// Software APIs
export const getSoftwareList = async (): Promise<Software[]> => {
  return getSoftwareListFromSupabase();
};

export const createSoftware = async (software: Omit<Software, 'id'>): Promise<Software> => {
  return createSoftwareInSupabase(software);
};

// Request APIs
export const createAccessRequest = async (
  softwareId: number,
  accessType: string,
  reason: string
): Promise<AccessRequest> => {
  // Get the current user ID from localStorage
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('User not logged in');
  }
  
  const user = JSON.parse(userStr);
  return createAccessRequestInSupabase(user.id, softwareId, accessType, reason);
};

export const getUserRequests = async (): Promise<AccessRequest[]> => {
  // Get the current user ID from localStorage
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('User not logged in');
  }
  
  const user = JSON.parse(userStr);
  return getUserRequestsFromSupabase(user.id);
};

export const getPendingRequests = async (): Promise<AccessRequest[]> => {
  return getPendingRequestsFromSupabase();
};

export const updateRequestStatus = async (
  requestId: number,
  status: 'Approved' | 'Rejected'
): Promise<AccessRequest> => {
  return updateRequestStatusInSupabase(requestId, status);
};
