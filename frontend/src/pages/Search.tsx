import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Info } from 'lucide-react';

interface MutualFund {
  schemeCode: number;
  schemeName: string;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [funds, setFunds] = useState<MutualFund[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const searchFunds = async (searchQuery: string) => {
    setIsLoading(true);
    setError('');
    try {
      const url = `https://api.mfapi.in/mf/search?q=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: MutualFund[] = await response.json();
      setFunds(data);

      if (data.length === 0 && searchQuery) {
        setError('No mutual funds found for your search query.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search for mutual funds. Please ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialQuery = searchParams.get('query') || '';
    setQuery(initialQuery);
    if (initialQuery) { 
      searchFunds(initialQuery);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(query.trim())}`);
    searchFunds(query.trim());
  };

  const handleFundClick = (fund: MutualFund) => {
    navigate(`/fund/${fund.schemeCode}`);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Mutual Fund Search</h1>
        <p className="text-muted-foreground mt-2">
          Find the best mutual funds for your investment goals.
        </p>
      </header>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <Input
          type="search"
          placeholder="Search by name or symbol..."
          className="flex-grow"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : <><SearchIcon className="h-4 w-4 mr-2" /> Search</>}
        </Button>
      </form>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {funds.map((fund) => (
          <Card 
            key={fund.schemeCode} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleFundClick(fund)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{fund.schemeName}</CardTitle>
              <CardDescription>Scheme Code: {fund.schemeCode}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Info className="h-4 w-4 mr-2" />
                Click to view details and latest NAV
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Search;
