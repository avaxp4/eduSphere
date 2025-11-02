import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, BookOpen, FileText, Video, Shield, GraduationCap, UserCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981'];

export const StatsTab = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_stats');
      if (error) throw error;
      return data as { subjects: number; modules: number; media: number; users: number };
    },
  });

  const { data: roleStats, isLoading: roleStatsLoading } = useQuery({
    queryKey: ['admin-role-stats'],
    queryFn: async () => {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role');
      
      if (error) throw error;

      const roleCounts = {
        student: 0,
        teacher: 0,
        admin: 0,
      };

      roles?.forEach((r) => {
        if (r.role === 'student') roleCounts.student++;
        else if (r.role === 'teacher') roleCounts.teacher++;
        else if (r.role === 'admin') roleCounts.admin++;
      });

      return roleCounts;
    },
  });

  const roleChartData = roleStats
    ? [
        { name: 'طلاب', value: roleStats.student, icon: GraduationCap },
        { name: 'معلمون', value: roleStats.teacher, icon: UserCheck },
        { name: 'مشرفون', value: roleStats.admin, icon: Shield },
      ].filter((item) => item.value > 0)
    : [];

  if (isLoading || roleStatsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">الإحصائيات العامة</h2>
        <p className="text-muted-foreground">نظرة شاملة على النظام</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">المواد الدراسية</CardTitle>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.subjects || 0}</p>
            <CardDescription>إجمالي المواد</CardDescription>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">الوحدات الدراسية</CardTitle>
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.modules || 0}</p>
            <CardDescription>إجمالي الوحدات</CardDescription>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">الوسائط التعليمية</CardTitle>
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Video className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.media || 0}</p>
            <CardDescription>إجمالي الوسائط</CardDescription>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">المستخدمون</CardTitle>
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.users || 0}</p>
            <CardDescription>إجمالي المستخدمين</CardDescription>
          </CardContent>
        </Card>
      </div>

      {roleChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>توزيع الأدوار</CardTitle>
              <CardDescription>عدد المستخدمين حسب الدور</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إحصائيات الأدوار</CardTitle>
              <CardDescription>تفاصيل توزيع المستخدمين</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roleChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
