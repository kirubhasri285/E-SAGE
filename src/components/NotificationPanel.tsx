import { useState } from 'react';
import { Bell, CheckCheck, Trophy, CheckCircle } from 'lucide-react';
import { getUserNotifications, markNotificationRead, markAllNotificationsRead, Notification } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';

interface NotificationPanelProps {
  userId: string;
}

export default function NotificationPanel({ userId }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState(getUserNotifications(userId));
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const refresh = () => setNotifications(getUserNotifications(userId));

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    refresh();
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead(userId);
    refresh();
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) refresh();
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-primary-foreground/20">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="font-heading font-semibold text-foreground text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
              <CheckCheck className="w-3 h-3" /> Mark all read
            </button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">No notifications yet</p>
          ) : (
            notifications.map(n => (
              <button
                key={n.id}
                onClick={() => !n.read && handleMarkRead(n.id)}
                className={`w-full text-left px-4 py-3 border-b border-border last:border-0 transition-colors hover:bg-secondary/50 ${
                  !n.read ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    n.type === 'winner_announced' ? 'bg-warning/15 text-warning' : 'bg-primary/15 text-primary'
                  }`}>
                    {n.type === 'winner_announced' ? <Trophy className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm ${!n.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
