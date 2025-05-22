
import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createAccessRequest, getSoftwareList } from '@/services/api';
import { Software, AccessLevel } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const RequestAccessPage = () => {
  const [software, setSoftware] = useState<Software[]>([]);
  const [selectedSoftwareId, setSelectedSoftwareId] = useState<number | ''>('');
  const [selectedAccessType, setSelectedAccessType] = useState<AccessLevel | ''>('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAccessLevels, setAvailableAccessLevels] = useState<AccessLevel[]>([]);
  const { isRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Check if user is employee, redirect otherwise
  if (!isRole('Employee')) {
    navigate('/dashboard');
    return null;
  }

  useEffect(() => {
    const fetchSoftware = async () => {
      try {
        const data = await getSoftwareList();
        setSoftware(data);
        
        // Check if software ID is in URL params
        const softwareId = searchParams.get('software');
        if (softwareId) {
          const numId = parseInt(softwareId, 10);
          if (!isNaN(numId)) {
            setSelectedSoftwareId(numId);
            
            // Set available access levels based on selected software
            const selectedSw = data.find((sw) => sw.id === numId);
            if (selectedSw) {
              setAvailableAccessLevels(selectedSw.accessLevels as AccessLevel[]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching software:', error);
        toast({
          title: "Error",
          description: "Failed to load software list. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSoftware();
  }, [searchParams, toast]);

  const handleSoftwareChange = (value: string) => {
    const numId = parseInt(value, 10);
    setSelectedSoftwareId(numId);
    
    // Reset access type when software changes
    setSelectedAccessType('');
    
    // Update available access levels based on selected software
    const selectedSw = software.find((sw) => sw.id === numId);
    if (selectedSw) {
      setAvailableAccessLevels(selectedSw.accessLevels as AccessLevel[]);
    } else {
      setAvailableAccessLevels([]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedSoftwareId || !selectedAccessType || !reason.trim()) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await createAccessRequest(
        selectedSoftwareId as number,
        selectedAccessType,
        reason
      );
      
      toast({
        title: "Success",
        description: "Access request submitted successfully",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating access request:', error);
      toast({
        title: "Error",
        description: "Failed to submit access request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="text-3xl font-bold">Request Access</h1>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Software Access Request</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-10 bg-muted rounded animate-pulse"></div>
                <div className="h-10 bg-muted rounded animate-pulse"></div>
                <div className="h-32 bg-muted rounded animate-pulse"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="software">Software</Label>
                  <Select
                    value={selectedSoftwareId.toString()}
                    onValueChange={handleSoftwareChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select software" />
                    </SelectTrigger>
                    <SelectContent>
                      {software.map((sw) => (
                        <SelectItem key={sw.id} value={sw.id.toString()}>
                          {sw.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accessType">Access Type</Label>
                  <Select
                    value={selectedAccessType}
                    onValueChange={(value) => setSelectedAccessType(value as AccessLevel)}
                    disabled={isSubmitting || !selectedSoftwareId || availableAccessLevels.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select access type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAccessLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Access</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain why you need access to this software"
                    className="min-h-32"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/software')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RequestAccessPage;
