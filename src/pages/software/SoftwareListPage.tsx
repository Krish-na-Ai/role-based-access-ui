
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSoftwareList } from '@/services/api';
import { Software } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const SoftwareListPage = () => {
  const [software, setSoftware] = useState<Software[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { isRole } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSoftware = async () => {
      try {
        setIsLoading(true);
        const data = await getSoftwareList();
        setSoftware(data);
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
  }, [toast]);

  const filteredSoftware = software.filter(
    (s) => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <h1 className="text-3xl font-bold">Software List</h1>
        {isRole('Admin') && (
          <Button asChild>
            <Link to="/create-software">Add New Software</Link>
          </Button>
        )}
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search software..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-7 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </CardContent>
              <CardFooter>
                <div className="h-9 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredSoftware.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSoftware.map((sw) => (
            <Card key={sw.id}>
              <CardHeader>
                <CardTitle>{sw.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {sw.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium mb-1">Access Levels:</p>
                  <div className="flex flex-wrap gap-2">
                    {sw.accessLevels.map((level) => (
                      <Badge key={level} variant="outline">
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {isRole('Employee') && (
                  <Button asChild className="w-full">
                    <Link to={`/request-access?software=${sw.id}`}>
                      Request Access
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No software found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try a different search term" : "No software has been added yet"}
          </p>
        </div>
      )}
    </>
  );
};

export default SoftwareListPage;
