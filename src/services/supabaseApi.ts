import { AccessRequest, Software, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Parse the accessLevels - handle both string formats and JSON
  return data.map((sw) => {
    let accessLevels: AccessLevel[] = [];
    
    try {
      // Try to parse as JSON first
      if (sw.accessLevels) {
        if (typeof sw.accessLevels === 'string') {
          // Check if it's already a comma-separated string
          if (sw.accessLevels.includes(',')) {
            // Explicitly cast each string to AccessLevel type
            accessLevels = sw.accessLevels.split(',').filter((level): level is AccessLevel => {
              return ['Read', 'Write', 'Admin'].includes(level);
            });
          } else {
            // Try to parse as JSON
            try {
              const parsed = JSON.parse(sw.accessLevels);
              if (Array.isArray(parsed)) {
                accessLevels = parsed.filter((level): level is AccessLevel => {
                  return ['Read', 'Write', 'Admin'].includes(level);
                });
              } else if (['Read', 'Write', 'Admin'].includes(parsed)) {
                accessLevels = [parsed as AccessLevel];
              }
            } catch {
              // If JSON parsing fails and it's a valid AccessLevel, use as a single item
              if (['Read', 'Write', 'Admin'].includes(sw.accessLevels)) {
                accessLevels = [sw.accessLevels as AccessLevel];
              }
            }
          }
        } else if (Array.isArray(sw.accessLevels)) {
          // If it's already an array, filter only valid AccessLevel values
          accessLevels = sw.accessLevels.filter((level): level is AccessLevel => {
            return ['Read', 'Write', 'Admin'].includes(level);
          });
        }
      }
    } catch (e) {
      console.error(`Failed to parse accessLevels for software ${sw.id}:`, e);
      accessLevels = [];
    }
    
    return {
      ...sw,
      accessLevels
    };
  });
};

