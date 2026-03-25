import React, { useRef, useEffect, useCallback } from "react";
import { useListNotifications, useMarkNotificationRead } from "../lib/api.js";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { Bell, MousePointerClick, MailOpen, Download, ArrowDownLeft, Check, CheckCheck, RefreshCw } from "lucide-react";
import { formatRelative } from "../lib/utils.js";

export default function Notifications() {
  const queryClient  = useQueryClient();
  const { data, isLoading } = useListNotifications();
  const notifications = data?.notifications || [];
  const unread        = notifications.filter((n) => !n.isRead).length;

  const { mutate: markRead, isPending: markingOne } = useMarkNotificationRead();

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [queryClient]);

  // Polling
  useEffect(() => {
    const id = setInterval(refetch, 30_000);
    const onVisible = () => { if (document.visibilityState === "visible") refetch(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVisible); };
  }, [refetch]);

  const handleMarkOne = (id) => markRead({ notificationId: id }, { onSuccess: refetch });

  const handleMarkAll = () => {
    notifications.filter((n) => !n.isRead).forEach((n) => markRead({ notificationId: n.id }, {}));
    setTimeout(refetch, 500);
  };

  const getIcon = (type) => {
    const MAP = {
      email_opened:    { bg: "bg-purple-100", color: "text-purple-600", Icon: MailOpen },
      link_clicked:    { bg: "bg-amber-100",  color: "text-amber-600",  Icon: MousePointerClick },
      file_downloaded: { bg: "bg-blue-100",   color: "text-blue-600",   Icon: Download },
      reply_received:  { bg: "bg-emerald-100",color: "text-emerald-600",Icon: ArrowDownLeft },
    };
    const cfg = MAP[type] || { bg: "bg-slate-100", color: "text-slate-600", Icon: Bell };
    return (
      <div className={`w-10 h-10 rounded-full ${cfg.bg} ${cfg.color} flex items-center justify-center`}>
        <cfg.Icon className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            {unread > 0 && <Badge color="danger">{unread} unread</Badge>}
          </div>
          <p className="text-slate-500 mt-1">
            Real-time alerts for email engagements and replies.{" "}
            <span className="text-xs text-slate-400">Auto-refreshes every 30s</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          {unread > 0 && (
            <Button variant="outline" onClick={handleMarkAll}>
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20"><Spinner className="w-10 h-10" /></div>
      ) : notifications.length === 0 ? (
        <Card className="p-20 text-center border-dashed border-slate-300">
          <Bell className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-1">All Caught Up</h3>
          <p className="text-slate-500">You don't have any new notifications.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, i) => (
            <div
              key={notif.id}
              className={`rounded-2xl border overflow-hidden transition-all ${
                !notif.isRead
                  ? "bg-blue-50/60 border-blue-200 shadow-md"
                  : "bg-white border-slate-200 shadow-sm hover:shadow-md"
              }`}
              style={{ animation: `fadeUp 0.3s ease ${i * 0.04}s both` }}
            >
              <div className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-start sm:items-center">
                <div className="shrink-0">{getIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-base truncate ${!notif.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4 mt-1">{formatRelative(notif.createdAt)}</span>
                  </div>
                  <p className={`text-sm mb-2 ${!notif.isRead ? "text-slate-700" : "text-slate-500"}`}>{notif.message}</p>
                  {notif.clientName && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                      {notif.clientName}
                    </span>
                  )}
                </div>
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkOne(notif.id)}
                    disabled={markingOne}
                    title="Mark as read"
                    className="shrink-0 w-8 h-8 rounded-full text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>
  );
}