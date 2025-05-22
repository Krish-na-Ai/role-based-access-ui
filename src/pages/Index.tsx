
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-600 flex justify-center items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            AccessManager
          </h1>
          <p className="mt-2 text-gray-600 text-lg">User Access Management System</p>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Welcome to AccessManager</CardTitle>
            <CardDescription>
              A complete system for managing software access requests and approvals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This application allows users to request access to software, managers to approve or reject these requests, 
              and administrators to create and manage software offerings.
            </p>
            
            <h3 className="font-medium text-lg mb-2">Getting Started</h3>
            <ol className="list-decimal list-inside space-y-2 mb-6">
              <li>Start by creating an account or signing in</li>
              <li>Depending on your role, you'll have different capabilities:</li>
              <ul className="list-disc list-inside ml-6 space-y-1 mt-1">
                <li><strong>Employee:</strong> Browse software, request access with justifications</li>
                <li><strong>Manager:</strong> Review and approve/reject access requests</li>
                <li><strong>Admin:</strong> Create new software options, manage the system</li>
              </ul>
            </ol>
            
            <div className="flex justify-center space-x-4">
              <Button asChild size="lg">
                <Link to="/signup">Sign Up</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Log In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            For demo purposes, you can create test accounts with different roles from the sign-up page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
