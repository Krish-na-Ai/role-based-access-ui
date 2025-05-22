
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPendingRequests, updateRequestStatus } from '@/services/api';
import { AccessRequest } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const PendingRequestsPage = () => {
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { isRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is manager or admin, redirect otherwise
  useEffect(() => {
    if (!isRole('Manager') && !isRole('Admin')) {
      navigate('/dashboard');
    }
  }, [isRole, navigate]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const requests = await getPendingRequests();
        setPendingRequests(requests);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
        toast({
          title: "Error",
          description: "Failed to load pending requests. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [toast]);

  const handleRequestUpdate = async (requestId: number, status: 'Approved' | 'Rejected') => {
    try {
      setProcessingId(requestId);
      await updateRequestStatus(requestId, status);
      
      // Update local state to reflect the change
      setPendingRequests((prev) => 
        prev.filter((req) => req.id !== requestId)
      );
      
      toast({
        title: `Request ${status}`,
        description: `The access request has been ${status.toLowerCase()} successfully.`,
      });
    } catch (error) {
      console.error(`Error ${status.toLowerCase()} request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${status.toLowerCase()} request. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="text-3xl font-bold">Pending Requests</h1>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <div className="h-10 bg-muted rounded animate-pulse w-full"></div>
            <div className="h-32 bg-muted rounded animate-pulse w-full"></div>
          </div>
        ) : pendingRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Software</TableHead>
                  <TableHead>Access Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.user.username}</TableCell>
                    <TableCell>{request.software.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.accessType}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={request.reason}>
                        {request.reason}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleRequestUpdate(request.id, 'Approved')}
                          disabled={processingId === request.id}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRequestUpdate(request.id, 'Rejected')}
                          disabled={processingId === request.id}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <h3 className="text-lg font-medium mb-1">No pending requests</h3>
            <p className="text-muted-foreground text-center">
              There are currently no pending access requests that need your approval.
            </p>
          </div>
        )}
      </Card>
    </>
  );
};

export default PendingRequestsPage;
