
import { AccessRequest, Software, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Auth APIs
export const loginWithSupabase = async (username: string, password: string) => {
  try {
    // Find the user by username
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (findError || !users) {
      throw new Error('User not found');
    }
    
    // Validate password (in a real app, we would use proper password hashing)
    if (users.password !== password) {
      throw new Error('Invalid password');
    }
    
    // Generate a simple token (in a real app, this would be a JWT)
    const token = `user_${users.id}_${Date.now()}`;
    
    return {
      token,
      user: {
        id: users.id,
        username: users.username,
        role: users.role as User['role']
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signupWithSupabase = async (username: string, password: string) => {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();
    
    if (existingUser) {
      throw new Error('Username already taken');
    }
    
    // Insert new user with Employee role by default
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        { username, password, role: 'Employee' }
      ])
      .select()
      .single();
    
    if (error || !newUser) {
      throw error || new Error('Failed to create user');
    }
    
    // Generate a simple token
    const token = `user_${newUser.id}_${Date.now()}`;
    
    return {
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role as User['role']
      }
    };
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

// Software APIs
export const getSoftwareListFromSupabase = async (): Promise<Software[]> => {
  const { data, error } = await supabase
    .from('software')
    .select('*');
  
  if (error) {
    console.error('Error fetching software:', error);
    throw new Error('Failed to fetch software list');
  }
  
  // Parse the accessLevels from string to array
  return data.map((sw) => ({
    ...sw,
    accessLevels: sw.accessLevels ? JSON.parse(sw.accessLevels) : []
  }));
};

export const createSoftwareInSupabase = async (software: Omit<Software, 'id'>): Promise<Software> => {
  // Convert accessLevels array to string for storage
  const { data, error } = await supabase
    .from('software')
    .insert([
      { 
        name: software.name, 
        description: software.description, 
        accessLevels: JSON.stringify(software.accessLevels)
      }
    ])
    .select()
    .single();
  
  if (error || !data) {
    console.error('Error creating software:', error);
    throw new Error('Failed to create software');
  }
  
  return {
    ...data,
    accessLevels: JSON.parse(data.accessLevels)
  };
};

// Request APIs
export const createAccessRequestInSupabase = async (
  userId: number,
  softwareId: number,
  accessType: string,
  reason: string
): Promise<AccessRequest> => {
  const { data, error } = await supabase
    .from('requests')
    .insert([
      { userId, softwareId, accessType, reason, status: 'Pending' }
    ])
    .select(`
      id, 
      accessType, 
      reason,
      status,
      userId,
      softwareId
    `)
    .single();
  
  if (error || !data) {
    console.error('Error creating access request:', error);
    throw new Error('Failed to create access request');
  }
  
  // Fetch related user and software data
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.userId)
    .single();
  
  const { data: software } = await supabase
    .from('software')
    .select('*')
    .eq('id', data.softwareId)
    .single();
  
  return {
    id: data.id,
    accessType: data.accessType as any,
    reason: data.reason,
    status: data.status as any,
    user: {
      id: user?.id || 0,
      username: user?.username || '',
      role: user?.role as any
    },
    software: {
      id: software?.id || 0,
      name: software?.name || '',
      description: software?.description || '',
      accessLevels: software?.accessLevels ? JSON.parse(software.accessLevels) : []
    }
  };
};

export const getUserRequestsFromSupabase = async (userId: number): Promise<AccessRequest[]> => {
  const { data, error } = await supabase
    .from('requests')
    .select(`
      id, 
      accessType, 
      reason,
      status,
      userId,
      softwareId
    `)
    .eq('userId', userId);
  
  if (error) {
    console.error('Error fetching user requests:', error);
    throw new Error('Failed to fetch user requests');
  }
  
  // Fetch related data for each request
  const requests: AccessRequest[] = [];
  
  for (const request of data) {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', request.userId)
      .single();
    
    const { data: software } = await supabase
      .from('software')
      .select('*')
      .eq('id', request.softwareId)
      .single();
    
    requests.push({
      id: request.id,
      accessType: request.accessType as any,
      reason: request.reason,
      status: request.status as any,
      user: {
        id: user?.id || 0,
        username: user?.username || '',
        role: user?.role as any
      },
      software: {
        id: software?.id || 0,
        name: software?.name || '',
        description: software?.description || '',
        accessLevels: software?.accessLevels ? JSON.parse(software.accessLevels) : []
      }
    });
  }
  
  return requests;
};

export const getPendingRequestsFromSupabase = async (): Promise<AccessRequest[]> => {
  const { data, error } = await supabase
    .from('requests')
    .select(`
      id, 
      accessType, 
      reason,
      status,
      userId,
      softwareId
    `)
    .eq('status', 'Pending');
  
  if (error) {
    console.error('Error fetching pending requests:', error);
    throw new Error('Failed to fetch pending requests');
  }
  
  // Fetch related data for each request
  const requests: AccessRequest[] = [];
  
  for (const request of data) {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', request.userId)
      .single();
    
    const { data: software } = await supabase
      .from('software')
      .select('*')
      .eq('id', request.softwareId)
      .single();
    
    requests.push({
      id: request.id,
      accessType: request.accessType as any,
      reason: request.reason,
      status: request.status as any,
      user: {
        id: user?.id || 0,
        username: user?.username || '',
        role: user?.role as any
      },
      software: {
        id: software?.id || 0,
        name: software?.name || '',
        description: software?.description || '',
        accessLevels: software?.accessLevels ? JSON.parse(software.accessLevels) : []
      }
    });
  }
  
  return requests;
};

export const updateRequestStatusInSupabase = async (
  requestId: number,
  status: 'Approved' | 'Rejected'
): Promise<AccessRequest> => {
  const { data, error } = await supabase
    .from('requests')
    .update({ status })
    .eq('id', requestId)
    .select(`
      id, 
      accessType, 
      reason,
      status,
      userId,
      softwareId
    `)
    .single();
  
  if (error || !data) {
    console.error(`Error ${status.toLowerCase()} request:`, error);
    throw new Error(`Failed to ${status.toLowerCase()} request`);
  }
  
  // Fetch related data for the request
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.userId)
    .single();
  
  const { data: software } = await supabase
    .from('software')
    .select('*')
    .eq('id', data.softwareId)
    .single();
  
  return {
    id: data.id,
    accessType: data.accessType as any,
    reason: data.reason,
    status: data.status as any,
    user: {
      id: user?.id || 0,
      username: user?.username || '',
      role: user?.role as any
    },
    software: {
      id: software?.id || 0,
      name: software?.name || '',
      description: software?.description || '',
      accessLevels: software?.accessLevels ? JSON.parse(software.accessLevels) : []
    }
  };
};
