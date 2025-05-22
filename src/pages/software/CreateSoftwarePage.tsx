
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { createSoftware } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { AccessLevel } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const accessLevels: { value: AccessLevel; label: string }[] = [
  { value: 'Read', label: 'Read - View data and resources' },
  { value: 'Write', label: 'Write - Create and modify data' },
  { value: 'Admin', label: 'Admin - Full control including settings' },
];

const CreateSoftwarePage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<AccessLevel[]>(['Read']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is admin, redirect otherwise
  if (!isRole('Admin')) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Software name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        title: "Validation Error",
        description: "Software description is required",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedLevels.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one access level is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await createSoftware({
        name,
        description,
        accessLevels: selectedLevels,
      });
      
      toast({
        title: "Success",
        description: "Software created successfully!",
      });
      
      navigate('/software');
    } catch (error) {
      console.error('Error creating software:', error);
      toast({
        title: "Error",
        description: "Failed to create software. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (level: AccessLevel) => {
    setSelectedLevels((prev) => 
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    );
  };

  return (
    <>
      <div className="page-header">
        <h1 className="text-3xl font-bold">Create Software</h1>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>New Software Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" id="create-software-form" name="create-software-form">
              <div className="space-y-2">
                <Label htmlFor="software-name">Software Name</Label>
                <Input
                  id="software-name"
                  name="software-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter software name"
                  disabled={isSubmitting}
                  required
                  autoComplete="off"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="software-description">Description</Label>
                <Textarea
                  id="software-description"
                  name="software-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter software description"
                  className="min-h-32"
                  disabled={isSubmitting}
                  required
                  autoComplete="off"
                />
              </div>
              
              <div className="space-y-3">
                <Label>Access Levels</Label>
                <div className="space-y-3">
                  {accessLevels.map((level) => (
                    <div key={level.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`level-${level.value}`}
                        name={`level-${level.value}`}
                        checked={selectedLevels.includes(level.value)}
                        onCheckedChange={() => handleCheckboxChange(level.value)}
                        disabled={isSubmitting}
                      />
                      <Label 
                        htmlFor={`level-${level.value}`}
                        className="text-sm leading-none flex items-center"
                      >
                        {level.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/software')}
                  disabled={isSubmitting}
                  id="cancel-button"
                  name="cancel-button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  id="submit-button"
                  name="submit-button"
                >
                  {isSubmitting ? "Creating..." : "Create Software"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CreateSoftwarePage;
