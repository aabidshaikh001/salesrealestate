"use client";  // Ensure this is at the very top

import { createContext, useContext, useState, type ReactNode } from "react";
import NotificationModal, { type NotificationType } from "@/components/notification-modal";
import { useRouter } from "next/navigation";

interface NotificationContextType {
  showNotification: (props: {
    type: NotificationType;
    title: string;
    message: string;
    actionLabel?: string;
    action?: () => void;
    redirectTo?: string;
  }) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationProps, setNotificationProps] = useState({
    type: "info" as NotificationType,
    title: "",
    message: "",
    actionLabel: "",
    action: () => {},
    redirectTo: "",
  });
  const router = useRouter();

  const showNotification = ({
    type,
    title,
    message,
    actionLabel,
    action,
    redirectTo,
  }: {
    type: NotificationType;
    title: string;
    message: string;
    actionLabel?: string;
    action?: () => void;
    redirectTo?: string;
  }) => {
    setNotificationProps({
      type,
      title,
      message,
      actionLabel: actionLabel || "OK",
      action: action || (() => {}),
      redirectTo: redirectTo || "",
    });
    setIsOpen(true);
  };

  const hideNotification = () => {
    setIsOpen(false);
  };

  const handleAction = () => {
    if (notificationProps.action) {
      notificationProps.action();
    }
    if (notificationProps.redirectTo) {
      router.push(notificationProps.redirectTo);
    }
    hideNotification();
  };

  console.log("🔹 NotificationProvider mounted"); // Debugging log

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      <NotificationModal
        type={notificationProps.type}
        title={notificationProps.title}
        message={notificationProps.message}
        isOpen={isOpen}
        onClose={hideNotification}
        actionLabel={notificationProps.actionLabel}
        onAction={handleAction}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  console.log("🔸 Notification Context:", context); // Debugging log
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
