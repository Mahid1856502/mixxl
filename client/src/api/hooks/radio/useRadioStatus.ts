import { useEffect, useState } from "react";

interface RadioStatus {
  status: "online" | "offline";
  source: {
    type: "live" | "automated";
    collaborator: string | null;
    relay: string | null;
  };
  current_track: {
    title: string;
    start_time: string;
    artwork_url: string;
    artwork_url_large: string;
  };
  history: { title: string }[];
  logo_url: string;
  outputs: { name: string; format: string; bitrate: number }[];
  accepting_requests: boolean;
}

export function useRadioStatus(streamId: string) {
  const [status, setStatus] = useState<RadioStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `https://public.radio.co/stations/${streamId}/status`
        );
        if (!res.ok) throw new Error("Failed to fetch radio status");
        const data = await res.json();
        if (isMounted) {
          setStatus(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching Radio.co status:", err);
        if (isMounted) setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // refresh every 15s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [streamId]);

  return { status, loading };
}
