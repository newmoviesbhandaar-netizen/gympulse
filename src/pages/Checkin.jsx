import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { QrCode, CheckCircle2, AlertCircle, Camera } from "lucide-react";
import { useTodayCheckin, useScanQR } from "../hooks/useGymData";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import toast from "react-hot-toast";
import { formatDate, todayISO } from "../lib/helpers";

export default function Checkin() {
  const { data: checkin, isLoading } = useTodayCheckin();
  const { mutateAsync: scanQR, isPending } = useScanQR();
  const [manualToken, setManualToken] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const scannerInstance = useRef(null);

  const handleScan = async (token) => {
    if (!token.trim()) return;
    try {
      await scanQR(token.trim());
      toast.success("Checked in successfully!");
      setManualToken("");
      setScanning(false);
    } catch (err) {
      toast.error(err.message || "Check-in failed");
    }
  };

  useEffect(() => {
    if (!scanning) return;
    let html5QrCode;
    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        html5QrCode = new Html5Qrcode("qr-reader");
        scannerInstance.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            html5QrCode.stop().catch(() => {});
            setScanning(false);
            handleScan(decodedText);
          },
          () => {}
        );
      } catch (err) {
        toast.error("Camera access denied or not available");
        setScanning(false);
      }
    };
    startScanner();
    return () => {
      if (scannerInstance.current) {
        scannerInstance.current.stop().catch(() => {});
      }
    };
  }, [scanning]);

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="skeleton h-48 rounded-card" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gym Check-In</h1>
        <p className="text-text-secondary mt-1">{formatDate(todayISO())}</p>
      </div>

      {checkin ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-success/30 bg-success/5">
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center animate-pulse-glow">
                <CheckCircle2 size={40} className="text-success" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-success">You're Checked In!</h2>
                <p className="text-text-secondary mt-1">
                  Checked in at{" "}
                  {new Date(checkin.created_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="bg-bg-primary rounded-btn px-4 py-2 w-full text-center">
                <p className="text-text-secondary text-sm">Token</p>
                <p className="font-mono text-accent text-sm mt-1">{checkin.qr_token}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* QR Scanner Card */}
          <Card>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                <QrCode size={32} className="text-accent" />
              </div>
              <div className="text-center">
                <h2 className="font-semibold text-lg">Scan QR Code</h2>
                <p className="text-text-secondary text-sm mt-1">
                  Point your camera at the gym QR code
                </p>
              </div>

              {scanning ? (
                <div className="w-full space-y-3">
                  <div id="qr-reader" className="w-full rounded-btn overflow-hidden" />
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setScanning(false);
                      if (scannerInstance.current) {
                        scannerInstance.current.stop().catch(() => {});
                      }
                    }}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setScanning(true)} className="w-full">
                  <Camera size={16} /> Open Camera Scanner
                </Button>
              )}
            </div>
          </Card>

          {/* Manual entry */}
          <Card>
            <h3 className="font-semibold mb-3">Manual Token Entry</h3>
            <p className="text-text-secondary text-sm mb-4">
              If you can't scan, enter the daily token manually
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter daily token..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan(manualToken)}
                className="font-mono"
              />
              <Button
                onClick={() => handleScan(manualToken)}
                disabled={!manualToken.trim() || isPending}
                className="flex-shrink-0"
              >
                {isPending ? "..." : "Submit"}
              </Button>
            </div>
          </Card>

          {/* Info */}
          <div className="flex items-start gap-3 text-text-secondary text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <p>The daily QR code is displayed at the gym entrance and refreshes each day.</p>
          </div>
        </div>
      )}
    </div>
  );
}
