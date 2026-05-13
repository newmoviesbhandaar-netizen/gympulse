import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { supabase } from "../lib/supabase";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.fullName } },
      });
      if (error) throw error;
      toast.success("Account created! Complete your profile.");
      navigate("/onboarding");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
            <Zap size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold">GymPulse</span>
        </div>

        <div className="bg-bg-secondary border border-bordr rounded-card p-8">
          <h1 className="text-2xl font-bold mb-2">Create account</h1>
          <p className="text-text-secondary mb-6">Start your fitness journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={form.fullName}
              onChange={set("fullName")}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={set("password")}
              required
            />
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-text-secondary text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-accent hover:text-accent-hover">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
