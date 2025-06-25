import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Trash2, ArrowUpRight, ArrowDownRight, Minus, Search, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SavedFund {
  schemeCode: number;
  schemeName: string;
  quantity: number;
  purchasePrice: number;
  currentNav: number;
}

interface Portfolio {
  totalInvestment: number;
  currentValue: number;
  overallGainLoss: number;
  overallGainLossPercentage: number;
  funds: SavedFund[];
}

const SavedFunds = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchPortfolio = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/funds/save`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch portfolio.');
      }

      // Defensively set the portfolio state
      if (data && Array.isArray(data.funds)) {
        setPortfolio(data);
      } else {
        // If data is not in the expected format, treat as empty
        setPortfolio({ 
          totalInvestment: 0,
          currentValue: 0,
          overallGainLoss: 0,
          overallGainLossPercentage: 0,
          funds: [] 
        });
      }
    } catch (err) {
      setPortfolio(null); // Ensure portfolio is null on error to show empty state
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load portfolio.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const handleRemoveFund = async (schemeCode: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/funds/remove/${schemeCode}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove fund.');
      }
      toast({
        title: "Success",
        description: "Fund removed from your portfolio.",
      });
      // Refresh portfolio data
      fetchPortfolio();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Could not remove fund.',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

  const getGainLossColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-500';
  };
  
  const getGainLossIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4 inline-block" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4 inline-block" />;
    return <Minus className="h-4 w-4 inline-block" />;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
            </Button>
        </div>

        {!portfolio || !portfolio.funds || portfolio.funds.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>Your Portfolio is Empty</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Start by searching for funds to add to your portfolio.</p>
              <Button onClick={() => navigate('/search')}>
                <Search className="h-4 w-4 mr-2" />
                Find Funds
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader><CardTitle>Total Investment</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{formatCurrency(portfolio.totalInvestment)}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Current Value</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{formatCurrency(portfolio.currentValue)}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Overall P&L</CardTitle></CardHeader>
                <CardContent>
                    <p className={`text-2xl font-bold ${getGainLossColor(portfolio.overallGainLoss)}`}>
                        {formatCurrency(portfolio.overallGainLoss)}
                    </p>
                    <span className={`text-sm font-medium ${getGainLossColor(portfolio.overallGainLoss)}`}>
                        {getGainLossIcon(portfolio.overallGainLoss)} {portfolio.overallGainLossPercentage.toFixed(2)}%
                    </span>
                </CardContent>
              </Card>
            </div>

            {/* Holdings Table */}
            <Card>
              <CardHeader>
                <CardTitle>Your Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fund Name</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Avg. Price</TableHead>
                      <TableHead className="text-right">Current NAV</TableHead>
                      <TableHead className="text-right">Invested</TableHead>
                      <TableHead className="text-right">Current Value</TableHead>
                      <TableHead className="text-right">Gain/Loss</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolio.funds.map((fund) => {
                      const investmentValue = fund.quantity * fund.purchasePrice;
                      const currentValue = fund.quantity * fund.currentNav;
                      const gainLoss = currentValue - investmentValue;
                      return (
                        <TableRow key={fund.schemeCode}>
                          <TableCell className="font-medium cursor-pointer hover:underline" onClick={() => navigate(`/fund/${fund.schemeCode}`)}>{fund.schemeName}</TableCell>
                          <TableCell className="text-right">{fund.quantity.toFixed(4)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(fund.purchasePrice)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(fund.currentNav)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(investmentValue)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(currentValue)}</TableCell>
                          <TableCell className={`text-right font-medium ${getGainLossColor(gainLoss)}`}>{formatCurrency(gainLoss)}</TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveFund(fund.schemeCode)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default SavedFunds;
