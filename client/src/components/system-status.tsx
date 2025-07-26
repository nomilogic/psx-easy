import { useQuery } from "@tanstack/react-query";
import { Server, Clock, Database, Activity } from "lucide-react";
import type { SystemStatus as SystemStatusType } from "@shared/schema";

export default function SystemStatus() {
  const { data: status, isLoading } = useQuery<SystemStatusType>({
    queryKey: ['/api/system/status'],
    refetchInterval: 30000,
  });

  const statusItems = [
    {
      icon: Server,
      label: "Server Uptime",
      value: status?.uptime ?? "Loading...",
      color: "text-success bg-success/10"
    },
    {
      icon: Clock,
      label: "Avg Response",
      value: status?.avgResponse ?? "Loading...",
      color: "text-primary bg-primary/10"
    },
    {
      icon: Database,
      label: "Memory Usage",
      value: status?.memoryUsage ?? "Loading...",
      color: "text-warning bg-warning/10"
    },
    {
      icon: Activity,
      label: "API Calls/min",
      value: status?.apiCallsPerMin?.toString() ?? "Loading...",
      color: "text-secondary bg-secondary/10"
    }
  ];

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-900">System Status</h3>
            <p className="text-sm text-slate-600">Server health and performance metrics</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center animate-pulse">
                  <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-3"></div>
                  <div className="h-8 bg-slate-200 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-20 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">System Status</h3>
          <p className="text-sm text-slate-600">Server health and performance metrics</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statusItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${item.color}`}>
                    <IconComponent className="text-xl" size={24} />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono">{item.value}</div>
                  <div className="text-sm text-slate-600">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
