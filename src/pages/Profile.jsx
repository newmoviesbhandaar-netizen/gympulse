import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Save, TrendingUp, Zap, Target, Activity } from "lucide-react";
import { useProfile, useUpdateProfile } from "../hooks/useProfile";
import { usePointsHistory } from "../hooks/useGymData";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { resizeImage } from "../lib/imageUtils";
import { calcBMI, bmiCategory, formatDate } from "../lib/helpers";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import toast from "react-hot-toast";

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
  const { data: pointsHistory } = usePointsHistory(user?.id);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(false);

  if (isLoading)
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="skeleton h-40 rounded-card" />
        <div className="skeleton h-64 rounded-card" />
      </div>
    );

  const data = form || profile || {};
  const bmi = calcBMI(parseFloat(data.weight_kg), parseFloat(data.height_cm));
  const bmiInfo = bmiCategory(bmi);

  const startEdit = () => {
    setForm({
      full_name: profile?.full_name || "",
      age: profile?.age || "",
      gender: profile?.gender || "male",
      weight_kg: profile?.weight_kg || "",
      height_cm: profile?.height_cm || "",
      goal: profile?.goal || "general_fitness",
      phone: profile?.phone || "",
      emergency_contact: profile?.emergency_contact || "",
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setForm(null);
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateProfile({ ...form, bmi, updated_at: new Date().toISOString() });
      toast.success("Profile updated!");
      setForm(null);
      setEditing(false);
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await resizeImage(file);
      const path = `avatars/${user.id}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      await updateProfile({ avatar_url: urlData.publicUrl + `?t=${Date.now()}` });
      toast.success("Avatar updated!");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Avatar & name */}
      <Card>
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar url={profile?.avatar_url} name={profile?.full_name || ""} size={72} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent rounded-full flex items-center justify-center hover:bg-accent-hover transition disabled:opacity-50"
            >
              <Camera size={13} className="text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile?.full_name || "—"}</h2>
            <p className="text-text-secondary text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge color="#F97316">{profile?.goal?.replace(/_/g, " ") || "No goal set"}</Badge>
              {profile?.is_admin && <Badge color="#A855F7">Admin</Badge>}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Zap, label: "Points", value: profile?.total_points || 0, color: "#F97316" },
          { icon: Activity, label: "BMI", value: bmi || "—", color: bmiInfo.color },
          { icon: Target, label: "Age", value: profile?.age || "—", color: "#3B82F6" },
          { icon: TrendingUp, label: "Goal", value: (profile?.goal || "—").split("_")[0], color: "#22C55E" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-bg-secondary border border-bordr rounded-card p-4 text-center"
          >
            <s.icon size={18} style={{ color: s.color }} className="mx-auto mb-2" />
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-text-secondary text-xs mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Edit form */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-lg">Personal Details</h3>
          {!editing ? (
            <Button variant="secondary" onClick={startEdit} className="py-2 px-4 text-sm">
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={cancelEdit} className="py-2 px-3 text-sm">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isPending} className="py-2 px-4 text-sm">
                <Save size={14} /> {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" value={data.full_name} onChange={set("full_name")} className="col-span-2" />
              <Input label="Age" type="number" value={data.age} onChange={set("age")} />
              <Select label="Gender" value={data.gender} onChange={set("gender")}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
              <Input label="Weight (kg)" type="number" value={data.weight_kg} onChange={set("weight_kg")} />
              <Input label="Height (cm)" type="number" value={data.height_cm} onChange={set("height_cm")} />
              <Select label="Goal" value={data.goal} onChange={set("goal")} className="col-span-2">
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="general_fitness">General Fitness</option>
                <option value="flexibility">Flexibility</option>
              </Select>
              <Input label="Phone" value={data.phone} onChange={set("phone")} className="col-span-2" />
              <Input label="Emergency Contact" value={data.emergency_contact} onChange={set("emergency_contact")} className="col-span-2" />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              ["Full Name", profile?.full_name],
              ["Age", profile?.age ? `${profile.age} years` : "—"],
              ["Gender", profile?.gender],
              ["Weight", profile?.weight_kg ? `${profile.weight_kg} kg` : "—"],
              ["Height", profile?.height_cm ? `${profile.height_cm} cm` : "—"],
              ["BMI", bmi ? `${bmi} (${bmiInfo.label})` : "—"],
              ["Goal", profile?.goal?.replace(/_/g, " ")],
              ["Phone", profile?.phone || "—"],
              ["Emergency Contact", profile?.emergency_contact || "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm border-b border-bordr/50 pb-2 last:border-0">
                <span className="text-text-secondary">{k}</span>
                <span className="font-medium capitalize">{v || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Points history */}
      {pointsHistory?.length > 0 && (
        <Card>
          <h3 className="font-semibold text-lg mb-4">Points History</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {pointsHistory.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{p.reason || "Workout completed"}</p>
                  <p className="text-text-secondary text-xs">
                    {formatDate(p.created_at)}
                  </p>
                </div>
                <span className="text-success font-bold">+{p.points}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
