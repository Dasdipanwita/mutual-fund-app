import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, TrendingUp, Loader2 } from 'lucide-react';
import debounce from 'lodash.debounce';

interface MfApiResponse {
  schemeCode: number;
  schemeName: string;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<MfApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchFunds = async (query: string) => {
    if (query.length < 3) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`https://api.mfapi.in/mf/search?q=${query}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: MfApiResponse[] = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to fetch mutual funds. The API may be down.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchFunds = useCallback(debounce(fetchFunds, 300), []);

  useEffect(() => {
    debouncedFetchFunds(searchQuery);
    return () => {
      debouncedFetchFunds.cancel();
    };
  }, [searchQuery, debouncedFetchFunds]);

  const handleFundClick = (schemeCode: number) => {
    navigate(`/fund/${schemeCode}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">FundFinder</span>
            </div>
            <nav className="flex space-x-2">
              <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
              <Button onClick={() => navigate('/register')}>Get Started</Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Search Mutual Funds</h1>
          <p className="mt-4 text-lg text-gray-600">Instantly find any mutual fund in India using live data.</p>
        </div>

        <div className="mt-10 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Start typing a fund name (e.g., 'Bluechip')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-6 text-lg rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {isLoading && <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin" />}
        </div>

        {error && <p className="text-center text-red-500 mt-4">{error}</p>}

        <div className="mt-6 space-y-2">
          {results.map((fund) => (
            <Card 
              key={fund.schemeCode} 
              className="cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleFundClick(fund.schemeCode)}
            >
              <CardContent className="p-4">
                <p className="font-semibold text-blue-700">{fund.schemeName}</p>
                <p className="text-sm text-gray-500">Scheme Code: {fund.schemeCode}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
