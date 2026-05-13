import { motion } from "framer-motion";
import { Flame, Dumbbell, Trophy, TrendingUp, ArrowRight, CheckCircle2, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
import { useDashboardStats, useTodayCheckin, useTodayLog } from "../hooks/useGymData";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import { greet, formatDate, todayISO } from "../lib/helpers";

export default function Dashboard() {
  const { data: profile } = useProfile();
  const { data: stats } = useDashboardStats();
  const { data: checkin } = useTodayCheckin();
  const { data: todayLog } = useTodayLog();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-text-secondary">{greet()},</p>
          <h1 className="text-2xl font-bold">{profile?.full_name?.split(" ")[0] || "Athlete"} 👋</h1>
          <p className="text-text-secondary text-sm mt-1">{formatDate(todayISO())}</p>
        </div>
        <Avatar url={profile?.avatar_url} name={profile?.full_name || ""} size={48} />
      </motion.div>

      {/* Today's status banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        {checkin ? (
          <div className="bg-success/10 border border-success/30 rounded-card p-5 flex items-center gap-4">
            <CheckCircle2 className="text-success flex-shrink-0" size={28} />
            <div className="flex-1">
              <p className="font-semibold text-success">Checked In Today</p>
              <p className="text-text-secondary text-sm">
                {todayLog
                  ? `Workout logged — ${todayLog.exercises_completed} exercises completed`
                  : "Don't forget to log your workout"}
              </p>
            </div>
            {!todayLog && (
              <Link to="/routine" className="text-accent text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Log workout <ArrowRight size={14} />
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-accent/10 border border-accent/30 rounded-card p-5 flex items-center gap-4">
            <Calendar className="text-accent flex-shrink-0" size={28} />
            <div className="flex-1">
              <p className="font-semibold">Not checked in yet</p>
              <p className="text-text-secondary text-sm">Scan the gym QR code to check in</p>
            </div>
            <Link to="/checkin" className="text-accent text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Check In <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Streak" value={`${stats?.streak || 0}d`} sub="consecutive days" color="#F97316" delay={0.15} />
        <StatCard icon={Dumbbell} label="Workouts" value={stats?.totalWorkouts || 0} sub="total sessions" color="#3B82F6" delay={0.2} />
        <StatCard icon={Trophy} label="Total Points" value={stats?.totalPoints || 0} sub="lifetime earned" color="#A855F7" delay={0.25} />
        <StatCard icon={TrendingUp} label="This Week" value={stats?.weekPoints || 0} sub="points earned" color="#22C55E" delay={0.3} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: "/checkin", icon: "📱", title: "QR Check-In", desc: "Scan to check in at the gym", color: "#F97316" },
          { to: "/routine", icon: "💪", title: "Today's Routine", desc: "View and log your workout", color: "#3B82F6" },
          { to: "/leaderboard", icon: "🏆", title: "Leaderboard", desc: "See how you rank", color: "#A855F7" },
        ].map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.05 }}
          >
            <Link to={item.to}>
              <Card hover className="cursor-pointer group">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold group-hover:text-accent transition">{item.title}</p>
                    <p className="text-text-secondary text-sm mt-1">{item.desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all mt-1" />
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Profile completion nudge */}
      {!profile?.onboarded && (
        <Card className="border-accent/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center text-accent font-bold">!</div>
            <div className="flex-1">
              <p className="font-semibold">Complete your profile</p>
              <p className="text-text-secondary text-sm">Set up your metrics to get a personalized routine</p>
            </div>
            <Link to="/onboarding" className="text-accent text-sm font-medium">Set up</Link>
          </div>
        </Card>
      )}
    </div>
  );
}
