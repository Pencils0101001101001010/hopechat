"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Chat, LoadingIndicator } from "stream-chat-react";
import ChatSideBar from "./ChatSideBar";
import useInitializeChatClient from "./useInitializeChatClient";
import ChatChannel from "./ChatChannel";
import { useCallback, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import useWindowSize from "@/hooks/useWindowSize";
import { mdBreakpoint } from "@/utils/tailwind";
import { useTheme } from "../ThemeProvider";
import { registerServiceWorker } from "@/utils/serviceWorker";
import { getCurrentPushSubscription, sendPushSubscriptionToServer } from "@/notification/pushService";

export default function ChatPage() {
  const chatClient = useInitializeChatClient();
  const { user } = useUser();
  const {theme} = useTheme();
  const [chatSideBarOpen, setChatSideBarOpen] = useState(false);

  const windowSize = useWindowSize();
  const isLargeScreen = windowSize.width >= mdBreakpoint;

  useEffect(() => {
    if (windowSize.width >= mdBreakpoint) setChatSideBarOpen(false);
  }, [windowSize.width]);

 
//this is part of the notification system
  useEffect(() => {
    async function setUpServiceWorker() {
      try {
        await registerServiceWorker(); 
      } catch (error) {
        console.log(error)
      }
    }
    setUpServiceWorker();
  }, [])

  useEffect(() => {
    async function syncPushSubscription(){
      try {
        const subscription = await getCurrentPushSubscription();
        if(subscription) {
          await sendPushSubscriptionToServer(subscription);
        }
      } catch (error) {
        console.error(error)
      }
    }
    syncPushSubscription();
  }, [])

  const handleSidebarOnClose = useCallback(() => {
    setChatSideBarOpen(false);
  }, []);

  if (!chatClient || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-black">
        <LoadingIndicator size={40} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 text-black dark:bg-black dark:text-white xl:px-20 xl:py-8">
      <div className="MIN-W-[350px] m-auto flex h-full max-w-[1600px] flex-col shadow-sm">
        <Chat client={chatClient}
        theme={theme === "dark" ? "str-chat__theme-dark"  : "str-chat__theme-light"}
        >
          <div className="P-3 flex justify-center border-b border-b-[#DBDDE1] md:hidden">
            <button onClick={() => setChatSideBarOpen(!chatSideBarOpen)}>
              {!chatSideBarOpen ? (
                <span className="flex items-center gap-1">
                  <Menu />
                  Menu
                </span>
              ) : (
                <X />
              )}
            </button>
          </div>
          <div className="flex h-full flex-row overflow-auto">
            <ChatSideBar
              user={user}
              show={isLargeScreen || chatSideBarOpen}
              onClose={handleSidebarOnClose}
            />
            <ChatChannel
              show={isLargeScreen || !chatSideBarOpen}
              hideChannelOnThread={!isLargeScreen}
            />
          </div>
        </Chat>
      </div>
    </div>
  );
}
