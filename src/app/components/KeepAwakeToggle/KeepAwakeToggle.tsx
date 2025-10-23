import { useState } from "react";
import  "@/app/components/KeepAwakeToggle/KeepAwakeToggle.scss"
export default function KeepAwakeToggle() {
    const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

    const toggleWakeLock = async () => {
        try {
            if (!wakeLock) {
                const lock = await navigator.wakeLock?.request("screen");
                setWakeLock(lock || null);

                lock?.addEventListener("release", () => setWakeLock(null));
            } else {
                await wakeLock.release();
                setWakeLock(null);
            }
        } catch (err) {
            console.error("Wake Lock error:", err);
        }
    };

    return (
        <label style={{display: "flex", alignItems: "center", gap: "8px", cursor: "pointer"}}>
            <label className="switch">
                <input
                    type="checkbox"
                    checked={!!wakeLock}
                    onChange={toggleWakeLock}
                    style={{width: "20px", height: "20px"}}
                />
                <span className="slider round"></span>
            </label>
            <span>Lesemodus</span>
        </label>
    );
}
