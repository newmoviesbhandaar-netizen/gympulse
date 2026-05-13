import { NavLink } from "react-router-dom";
import { LayoutDashboard, QrCode, Dumbbell, Trophy, User } from "lucide-react";

const links = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/checkin", icon: QrCode, label: "Check-In" },
  { to: "/routine", icon: Dumbbell, label: "Routine" },
  { to: "/leaderboard", icon: Trophy, label: "Board" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-bordr z-40 safe-area-pb">
      <div className="flex">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 transition ${
                isActive ? "text-accent" : "text-text-secondary"
              }`
            }
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
