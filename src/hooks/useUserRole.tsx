import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "student" | "teacher" | "admin";

export const useUserRole = (userId: string | undefined) => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRoles([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("[useUserRole] ERROR:", error);
        setRoles([]);
        setLoading(false);
      } else {
        const mappedRoles = data.map((r) => r.role as UserRole);
        setRoles(mappedRoles);
        setLoading(false);
      }
    };

    fetchRoles();
  }, [userId]);

  const hasRole = (role: UserRole) => roles.includes(role);
  const isTeacher = hasRole("teacher");
  const isAdmin = hasRole("admin");
  const isStudent = hasRole("student");

  return {
    roles,
    loading,
    hasRole,
    isTeacher,
    isAdmin,
    isStudent,
  };
};
