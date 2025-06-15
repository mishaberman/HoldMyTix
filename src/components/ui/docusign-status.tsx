import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, FileText, User } from 'lucide-react';

interface DocuSignStatusProps {
  agreement?: {
    status: string;
    seller_status?: string;
    buyer_status?: string;
    seller_signed_at?: string;
    buyer_signed_at?: string;
    completed_at?: string;
    envelope_id?: string;
  };
  transfer?: {
    seller_name?: string;
    buyer_name?: string;
    seller_email?: string;
    buyer_email?: string;
  };
}

export const DocuSignStatus: React.FC<DocuSignStatusProps> = ({ 
  agreement, 
  transfer 
}) => {
  if (!agreement) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            DocuSign Agreement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">No DocuSign agreement found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'signed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'declined':
      case 'voided':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'sent':
      case 'delivered':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'signed':
        return <Badge className="bg-green-100 text-green-800">Signed</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
      case 'voided':
        return <Badge className="bg-red-100 text-red-800">Voided</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>;
      case 'delivered':
        return <Badge className="bg-blue-100 text-blue-800">Delivered</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const overallStatus = agreement.status?.toLowerCase();
  const isCompleted = overallStatus === 'completed';
  const isDeclined = overallStatus === 'declined' || overallStatus === 'voided';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          DocuSign Agreement Status
          {getStatusBadge(agreement.status)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(agreement.status)}
            <span className="font-medium">Overall Status</span>
          </div>
          <div className="text-right">
            <p className="font-medium capitalize">{agreement.status || 'Unknown'}</p>
            {agreement.completed_at && (
              <p className="text-xs text-muted-foreground">
                Completed: {new Date(agreement.completed_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Individual Recipient Status */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Signature Status</h4>
          
          {/* Seller Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Seller</p>
                <p className="text-xs text-muted-foreground">
                  {transfer?.seller_name || transfer?.seller_email || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="text-right">
              {getStatusBadge(agreement.seller_status)}
              {agreement.seller_signed_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Signed: {new Date(agreement.seller_signed_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Buyer Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Buyer</p>
                <p className="text-xs text-muted-foreground">
                  {transfer?.buyer_name || transfer?.buyer_email || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="text-right">
              {getStatusBadge(agreement.buyer_status)}
              {agreement.buyer_signed_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Signed: {new Date(agreement.buyer_signed_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Envelope Information */}
        {agreement.envelope_id && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Envelope ID: {agreement.envelope_id}
            </p>
          </div>
        )}

        {/* Status Messages */}
        {isCompleted && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium">
              ✅ All parties have signed the agreement
            </p>
          </div>
        )}

        {isDeclined && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">
              ❌ Agreement has been declined or voided
            </p>
          </div>
        )}

        {!isCompleted && !isDeclined && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm font-medium">
              ⏳ Waiting for signatures to complete
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocuSignStatus;