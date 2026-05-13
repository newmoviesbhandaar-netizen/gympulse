import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, QrCode, Dumbbell, Trophy, User, Shield, LogOut, Zap } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useProfile } from "../../hooks/useProfile";
import Avatar from "../ui/Avatar";
import toast from "react-hot-toast";

const links = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/checkin", icon: QrCode, label: "Check-In" },
  { to: "/routine", icon: Dumbbell, label: "Routine" },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-bg-secondary border-r border-bordr flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-bordr">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-text-primary">GymPulse</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-btn transition font-medium ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50"
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
        {profile?.is_admin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-btn transition font-medium ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50"
              }`
            }
          >
            <Shield size={20} />
            Admin
          </NavLink>
        )}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-bordr">
        <div className="flex items-center gap-3 mb-3">
          <Avatar url={profile?.avatar_url} name={profile?.full_name || ""} size={36} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary truncate">{profile?.full_name || "User"}</p>
            <p className="text-xs text-text-secondary truncate">{profile?.total_points || 0} pts</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-text-secondary hover:text-danger transition text-sm w-full px-2 py-1.5 rounded-btn hover:bg-danger/10"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
