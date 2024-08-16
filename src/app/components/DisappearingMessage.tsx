import { useState, useEffect } from "react";

interface DisappearingMessageProps {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}

export default function DisappearingMessage({
  children,
  duration = 5000,
  className,
}: DisappearingMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timeout);
  }, [duration]);

  return (
    <div
      className={`${
        visible ? "opacity-100" : "opacity-0"
      } during-500 w-max transition-opacity ${className}`}
    >
      {children}
    </div>
  );
}
