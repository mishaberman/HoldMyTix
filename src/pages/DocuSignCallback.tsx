import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { handleDocuSignCallback } from '@/lib/docusign-api';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const DocuSignCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth0();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`DocuSign authorization failed: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received from DocuSign');
        return;
      }

      if (!isAuthenticated || !user) {
        setStatus('error');
        setMessage('You must be signed in to complete DocuSign authorization');
        return;
      }

      try {
        const result = await handleDocuSignCallback(code, user.sub);
        
        if (result.success) {
          setStatus('success');
          setMessage('DocuSign authorization completed successfully!');
          
          // Redirect to admin or dashboard after 3 seconds
          setTimeout(() => {
            navigate('/admin');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Failed to complete DocuSign authorization');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred during authorization');
        console.error('DocuSign callback error:', error);
      }
    };

    processCallback();
  }, [searchParams, navigate, isAuthenticated, user]);

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
                {status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                {status === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                DocuSign Authorization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                {status === 'loading' && (
                  <div>
                    <p className="mb-4">Processing DocuSign authorization...</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                  </div>
                )}
                
                {status === 'success' && (
                  <div>
                    <p className="text-green-700 mb-4">{message}</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      You will be redirected to the admin panel shortly.
                    </p>
                    <Button onClick={() => navigate('/admin')}>
                      Go to Admin Panel
                    </Button>
                  </div>
                )}
                
                {status === 'error' && (
                  <div>
                    <p className="text-red-700 mb-4">{message}</p>
                    <div className="space-y-2">
                      <Button onClick={() => navigate('/admin')} variant="outline">
                        Back to Admin
                      </Button>
                      <Button onClick={() => window.location.reload()}>
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DocuSignCallback;