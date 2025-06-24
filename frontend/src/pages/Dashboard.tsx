import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Search, Lightbulb, BarChart, ShieldCheck, LogOut } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const features = [
    {
      title: 'Smart Search',
      description: 'Find new mutual funds',
      icon: <Search className="h-8 w-8 text-blue-600" />,
      path: '/search',
    },
    {
      title: 'Expert Guidance',
      description: 'Get market insights',
      icon: <Lightbulb className="h-8 w-8 text-yellow-500" />,
      path: '/guidance',
    },
    {
      title: 'Performance Tracking',
      description: 'Monitor your portfolio',
      icon: <BarChart className="h-8 w-8 text-green-600" />,
      path: '/saved',
    },
    {
      title: 'Secure Platform',
      description: 'Your data is protected',
      icon: <ShieldCheck className="h-8 w-8 text-red-600" />,
      path: '/security',
      disabled: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <TrendingUp className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">FundTracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 hidden sm:block">Welcome, {user.name || 'User'}</span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Welcome to Your Dashboard</h1>
          <p className="text-lg text-gray-600 mt-2">All your investment tools in one place.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <Card 
              key={feature.title} 
              className={`cursor-pointer hover:shadow-xl transition-shadow duration-300 ${feature.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !feature.disabled && navigate(feature.path)}
            >
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                {feature.icon}
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-md">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
