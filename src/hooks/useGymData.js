import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { todayISO } from "../lib/helpers";

export function useTodayCheckin() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["checkin", user?.id, todayISO()],
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase
        .from("gym_checkins")
        .select("*")
        .eq("user_id", user.id)
        .eq("checkin_date", todayISO())
        .maybeSingle();
      return data;
    },
  });
}

export function useScanQR() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (token) => {
      const { data: t } = await supabase
        .from("qr_tokens")
        .select("*")
        .eq("token", token)
        .eq("valid_date", todayISO())
        .maybeSingle();
      if (!t) throw new Error("This QR code is invalid or expired");
      const { data, error } = await supabase
        .from("gym_checkins")
        .insert({ user_id: user.id, qr_token: token, checkin_date: todayISO() })
        .select()
        .single();
      if (error) {
        if (error.code === "23505") throw new Error("Already checked in today");
        throw error;
      }
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checkin"] }),
  });
}

export function useRoutine() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["routine", user?.id],
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercise_routines")
        .select("*")
        .eq("user_id", user.id)
        .order("day_number");
      if (error) throw error;
      return data;
    },
  });
}

export function useTodayLog() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["log", user?.id, todayISO()],
    enabled: !!user,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("routine_date", todayISO())
        .maybeSingle();
      return data;
    },
  });
}

export function useSubmitWorkout() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ exercises_completed, checkin_id }) => {
      const { data, error } = await supabase
        .from("workout_logs")
        .insert({ user_id: user.id, routine_date: todayISO(), exercises_completed, checkin_id })
        .select()
        .single();
      if (error) throw error;
      const { data: fresh } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("id", data.id)
        .single();
      return fresh;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["log"] });
      qc.invalidateQueries({ queryKey: ["points"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leaderboard_view")
        .select("*")
        .order("rank");
      if (error) throw error;
      return data;
    },
  });
}

export function usePointsHistory(userId) {
  return useQuery({
    queryKey: ["points", userId],
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("points_ledger")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useDashboardStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["dashboardStats", user?.id],
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      const [logs, points] = await Promise.all([
        supabase
          .from("workout_logs")
          .select("routine_date, points_awarded")
          .eq("user_id", user.id)
          .order("routine_date", { ascending: false }),
        supabase
          .from("points_ledger")
          .select("points, created_at")
          .eq("user_id", user.id),
      ]);
      const totalWorkouts = logs.data?.length || 0;
      const totalPoints = (points.data || []).reduce((s, p) => s + p.points, 0);
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      const weekPoints = (points.data || [])
        .filter((p) => new Date(p.created_at) >= weekAgo)
        .reduce((s, p) => s + p.points, 0);
      let streak = 0;
      const dates = (logs.data || []).map((l) => l.routine_date);
      const set = new Set(dates);
      let cursor = new Date();
      while (set.has(cursor.toISOString().slice(0, 10))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }
      return { totalWorkouts, totalPoints, weekPoints, streak };
    },
  });
}
