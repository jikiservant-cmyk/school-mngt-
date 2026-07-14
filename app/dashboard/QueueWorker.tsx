'use client';

import { useState, useTransition } from 'react';
import { Mail, RefreshCw, Send, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { processPendingNotificationsAction } from './actions';

interface NotificationItem {
  id: string;
  recipient_phone_snapshot: string | null;
  message: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  provider_response?: string | null;
}

export default function QueueWorker({ 
  notifications: initialNotifications 
}: { 
  notifications: NotificationItem[] 
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRunWorker = () => {
    setError(null);
    setFeedback(null);

    startTransition(async () => {
      try {
        const res = await processPendingNotificationsAction();
        if (res && res.error) {
          setError(res.error);
        } else if (res) {
          setFeedback(res.message || 'Queue processed.');
          setTimeout(() => setFeedback(null), 5000);
        }
      } catch (err: any) {
        setError(err?.message || 'A worker dispatch network error occurred. Please try again.');
      }
    });
  };

  const pendingCount = initialNotifications.filter(n => n.status === 'pending').length;

  return (
    <div className="bg-meridian-panel border border-meridian-border rounded-2xl p-6 space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-meridian-border">
        <div>
          <h3 className="font-serif text-lg font-medium text-meridian-text-1 flex items-center gap-2">
            <Mail className="w-5 h-5 text-meridian-gold" />
            Decoupled Outbound SMS Queue
          </h3>
          <p className="text-[11px] text-meridian-text-3 font-mono mt-0.5">
            Asynchronous Notification Gateway &middot; school.notifications
          </p>
        </div>
        
        {/* Worker trigger button */}
        <button
          onClick={handleRunWorker}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider bg-meridian-gold hover:bg-meridian-gold-dim text-[#FBFAF3] rounded-lg transition duration-150 disabled:opacity-50 cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
          {isPending ? 'Running Worker...' : 'Run SMS Dispatcher'}
        </button>
      </div>

      {/* Queue telemetry notice */}
      {pendingCount > 0 ? (
        <div className="p-3.5 bg-meridian-gold/10 border border-meridian-gold/30 rounded-xl flex items-start gap-2.5 animate-fade-in">
          <Clock className="w-4 h-4 text-meridian-gold shrink-0 mt-0.5 animate-pulse" />
          <div>
            <p className="text-xs font-mono font-semibold text-meridian-gold uppercase">
              {pendingCount} SMS Notification{pendingCount > 1 ? 's' : ''} Pending in Database!
            </p>
            <p className="text-[11px] text-meridian-text-2 mt-0.5">
              The biometrics terminal wrote the attendance fact and queued these alerts. Click <strong className="font-serif text-[11px] text-meridian-text-1">Run SMS Dispatcher</strong> to execute the background daemon.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-meridian-panel-raised/40 border border-meridian-border/50 rounded-xl flex items-start gap-2.5">
          <CheckCircle className="w-4 h-4 text-meridian-gain shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-mono font-semibold text-meridian-gain uppercase">
              Outbound Queue is Clear
            </p>
            <p className="text-[11px] text-meridian-text-3 mt-0.5">
              All messages processed successfully. Test this by using the <strong className="font-mono text-[10px] text-meridian-gold bg-meridian-panel px-1 py-0.2 rounded border border-meridian-border">Terminal Emulator</strong> to clock in a student.
            </p>
          </div>
        </div>
      )}

      {/* Success & error banners */}
      {feedback && (
        <div className="p-3 text-xs font-mono text-meridian-gain bg-[#E1EAD9] border border-[#CBD8C1] rounded-lg animate-fade-in">
          {feedback}
        </div>
      )}
      {error && (
        <div className="p-3 text-xs font-mono text-meridian-loss bg-[#F7EBE8] border border-[#EAC2BA] rounded-lg animate-fade-in">
          {error}
        </div>
      )}

      {/* Queue items list */}
      <div className="overflow-x-auto">
        {initialNotifications.length > 0 ? (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {initialNotifications.map((n) => {
              const isPendingItem = n.status === 'pending';
              const isSentItem = n.status === 'sent';
              
              let providerMeta = null;
              if (n.provider_response) {
                try {
                  providerMeta = JSON.parse(n.provider_response);
                } catch {
                  // Fallback if not JSON
                }
              }

              return (
                <div 
                  key={n.id} 
                  className={`p-4 rounded-xl border transition-colors duration-150 ${
                    isPendingItem 
                      ? 'bg-[#FCFAF2] border-meridian-gold/20' 
                      : 'bg-meridian-panel-raised/40 border-meridian-border/50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-meridian-text-2 bg-meridian-deep px-2 py-0.5 rounded border border-meridian-border">
                          {n.recipient_phone_snapshot || 'Unknown Phone'}
                        </span>
                        <span className="text-[10px] font-mono text-meridian-text-3">
                          Queued: {new Date(n.created_at).toLocaleTimeString('en-US', { hour12: true })}
                        </span>
                        {isSentItem && n.sent_at && (
                          <span className="text-[10px] font-mono text-meridian-text-3">
                            Sent: {new Date(n.sent_at).toLocaleTimeString('en-US', { hour12: true })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-meridian-text-1 italic font-serif">
                        &ldquo;{n.message}&rdquo;
                      </p>
                      
                      {providerMeta && (
                        <div className="flex flex-wrap items-center gap-x-2 text-[9px] font-mono text-meridian-text-3 mt-1.5 pt-1.5 border-t border-meridian-border/40">
                          <span>Gateway: <span className="text-meridian-text-2">{providerMeta.provider}</span></span>
                          <span>&bull;</span>
                          <span>ID: <span className="text-meridian-text-2 font-semibold">{providerMeta.message_id}</span></span>
                          <span>&bull;</span>
                          <span>Charge: <span className="text-meridian-text-2">{providerMeta.cost}</span></span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0">
                      {isPendingItem ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono font-semibold tracking-wider text-meridian-gold bg-[#FCF5E3] border border-meridian-gold/30 rounded-lg animate-pulse">
                          <Clock className="w-3 h-3" />
                          PENDING
                        </span>
                      ) : isSentItem ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono font-semibold tracking-wider text-meridian-gain bg-[#E1EAD9] border border-meridian-gain/30 rounded-lg">
                          <CheckCircle className="w-3 h-3" />
                          DISPATCHED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono font-semibold tracking-wider text-meridian-loss bg-[#F7EBE8] border border-meridian-loss/30 rounded-lg">
                          <AlertTriangle className="w-3 h-3" />
                          FAILED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 px-4 border border-dashed border-meridian-border rounded-xl font-mono text-xs text-meridian-text-3">
            No notification events logged in database.
          </div>
        )}
      </div>

    </div>
  );
}