export const createSoftwareInSupabase = async (software: Omit<Software, 'id'>): Promise<Software> => {
  // For storage, we'll convert the array to a comma-separated string
  const accessLevelsString = Array.isArray(software.accessLevels) 
    ? software.accessLevels.join(',') 
    : software.accessLevels;
    
  const { data, error } = await supabase
    .from('software')
    .insert([
      { 
        name: software.name, 
        description: software.description, 
        accessLevels: accessLevelsString
      }
    ])
    .select()
    .single();
  
  if (error || !data) {
    console.error('Error creating software:', error);
    throw new Error('Failed to create software');
  }
  
  // Ensure we're returning the correct type
  const accessLevels = accessLevelsString.split(',').filter((level): level is AccessLevel => {
    return ['Read', 'Write', 'Admin'].includes(level);
  });
  
  return {
    ...data,
    accessLevels
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
    
  // Parse software access levels
  let accessLevels: AccessLevel[] = [];
  try {
    if (software?.accessLevels) {
      if (typeof software.accessLevels === 'string') {
        if (software.accessLevels.includes(',')) {
          accessLevels = software.accessLevels.split(',').filter((level): level is AccessLevel => {
            return ['Read', 'Write', 'Admin'].includes(level);
          });
        } else {
          try {
            const parsed = JSON.parse(software.accessLevels);
            if (Array.isArray(parsed)) {
              accessLevels = parsed.filter((level): level is AccessLevel => {
                return ['Read', 'Write', 'Admin'].includes(level);
              });
            } else if (['Read', 'Write', 'Admin'].includes(parsed)) {
              accessLevels = [parsed as AccessLevel];
            }
          } catch {
            if (['Read', 'Write', 'Admin'].includes(software.accessLevels)) {
              accessLevels = [software.accessLevels as AccessLevel];
            }
          }
        }
      } else if (Array.isArray(software.accessLevels)) {
        accessLevels = software.accessLevels.filter((level): level is AccessLevel => {
          return ['Read', 'Write', 'Admin'].includes(level);
        });
      }
    }
  } catch (e) {
    console.error('Failed to parse accessLevels:', e);
    accessLevels = [];
  }
  
  return {
    id: data.id,
    accessType: data.accessType as AccessLevel,
    reason: data.reason,
    status: data.status as RequestStatus,
    user: {
      id: user?.id || 0,
      username: user?.username || '',
      role: user?.role as UserRole
    },
    software: {
      id: software?.id || 0,
      name: software?.name || '',
      description: software?.description || '',
      accessLevels
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
      
    // Parse software access levels
    let accessLevels: AccessLevel[] = [];
    try {
      if (software?.accessLevels) {
        if (typeof software.accessLevels === 'string') {
          if (software.accessLevels.includes(',')) {
            accessLevels = software.accessLevels.split(',').filter((level): level is AccessLevel => {
              return ['Read', 'Write', 'Admin'].includes(level);
            });
          } else {
            try {
              const parsed = JSON.parse(software.accessLevels);
              if (Array.isArray(parsed)) {
                accessLevels = parsed.filter((level): level is AccessLevel => {
                  return ['Read', 'Write', 'Admin'].includes(level);
                });
              } else if (['Read', 'Write', 'Admin'].includes(parsed)) {
                accessLevels = [parsed as AccessLevel];
              }
            } catch {
              if (['Read', 'Write', 'Admin'].includes(software.accessLevels)) {
                accessLevels = [software.accessLevels as AccessLevel];
              }
            }
          }
        } else if (Array.isArray(software.accessLevels)) {
          accessLevels = software.accessLevels.filter((level): level is AccessLevel => {
            return ['Read', 'Write', 'Admin'].includes(level);
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse accessLevels:', e);
      accessLevels = [];
    }
    
    requests.push({
      id: request.id,
      accessType: request.accessType as AccessLevel,
      reason: request.reason,
      status: request.status as RequestStatus,
      user: {
        id: user?.id || 0,
        username: user?.username || '',
        role: user?.role as UserRole
      },
      software: {
        id: software?.id || 0,
        name: software?.name || '',
        description: software?.description || '',
        accessLevels
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
      
    // Parse software access levels
    let accessLevels: AccessLevel[] = [];
    try {
      if (software?.accessLevels) {
        if (typeof software.accessLevels === 'string') {
          if (software.accessLevels.includes(',')) {
            accessLevels = software.accessLevels.split(',').filter((level): level is AccessLevel => {
              return ['Read', 'Write', 'Admin'].includes(level);
            });
          } else {
            try {
              const parsed = JSON.parse(software.accessLevels);
              if (Array.isArray(parsed)) {
                accessLevels = parsed.filter((level): level is AccessLevel => {
                  return ['Read', 'Write', 'Admin'].includes(level);
                });
              } else if (['Read', 'Write', 'Admin'].includes(parsed)) {
                accessLevels = [parsed as AccessLevel];
              }
            } catch {
              if (['Read', 'Write', 'Admin'].includes(software.accessLevels)) {
                accessLevels = [software.accessLevels as AccessLevel];
              }
            }
          }
        } else if (Array.isArray(software.accessLevels)) {
          accessLevels = software.accessLevels.filter((level): level is AccessLevel => {
            return ['Read', 'Write', 'Admin'].includes(level);
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse accessLevels:', e);
      accessLevels = [];
    }
    
    requests.push({
      id: request.id,
      accessType: request.accessType as AccessLevel,
      reason: request.reason,
      status: request.status as RequestStatus,
      user: {
        id: user?.id || 0,
        username: user?.username || '',
        role: user?.role as UserRole
      },
      software: {
        id: software?.id || 0,
        name: software?.name || '',
        description: software?.description || '',
        accessLevels
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
    
  // Parse software access levels
  let accessLevels: AccessLevel[] = [];
  try {
    if (software?.accessLevels) {
      if (typeof software.accessLevels === 'string') {
        if (software.accessLevels.includes(',')) {
          accessLevels = software.accessLevels.split(',').filter((level): level is AccessLevel => {
            return ['Read', 'Write', 'Admin'].includes(level);
          });
        } else {
          try {
            const parsed = JSON.parse(software.accessLevels);
            if (Array.isArray(parsed)) {
              accessLevels = parsed.filter((level): level is AccessLevel => {
                return ['Read', 'Write', 'Admin'].includes(level);
              });
            } else if (['Read', 'Write', 'Admin'].includes(parsed)) {
              accessLevels = [parsed as AccessLevel];
            }
          } catch {
            if (['Read', 'Write', 'Admin'].includes(software.accessLevels)) {
              accessLevels = [software.accessLevels as AccessLevel];
            }
          }
        }
      } else if (Array.isArray(software.accessLevels)) {
        accessLevels = software.accessLevels.filter((level): level is AccessLevel => {
          return ['Read', 'Write', 'Admin'].includes(level);
        });
      }
    }
  } catch (e) {
    console.error('Failed to parse accessLevels:', e);
    accessLevels = [];
  }
  
  return {
    id: data.id,
    accessType: data.accessType as AccessLevel,
    reason: data.reason,
    status: data.status as RequestStatus,
    user: {
      id: user?.id || 0,
      username: user?.username || '',
      role: user?.role as UserRole
    },
    software: {
      id: software?.id || 0,
      name: software?.name || '',
      description: software?.description || '',
      accessLevels
    }
  };
};
