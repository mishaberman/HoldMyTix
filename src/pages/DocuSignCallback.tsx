
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";

const DocuSignCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(`DocuSign error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Call your edge function to handle the callback
        const response = await fetch('/api/docusign-callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to process DocuSign authentication');
        }

        setStatus('success');
        setMessage('DocuSign authentication successful! You can now send documents for signing.');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);

      } catch (error) {
        console.error('DocuSign callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin" />}
                {status === 'success' && <CheckCircle className="h-6 w-6 text-green-600" />}
                {status === 'error' && <XCircle className="h-6 w-6 text-red-600" />}
                DocuSign Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">{message}</p>
              
              {status === 'loading' && (
                <p className="text-sm">Processing your DocuSign authentication...</p>
              )}
              
              {status === 'success' && (
                <p className="text-sm text-green-600">
                  Redirecting to dashboard in a few seconds...
                </p>
              )}
              
              {status === 'error' && (
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/dashboard')} 
                    variant="outline"
                    className="w-full"
                  >
                    Return to Dashboard
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="w-full"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DocuSignCallback;
