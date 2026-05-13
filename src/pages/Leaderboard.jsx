import { motion } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";
import { useLeaderboard } from "../hooks/useGymData";
import { useAuth } from "../hooks/useAuth";
import Avatar from "../components/ui/Avatar";
import Card from "../components/ui/Card";

function RankIcon({ rank }) {
  if (rank === 1) return <Crown size={18} className="text-yellow-400" />;
  if (rank === 2) return <Medal size={18} className="text-slate-300" />;
  if (rank === 3) return <Medal size={18} className="text-amber-600" />;
  return <span className="text-text-secondary font-mono text-sm w-[18px] text-center">{rank}</span>;
}

export default function Leaderboard() {
  const { data: board, isLoading } = useLeaderboard();
  const { user } = useAuth();

  const top3 = board?.slice(0, 3) || [];
  const rest = board?.slice(3) || [];

  if (isLoading)
    return (
      <div className="max-w-2xl mx-auto space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-16 rounded-card" />
        ))}
      </div>
    );

  if (!board?.length)
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Trophy size={48} className="text-text-secondary mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No rankings yet</h2>
        <p className="text-text-secondary">Start working out to appear on the leaderboard!</p>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-text-secondary mt-1">Top performers this all-time</p>
      </div>

      {/* Podium */}
      {top3.length >= 1 && (
        <div className="flex items-end justify-center gap-3 py-4">
          {/* 2nd */}
          {top3[1] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              <Avatar url={top3[1].avatar_url} name={top3[1].full_name || ""} size={52} />
              <p className="text-sm font-medium text-center max-w-[80px] truncate">{top3[1].full_name}</p>
              <p className="text-text-secondary text-xs">{top3[1].total_points} pts</p>
              <div className="w-20 h-16 bg-slate-600/30 border border-slate-500/30 rounded-t-lg flex items-center justify-center">
                <Medal size={20} className="text-slate-300" />
              </div>
            </motion.div>
          )}
          {/* 1st */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="relative">
              <Avatar url={top3[0].avatar_url} name={top3[0].full_name || ""} size={64} />
              <Crown size={20} className="text-yellow-400 absolute -top-3 left-1/2 -translate-x-1/2" />
            </div>
            <p className="text-sm font-bold text-center max-w-[90px] truncate">{top3[0].full_name}</p>
            <p className="text-accent text-xs font-semibold">{top3[0].total_points} pts</p>
            <div className="w-20 h-24 bg-yellow-500/10 border border-yellow-500/30 rounded-t-lg flex items-center justify-center">
              <Crown size={24} className="text-yellow-400" />
            </div>
          </motion.div>
          {/* 3rd */}
          {top3[2] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-2"
            >
              <Avatar url={top3[2].avatar_url} name={top3[2].full_name || ""} size={48} />
              <p className="text-sm font-medium text-center max-w-[80px] truncate">{top3[2].full_name}</p>
              <p className="text-text-secondary text-xs">{top3[2].total_points} pts</p>
              <div className="w-20 h-12 bg-amber-700/20 border border-amber-600/30 rounded-t-lg flex items-center justify-center">
                <Medal size={18} className="text-amber-600" />
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        {board?.map((entry, idx) => {
          const isMe = entry.user_id === user?.id;
          return (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <div
                className={`flex items-center gap-4 p-4 rounded-card border transition ${
                  isMe
                    ? "border-accent/40 bg-accent/5"
                    : "border-bordr bg-bg-secondary"
                }`}
              >
                <div className="w-6 flex items-center justify-center flex-shrink-0">
                  <RankIcon rank={entry.rank} />
                </div>
                <Avatar url={entry.avatar_url} name={entry.full_name || ""} size={36} />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isMe ? "text-accent" : ""}`}>
                    {entry.full_name || "Unknown"}
                    {isMe && <span className="text-xs ml-2 text-accent/70">(you)</span>}
                  </p>
                  <p className="text-text-secondary text-xs">{entry.workout_count || 0} workouts</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold">{entry.total_points}</p>
                  <p className="text-text-secondary text-xs">points</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-text-secondary text-xs">Updates every minute</p>
    </div>
  );
}
