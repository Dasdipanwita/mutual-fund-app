import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, ArrowLeft } from 'lucide-react';

const Guidance = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
          </Button>
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-yellow-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
              <Lightbulb className="h-8 w-8 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Expert Guidance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This feature is coming soon! We're working on providing you with AI-powered insights and expert recommendations to help you make smarter investment decisions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Guidance;
