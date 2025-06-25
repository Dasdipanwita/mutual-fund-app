import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, ShieldCheck, TrendingUp, Home } from 'lucide-react';

interface GuidanceData {
  marketOutlook: { title: string; summary: string; };
  topPicks: { id: string; name: string; reason: string; }[];
  strategicAdvice: { title: string; points: string[]; };
}

const ExpertGuidance = () => {
  const navigate = useNavigate();
  const [guidance, setGuidance] = useState<GuidanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchGuidance = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/guidance`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch expert guidance.');
        const data = await response.json();
        setGuidance(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuidance();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <TrendingUp className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">FundTracker</span>
            </div>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}><Home className="h-4 w-4 mr-2" /> Dashboard</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Expert Guidance</h1>
        
        {isLoading && <p>Loading expert guidance...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {guidance && (
          <div className="space-y-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center"><Lightbulb className="h-6 w-6 mr-2 text-blue-600" /> {guidance.marketOutlook.title}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-gray-700">{guidance.marketOutlook.summary}</p></CardContent>
            </Card>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Picks</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {guidance.topPicks.map(pick => (
                  <Card key={pick.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/fund/${pick.id}`)}>
                    <CardHeader><CardTitle className="text-lg">{pick.name}</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-gray-600">{pick.reason}</p></CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><ShieldCheck className="h-6 w-6 mr-2 text-green-600" /> {guidance.strategicAdvice.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {guidance.strategicAdvice.points.map((point, index) => <li key={index}>{point}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExpertGuidance;
