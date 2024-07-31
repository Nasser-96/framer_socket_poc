import { useEffect, useState } from "react";
import Button from "./button";
import { useRouter } from "next/router";
import { useRouter as useNavigation } from "next/navigation";

export default function NavigateButtons() {
  const router = useRouter();
  const navigate = useNavigation();

  const [shouldShowFramer, setShouldShowFramer] = useState<boolean>(true);
  const [shouldShowLiveKit, setShouldShowLiveKit] = useState<boolean>(true);
  const [shouldShowSocket, setShouldShowSocket] = useState<boolean>(true);

  useEffect(() => {
    if (router.pathname.includes("framer")) {
      setShouldShowFramer(false);
    } else if (router.pathname.includes("livekit")) {
      setShouldShowLiveKit(false);
    } else if (router.pathname.includes("/")) {
      setShouldShowSocket(false);
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center py-2 gap-2">
      {shouldShowFramer && (
        <Button
          onClick={() => {
            navigate.push("/framer");
          }}
        >
          Go To Framer Example
        </Button>
      )}
      {shouldShowLiveKit && (
        <Button
          onClick={() => {
            navigate.push("/livekit");
          }}
        >
          Go To LiveKit Example
        </Button>
      )}
      {shouldShowSocket && (
        <Button
          onClick={() => {
            navigate.push("/");
          }}
        >
          Go To SocketIo Example
        </Button>
      )}
    </div>
  );
}
