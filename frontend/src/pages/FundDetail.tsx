import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface FundData {
  schemeCode: number;
  schemeName: string;
  nav: string;
  date: string;
}

interface NavHistory {
  date: string;
  nav: string;
}

const FundDetail = () => {
  const { schemeCode } = useParams<{ schemeCode: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fund, setFund] = useState<FundData | null>(null);
  const [navHistory, setNavHistory] = useState<NavHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingHolding, setExistingHolding] = useState<any | null>(null);

  useEffect(() => {
    const fetchFundData = async () => {
      if (!schemeCode) {
        setIsLoading(false);
        setErrorInfo("No fund specified.");
        return;
      }

      setIsLoading(true);
      setErrorInfo(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/funds/details/${schemeCode}`);
        const data = await response.json();

        if (data && data.meta && data.meta.scheme_name) {
          setFund({
            schemeCode: data.meta.scheme_code,
            schemeName: data.meta.scheme_name,
            nav: data.data?.[0]?.nav || 'N/A',
            date: data.data?.[0]?.date || 'N/A',
          });
          setNavHistory(data.data || []);
        } else {
          throw new Error(`The API returned unexpected data. Full response: ${JSON.stringify(data, null, 2)}`);
        }
      } catch (error: any) {
        console.error('Error fetching fund data:', error);
        setErrorInfo(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFundData();
  }, [schemeCode]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token || !schemeCode) return;
      try {
        const response = await fetch(`http://localhost:5000/api/funds/saved`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return;
        const data = await response.json();
        const foundFund = data.portfolio?.find((f: any) => f.schemeCode.toString() === schemeCode);
        if (foundFund) {
          setExistingHolding(foundFund);
          setQuantity(foundFund.quantity.toString());
          setPurchasePrice(foundFund.purchasePrice.toString());
        }
      } catch (error) {
        console.error("Could not check saved status. Is the backend running?", error);
      }
    };
    checkSavedStatus();
  }, [schemeCode]);

  const handleSaveToPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast({ title: "Authentication Required", description: "Please log in to manage your portfolio.", variant: "destructive" });
      navigate('/login');
      return;
    }

    const numQuantity = parseFloat(quantity);
    const numPrice = parseFloat(purchasePrice);

    if (isNaN(numQuantity) || numQuantity <= 0 || isNaN(numPrice) || numPrice < 0) {
      toast({ title: "Invalid Input", description: "Please enter a valid positive quantity and purchase price.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/funds/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          schemeCode: fund?.schemeCode,
          quantity: numQuantity,
          purchasePrice: numPrice,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update portfolio');
      }

      toast({
        title: "Success!",
        description: `Your portfolio has been ${existingHolding ? 'updated' : 'added to'}.`,
      });
      navigate('/saved');
    } catch (error: any) {
      console.error('Save to portfolio error:', error);
      toast({
        title: "Operation Failed",
        description: error.message || "An error occurred. Is the backend running?",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (errorInfo) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">An Error Occurred</h2>
        <p className="mb-4">The page could not be loaded. Here is the technical reason:</p>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-left whitespace-pre-wrap font-mono text-sm">
          {errorInfo}
        </pre>
        <Button onClick={() => navigate('/search')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
        </Button>
      </div>
    );
  }

  if (!fund) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Fund Not Found</h2>
        <p className="text-muted-foreground mb-6">The fund you are looking for could not be loaded.</p>
        <Button onClick={() => navigate('/search')}><ArrowLeft className="mr-2 h-4 w-4" />Back to Search</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{fund.schemeName}</h1>
            <p className="text-muted-foreground">Scheme Code: {fund.schemeCode}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-2xl md:text-3xl font-bold">{formatCurrency(fund.nav)}</p>
            <p className="text-sm text-muted-foreground">Latest NAV as of {fund.date}</p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="portfolio">
        <TabsList className="mb-4">
          <TabsTrigger value="portfolio">Add to My Portfolio</TabsTrigger>
          <TabsTrigger value="history">NAV History</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle>{existingHolding ? 'Update Your Holding' : 'Add to Your Portfolio'}</CardTitle>
              <CardDescription>Track your investment by adding quantity and average purchase price.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveToPortfolio} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    placeholder="e.g., 150.5" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    step="any"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Average Purchase Price (NAV)</Label>
                  <Input 
                    id="purchasePrice" 
                    type="number" 
                    placeholder="e.g., 45.20" 
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    step="any"
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {existingHolding ? 'Update in Portfolio' : 'Add to Portfolio'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent NAV History</CardTitle>
              <CardDescription>Showing up to the last 30 days of NAV data.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {navHistory.length > 0 ? navHistory.map((item) => (
                  <div key={item.date} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                    <p className="font-mono text-sm">{item.date}</p>
                    <p className="font-semibold">{formatCurrency(item.nav)}</p>
                  </div>
                )) : <p>No NAV history available.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FundDetail;
