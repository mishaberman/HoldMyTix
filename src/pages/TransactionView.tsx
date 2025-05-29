import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TransactionDashboard from "@/components/transaction/TransactionDashboard";
import Layout from "@/components/layout/Layout";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TransactionView = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTransaction(id);
    }
  }, [id]);

  const fetchTransaction = async (transactionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { getTransactionById } = await import("@/lib/api");
      const { data, error } = await getTransactionById(transactionId);

      if (error) throw error;

      if (!data) {
        throw new Error("Transaction not found");
      }

      setLoading(false);
    } catch (err) {
      console.error(`Error fetching transaction ${id}:`, err);
      setError(`Failed to load transaction details. Please try again later.`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg">Loading transaction details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container py-8">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <TransactionDashboard
          transactionId={id}
          // Additional props will be populated from the database in a real implementation
        />
      </div>
    </Layout>
  );
};

export default TransactionView;
