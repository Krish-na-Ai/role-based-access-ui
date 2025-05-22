
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { signup } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

const SignupForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await signup(username, password);
      authLogin(response.token, response.user);
      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // For demo purposes, let's add some quick login buttons
  const handleQuickSignup = async (role: 'Employee' | 'Manager' | 'Admin') => {
    const username = `${role.toLowerCase()}_${Date.now().toString().slice(-4)}`;
    const password = 'password123';
    
    setUsername(username);
    setPassword(password);
    
    try {
      setIsLoading(true);
      const response = await signup(username, password);
      // If it's a manager or admin, we need to update the role directly in the database
      // This would normally be handled by an admin interface, but for demo purposes:
      if (role !== 'Employee') {
        // Update the user's role in Supabase
        const { data, error } = await window.supabase
          .from('users')
          .update({ role })
          .eq('id', response.user.id);
        
        if (!error) {
          // Update the local user object
          response.user.role = role;
        }
      }
      
      authLogin(response.token, response.user);
      toast({
        title: "Demo account created!",
        description: `Created ${role} account: ${username}`,
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Quick signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create demo account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>Create an account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Create a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
        
        {/* Quick demo accounts section */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-center font-medium mb-4">Demo Accounts (Quick Create)</p>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickSignup('Employee')}
              disabled={isLoading}
            >
              Employee
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickSignup('Manager')}
              disabled={isLoading}
            >
              Manager
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickSignup('Admin')}
              disabled={isLoading}
            >
              Admin
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Creates test accounts with different roles
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium">
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignupForm;
