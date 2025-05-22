
import { AccessRequest, Software, User } from '@/types';

const API_URL = 'http://localhost:8000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

// Auth APIs
export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  return response.json();
};

export const signup = async (username: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    throw new Error('Signup failed');
  }
  
  return response.json();
};

// Software APIs
export const getSoftwareList = async (): Promise<Software[]> => {
  const response = await fetch(`${API_URL}/software`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch software list');
  }
  
  return response.json();
};

export const createSoftware = async (software: Omit<Software, 'id'>): Promise<Software> => {
  const response = await fetch(`${API_URL}/software`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(software),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create software');
  }
  
  return response.json();
};

// Request APIs
export const createAccessRequest = async (
  softwareId: number,
  accessType: string,
  reason: string
): Promise<AccessRequest> => {
  const response = await fetch(`${API_URL}/requests`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ softwareId, accessType, reason }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create access request');
  }
  
  return response.json();
};

export const getUserRequests = async (): Promise<AccessRequest[]> => {
  const response = await fetch(`${API_URL}/requests/user`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user requests');
  }
  
  return response.json();
};

export const getPendingRequests = async (): Promise<AccessRequest[]> => {
  const response = await fetch(`${API_URL}/requests/pending`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch pending requests');
  }
  
  return response.json();
};

export const updateRequestStatus = async (
  requestId: number,
  status: 'Approved' | 'Rejected'
): Promise<AccessRequest> => {
  const response = await fetch(`${API_URL}/requests/${requestId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to ${status.toLowerCase()} request`);
  }
  
  return response.json();
};
