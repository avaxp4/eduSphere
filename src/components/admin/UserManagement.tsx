import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, GraduationCap, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  roles: string[];
}

export const UserManagement = () => {
  const queryClient = useQueryClient();

  const fetchUsersFallback = async (): Promise<UserWithRoles[]> => {
    // الطريقة البديلة: جلب البيانات من الجداول مباشرة
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');

    if (rolesError) throw rolesError;

    // دمج البيانات مع الأدوار
    const usersWithRoles: UserWithRoles[] = profiles.map((profile) => {
      const userRoles = roles
        .filter((r) => r.user_id === profile.id)
        .map((r) => r.role);

      return {
        ...profile,
        email: 'غير متوفر', // سيتم عرض معرف المستخدم بدلاً منه
        roles: userRoles,
      };
    });

    return usersWithRoles;
  };

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // استخدام RPC function للحصول على المستخدمين مع الأدوار والبريد الإلكتروني
      try {
        const { data, error } = await supabase.rpc('get_users_with_roles');

        if (error) {
          // إذا فشلت RPC function، نستخدم الطريقة البديلة
          console.warn('RPC function not available, using fallback method:', error);
          return await fetchUsersFallback();
        }

        return data as UserWithRoles[];
      } catch (error) {
        // في حالة وجود خطأ في RPC function، نستخدم الطريقة البديلة
        console.warn('RPC function error, using fallback method:', error);
        return await fetchUsersFallback();
      }
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role, action }: { userId: string; role: string; action: 'add' | 'remove' }) => {
      if (action === 'add') {
        const { error } = await supabase.from('user_roles').insert({
          user_id: userId,
          role: role as 'student' | 'teacher' | 'admin',
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('تم تحديث الدور بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل تحديث الدور');
    },
  });

  const handleRoleChange = (userId: string, newRole: string, currentRoles: string[]) => {
    if (currentRoles.includes(newRole)) {
      toast.info('المستخدم لديه هذا الدور بالفعل');
      return;
    }

    roleMutation.mutate({
      userId,
      role: newRole,
      action: 'add',
    });
  };

  const handleRemoveRole = (userId: string, role: string) => {
    const roleNames: Record<string, string> = {
      admin: 'مشرف',
      teacher: 'معلم',
      student: 'طالب',
    };
    const roleName = roleNames[role] || role;
    if (confirm(`هل أنت متأكد من إزالة دور "${roleName}" من هذا المستخدم؟`)) {
      roleMutation.mutate({
        userId,
        role,
        action: 'remove',
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'teacher':
        return <UserCheck className="h-3 w-3" />;
      case 'student':
        return <GraduationCap className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'teacher':
        return 'default';
      case 'student':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">إدارة المستخدمين</h2>
        <p className="text-muted-foreground">عرض وإدارة المستخدمين وأدوارهم</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>الأدوار</TableHead>
              <TableHead>تاريخ التسجيل</TableHead>
              <TableHead>إضافة دور</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>
                  {user.email === 'غير متوفر' || !user.email ? (
                    <span className="text-muted-foreground text-sm">{user.id.substring(0, 8)}...</span>
                  ) : (
                    user.email
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 flex-wrap">
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <Badge
                          key={role}
                          variant={getRoleColor(role) as any}
                          className="flex items-center gap-1"
                        >
                          {getRoleIcon(role)}
                          {role === 'admin' && 'مشرف'}
                          {role === 'teacher' && 'معلم'}
                          {role === 'student' && 'طالب'}
                          <button
                            onClick={() => handleRemoveRole(user.id, role)}
                            className="mr-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">لا توجد أدوار</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString('ar-SA')}
                </TableCell>
                <TableCell>
                  <Select
                    onValueChange={(value) => handleRoleChange(user.id, value, user.roles)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="إضافة دور" />
                    </SelectTrigger>
                    <SelectContent>
                      {!user.roles.includes('student') && (
                        <SelectItem value="student">طالب</SelectItem>
                      )}
                      {!user.roles.includes('teacher') && (
                        <SelectItem value="teacher">معلم</SelectItem>
                      )}
                      {!user.roles.includes('admin') && (
                        <SelectItem value="admin">مشرف</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {users?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          لا توجد مستخدمين
        </div>
      )}
    </div>
  );
};
