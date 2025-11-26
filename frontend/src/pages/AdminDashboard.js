import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Trash2, Users, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const { API } = useAuth();
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, complaintsRes] = await Promise.all([
          axios.get(`${API}/analytics/wastage`),
          axios.get(`${API}/complaints/`)
        ]);
        setStats(statsRes.data);
        setComplaints(complaintsRes.data);
      } catch (error) {
        console.error("Error fetching admin data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meals Served</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_meals_served}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meals Skipped</CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.meals_skipped}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.participation_rate.toFixed(1)}% Participation Rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Food Saved (Est.)</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.wastage_saved_kg.toFixed(1)} kg</div>
            <p className="text-xs text-muted-foreground">Based on skipped meals</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="complaints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="complaints">Recent Complaints</TabsTrigger>
          <TabsTrigger value="analytics">Detailed Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="complaints" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {complaints.map((comp) => (
              <Card key={comp.id}>
                <CardHeader>
                  <CardTitle className="text-base capitalize flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" />
                    {comp.category}
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">
                    {new Date(comp.created_at).toLocaleDateString()}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{comp.description}</p>
                  {comp.image_url && (
                    <img 
                      src={`${process.env.REACT_APP_BACKEND_URL}${comp.image_url}`} 
                      alt="Complaint" 
                      className="mt-2 rounded-md w-full h-32 object-cover"
                    />
                  )}
                </CardContent>
              </Card>
            ))}
            {complaints.length === 0 && (
              <div className="col-span-full text-center p-8 text-muted-foreground">
                No complaints found.
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Detailed charts coming soon...
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
