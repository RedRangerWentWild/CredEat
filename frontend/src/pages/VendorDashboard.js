import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { QrCode, DollarSign, TrendingUp } from 'lucide-react';

const VendorDashboard = () => {
  const { API, user } = useAuth();
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await axios.get(`${API}/wallet/`);
        setWallet(res.data);
      } catch (error) {
        console.error("Error fetching wallet", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, [API]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receive Payment</CardTitle>
            <CardDescription>Scan to pay</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <QrCode size={150} className="text-black" />
            </div>
            <p className="mt-4 text-sm font-mono bg-muted p-2 rounded">ID: {user?.id}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings</CardTitle>
            <CardDescription>Total credits collected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-100 rounded-full text-green-600">
                <DollarSign size={32} />
              </div>
              <div>
                <div className="text-3xl font-bold">{wallet.balance.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallet.transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.timestamp).toLocaleDateString()}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    +{tx.amount}
                  </TableCell>
                </TableRow>
              ))}
              {wallet.transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No transactions yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboard;
