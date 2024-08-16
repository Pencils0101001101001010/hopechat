import { UserButton } from "@clerk/nextjs";
import { BellOff, BellRing, Moon, Sun, Users } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { dark } from "@clerk/themes";
import { useEffect, useState } from "react";
import {
  getCurrentPushSubscription,
  registerPushNotifications,
  unregisterPushNotification,
} from "@/notification/pushService";
import { LoadingIndicator } from "stream-chat-react";
import DisappearingMessage from "../components/DisappearingMessage";

interface MenuBarProps {
  onUserMenuClick: () => void;
}

export default function MenuBar({ onUserMenuClick }: MenuBarProps) {
  const { theme } = useTheme();
  return (
    <div className="flex items-center justify-between gap-3 border-e border-e-[#DBDDE1] bg-white p-3 dark:border-e-gray-800 dark:bg-[#17191c]">
      <UserButton
        afterSignOutUrl="/"
        appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
      />
      <h1 className="text-2xl font-bold text-blue-600">APPCHAT</h1>

      <div className="flex gap-6">
        <PushSubscriptionToggleButton />
        <span title="show users">
          <Users className="cursor-pointer" onClick={onUserMenuClick} />
        </span>
        <ThemeToggleButton />
      </div>
    </div>
  );
}
function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  if (theme === "dark") {
    return (
      <span title="Switch to light theme">
        <Moon className="cursor-pointer" onClick={() => setTheme("light")} />
      </span>
    );
  }
  return (
    <span title="switch to light mode">
      <Sun className="cursor-pointer" onClick={() => setTheme("dark")} />
    </span>
  );
}

function PushSubscriptionToggleButton() {
  const [hasActivePushSubscription, setHasActivePushSubscription] =
    useState<boolean>();

    const [loading, setLoading] = useState(false);

    const [confirmationMessage, setConfirmationMessage] = useState<string>();

  useEffect(() => {
    async function getActivePushSubscription() {
      const subscription = await getCurrentPushSubscription();
      setHasActivePushSubscription(!!subscription);
    }
    getActivePushSubscription();
  }, []);

  async function setPushNotificationEnabled(enable: boolean) {
    if(loading) {
      return;
    }
    setLoading(true);
    setConfirmationMessage(undefined);
    try {
      if (enable) {
        await registerPushNotifications();
      } else {
        await unregisterPushNotification();
      }
      setConfirmationMessage("Push notification" + (enable ?  "enabled" : "disabled"));
      setHasActivePushSubscription(enable);
    } catch (error) {
      console.log(error);
      if (enable && Notification.permission === "denied") {
        alert("Please enable push notification in browser")
      } else {
        alert("Something went wrong. Please try again.")
      }
    }finally {
      setLoading(false);
    }
  }
  if (hasActivePushSubscription === undefined) return null;

  return (
    <div className="relative">
      {loading && (
        <span className="absolute left-1/2 top-1/2 z-10 -translate-y-1/2">
          <LoadingIndicator />
        </span>
      )}
      {confirmationMessage && (
        <DisappearingMessage className="absolute left-1/2 top-8 z-10 -translate-x-1/2 rounded-lg bg-white dark:bg-black px-2 py-1 shadow-md ">
          {confirmationMessage}
        </DisappearingMessage>
      )}
      {hasActivePushSubscription ? (
        <span title="Disable push notification">
          <BellOff
            onClick={() => setPushNotificationEnabled(false)}
            className={`cursor-pointer ${loading ? "opacity-10" : ""}`}
          />
        </span>
      ) : (
        <span title="Enable push notification">
          <BellRing
            onClick={() => setPushNotificationEnabled(true)}
            className={`cursor-pointer ${loading ? "opacity-10" : ""}`}

          />
        </span>
      )}
    </div>
  );
}
