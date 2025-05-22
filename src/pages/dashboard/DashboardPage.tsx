import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserRequests, getSoftwareList } from '@/services/api';
import { AccessRequest, Software } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types';
import { Package, Settings, Users } from 'lucide-react';

const DashboardPage = () => {
  const [userRequests, setUserRequests] = useState<AccessRequest[]>([]);
  const [softwareCount, setSoftwareCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch software to get total count
        const software = await getSoftwareList();
        setSoftwareCount(software.length);
        
        // Fetch user requests if not admin
        if (user?.role !== 'Admin') {
          const requests = await getUserRequests();
          setUserRequests(requests);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    
    fetchDashboardData();
  }, [user?.role]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderRoleSpecificContent = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Software Count</CardTitle>
                <CardDescription>Total number of software in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{softwareCount}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Use the Create Software page to add new software
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Admin Access</CardTitle>
                <CardDescription>Your admin capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mt-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    Create new software
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    View all software
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    Full system access
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );
      case 'Manager':
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">My Approvals</CardTitle>
                <CardDescription>Your access request approvals</CardDescription>
              </CardHeader>
              <CardContent>
                {userRequests.length > 0 ? (
                  <ul className="divide-y">
                    {userRequests.slice(0, 3).map((request) => (
                      <li key={request.id} className="py-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{request.software.name}</span>
                          <Badge variant="outline" className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {request.accessType} access
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No approvals yet</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Manager Responsibilities</CardTitle>
                <CardDescription>Your management capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mt-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    Approve access requests
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    Reject access requests
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    Review employee permissions
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );
      case 'Employee':
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">My Access Requests</CardTitle>
                <CardDescription>Status of your access requests</CardDescription>
              </CardHeader>
              <CardContent>
                {userRequests.length > 0 ? (
                  <ul className="divide-y">
                    {userRequests.slice(0, 5).map((request) => (
                      <li key={request.id} className="py-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{request.software.name}</span>
                          <Badge variant="outline" className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {request.accessType} access
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No requests yet</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Available Software</CardTitle>
                <CardDescription>Software you can request access to</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{softwareCount}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Visit the Software List to view details and request access
                </p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-6">Welcome back, {user?.username}!</h2>
        {user && renderRoleSpecificContent(user.role)}
      </div>
      
      {user?.role === 'Admin' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">System Overview</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Software</p>
                    <p className="text-2xl font-bold">{softwareCount}</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Package className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Access Levels</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Settings className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User Roles</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardPage;
