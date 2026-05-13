import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Users, RefreshCw, Download, Shield, Copy, Check } from "lucide-react";
import { supabase } from "../lib/supabase";
import { todayISO } from "../lib/helpers";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import toast from "react-hot-toast";
import QRCode from "qrcode";

export default function Admin() {
  const [token, setToken] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [members, setMembers] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("qr");

  const loadData = async () => {
    setLoading(true);
    try {
      const [tokRes, membersRes, checkinsRes] = await Promise.all([
        supabase.from("qr_tokens").select("*").eq("valid_date", todayISO()).maybeSingle(),
        supabase.from("profiles").select("*").order("total_points", { ascending: false }),
        supabase.from("gym_checkins").select("*, profiles(full_name, avatar_url)")
          .eq("checkin_date", todayISO()).order("created_at", { ascending: false }),
      ]);
      if (tokRes.data) {
        setToken(tokRes.data.token);
        const url = await QRCode.toDataURL(tokRes.data.token, {
          width: 300, margin: 2,
          color: { dark: "#F8FAFC", light: "#1E293B" },
        });
        setQrDataUrl(url);
      }
      setMembers(membersRes.data || []);
      setCheckins(checkinsRes.data || []);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const generateToken = async () => {
    setGenerating(true);
    try {
      const newToken = Math.random().toString(36).substring(2, 10).toUpperCase() + "-" + todayISO().replace(/-/g, "");
      const { error } = await supabase.from("qr_tokens").upsert({
        token: newToken,
        valid_date: todayISO(),
      }, { onConflict: "valid_date" });
      if (error) throw error;
      setToken(newToken);
      const url = await QRCode.toDataURL(newToken, {
        width: 300, margin: 2,
        color: { dark: "#F8FAFC", light: "#1E293B" },
      });
      setQrDataUrl(url);
      toast.success("New QR token generated!");
    } catch (err) {
      toast.error(err.message || "Failed to generate token");
    } finally {
      setGenerating(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    toast.success("Token copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `gympulse-qr-${todayISO()}.png`;
    a.click();
  };

  const toggleAdmin = async (userId, current) => {
    try {
      await supabase.from("profiles").update({ is_admin: !current }).eq("id", userId);
      setMembers((prev) => prev.map((m) => m.id === userId ? { ...m, is_admin: !current } : m));
      toast.success("Admin status updated");
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  if (loading)
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="skeleton h-12 w-48 rounded-btn" />
        <div className="skeleton h-64 rounded-card" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
          <Shield size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-text-secondary text-sm">Manage check-ins, QR codes, and members</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-secondary border border-bordr rounded-btn p-1 w-fit">
        {["qr", "members", "checkins"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-btn text-sm font-medium capitalize transition ${
              tab === t ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "qr" && (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-col items-center gap-5">
              <div>
                <h2 className="text-xl font-bold text-center">Today's QR Code</h2>
                <p className="text-text-secondary text-sm text-center mt-1">{todayISO()}</p>
              </div>

              {qrDataUrl ? (
                <div className="bg-bg-secondary p-4 rounded-xl border border-bordr">
                  <img src={qrDataUrl} alt="QR Code" className="w-56 h-56 rounded-lg" />
                </div>
              ) : (
                <div className="w-56 h-56 bg-bg-primary rounded-xl border border-bordr flex items-center justify-center">
                  <QrCode size={48} className="text-text-secondary" />
                </div>
              )}

              {token && (
                <div className="bg-bg-primary border border-bordr rounded-btn px-4 py-2 flex items-center gap-3 w-full max-w-xs">
                  <code className="font-mono text-accent flex-1 text-center text-sm">{token}</code>
                  <button onClick={copyToken}>
                    {copied ? <Check size={16} className="text-success" /> : <Copy size={16} className="text-text-secondary hover:text-text-primary" />}
                  </button>
                </div>
              )}

              <div className="flex gap-3 w-full max-w-xs">
                <Button onClick={generateToken} disabled={generating} className="flex-1">
                  <RefreshCw size={14} className={generating ? "animate-spin" : ""} />
                  {generating ? "Generating..." : token ? "Regenerate" : "Generate QR"}
                </Button>
                {qrDataUrl && (
                  <Button variant="secondary" onClick={downloadQR} className="flex-shrink-0">
                    <Download size={14} />
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <div className="bg-bg-secondary border border-bordr rounded-card p-4 text-sm text-text-secondary">
            <p className="font-medium text-text-primary mb-1">Instructions</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Generate a new QR code each morning</li>
              <li>Display it at the gym entrance</li>
              <li>Members scan it to check in</li>
              <li>The token is valid for today only</li>
            </ul>
          </div>
        </div>
      )}

      {tab === "members" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-text-secondary text-sm">{members.length} members</p>
          </div>
          {members.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="bg-bg-secondary border border-bordr rounded-card p-4 flex items-center gap-3">
                <Avatar url={m.avatar_url} name={m.full_name || ""} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{m.full_name || "—"}</p>
                    {m.is_admin && <Badge color="#A855F7">Admin</Badge>}
                  </div>
                  <p className="text-text-secondary text-xs">{m.total_points || 0} pts • {m.goal?.replace(/_/g, " ") || "No goal"}</p>
                </div>
                <button
                  onClick={() => toggleAdmin(m.id, m.is_admin)}
                  className={`text-xs px-3 py-1.5 rounded-btn border transition ${
                    m.is_admin
                      ? "border-danger/50 text-danger hover:bg-danger/10"
                      : "border-bordr text-text-secondary hover:border-accent hover:text-accent"
                  }`}
                >
                  {m.is_admin ? "Revoke Admin" : "Make Admin"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "checkins" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-text-secondary text-sm">{checkins.length} check-ins today</p>
            <Button variant="ghost" onClick={loadData} className="py-2 px-3 text-sm">
              <RefreshCw size={14} /> Refresh
            </Button>
          </div>
          {checkins.length === 0 ? (
            <Card className="text-center py-10">
              <Users size={36} className="text-text-secondary mx-auto mb-3" />
              <p className="text-text-secondary">No check-ins yet today</p>
            </Card>
          ) : (
            checkins.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="bg-bg-secondary border border-bordr rounded-card p-4 flex items-center gap-3">
                  <Avatar url={c.profiles?.avatar_url} name={c.profiles?.full_name || ""} size={36} />
                  <div className="flex-1">
                    <p className="font-medium">{c.profiles?.full_name || "Unknown"}</p>
                    <p className="text-text-secondary text-xs">
                      {new Date(c.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <Badge color="#22C55E">Checked In</Badge>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
