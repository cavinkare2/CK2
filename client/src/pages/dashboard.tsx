import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderOpen,
  Activity,
  FileText,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import type { Project, Theme, Transcript } from "@shared/schema";

function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaLabel,
}: {
  label: string;
  value: string | number;
  icon: any;
  delta?: number;
  deltaLabel?: string;
}) {
  return (
    <Card data-testid={`kpi-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
            {delta !== undefined && (
              <div className="flex items-center gap-1 text-xs">
                {delta > 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                ) : delta < 0 ? (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                ) : (
                  <Minus className="h-3 w-3 text-muted-foreground" />
                )}
                <span className={delta > 0 ? "text-emerald-600" : delta < 0 ? "text-red-500" : "text-muted-foreground"}>
                  {delta > 0 ? "+" : ""}{delta}%
                </span>
                {deltaLabel && <span className="text-muted-foreground">{deltaLabel}</span>}
              </div>
            )}
          </div>
          <div className="p-2.5 rounded-lg bg-accent">
            <Icon className="h-5 w-5 text-accent-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SentimentBar({ data }: { data: { positive: number; negative: number; neutral: number; mixed: number } }) {
  const total = data.positive + data.negative + data.neutral + data.mixed;
  if (total === 0) return null;
  return (
    <div className="flex h-2.5 rounded-full overflow-hidden bg-muted">
      <div className="bg-emerald-500" style={{ width: `${(data.positive / total) * 100}%` }} />
      <div className="bg-red-400" style={{ width: `${(data.negative / total) * 100}%` }} />
      <div className="bg-slate-400" style={{ width: `${(data.neutral / total) * 100}%` }} />
      <div className="bg-amber-400" style={{ width: `${(data.mixed / total) * 100}%` }} />
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalProjects: number;
    activeStudies: number;
    totalTranscripts: number;
    totalHours: number;
  }>({ queryKey: ["/api/stats"] });

  const { data: projects, isLoading: projLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: allThemes } = useQuery<Theme[]>({ queryKey: ["/api/themes"] });
  const { data: allTranscripts } = useQuery<Transcript[]>({ queryKey: ["/api/transcripts"] });

  // Aggregate sentiment from transcripts (average across all)
  const aggregatedSentiment = (() => {
    const transcriptsList = allTranscripts || [];
    if (transcriptsList.length === 0) return { positive: 0, negative: 0, neutral: 0, mixed: 0 };
    let count = 0;
    const totals = transcriptsList.reduce(
      (acc, t) => {
        if (t.sentiment) {
          const s = JSON.parse(t.sentiment);
          acc.positive += s.positive || 0;
          acc.negative += s.negative || 0;
          acc.neutral += s.neutral || 0;
          acc.mixed += s.mixed || 0;
          count++;
        }
        return acc;
      },
      { positive: 0, negative: 0, neutral: 0, mixed: 0 }
    );
    if (count === 0) return totals;
    return {
      positive: Math.round(totals.positive / count),
      negative: Math.round(totals.negative / count),
      neutral: Math.round(totals.neutral / count),
      mixed: Math.round(totals.mixed / count),
    };
  })();

  // Top themes by frequency
  const topThemes = (allThemes || []).slice(0, 8);

  // Brand distribution
  const brandCounts = (projects || []).reduce((acc: Record<string, number>, p) => {
    acc[p.brand] = (acc[p.brand] || 0) + 1;
    return acc;
  }, {});

  // Recent projects
  const recentProjects = (projects || []).slice(0, 5);

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    analysis: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    complete: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    archived: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of qualitative research activity
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))
        ) : (
          <>
            <KpiCard label="Total Projects" value={stats?.totalProjects ?? 0} icon={FolderOpen} delta={12} deltaLabel="vs last month" />
            <KpiCard label="Active Studies" value={stats?.activeStudies ?? 0} icon={Activity} delta={8} deltaLabel="vs last month" />
            <KpiCard label="Transcripts" value={stats?.totalTranscripts ?? 0} icon={FileText} delta={23} deltaLabel="vs last month" />
            <KpiCard label="Hours Recorded" value={stats?.totalHours ?? 0} icon={Clock} delta={15} deltaLabel="vs last month" />
          </>
        )}
      </div>

      {/* Middle row: Sentiment + Top Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sentiment Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Sentiment Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SentimentBar data={aggregatedSentiment} />
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { label: "Positive", value: aggregatedSentiment.positive, color: "text-emerald-600" },
                { label: "Negative", value: aggregatedSentiment.negative, color: "text-red-500" },
                { label: "Neutral", value: aggregatedSentiment.neutral, color: "text-slate-500" },
                { label: "Mixed", value: aggregatedSentiment.mixed, color: "text-amber-500" },
              ].map((s) => (
                <div key={s.label}>
                  <p className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}%</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Per-brand sentiment */}
            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium text-muted-foreground">By Brand</p>
              {(allTranscripts || []).reduce((acc: { brand: string; sentiment: any }[], t) => {
                const proj = (projects || []).find((p) => p.id === t.projectId);
                if (proj && t.sentiment && !acc.find((a) => a.brand === proj.brand)) {
                  acc.push({ brand: proj.brand, sentiment: JSON.parse(t.sentiment) });
                }
                return acc;
              }, []).slice(0, 5).map((item) => (
                <div key={item.brand} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{item.brand}</span>
                    <span className="text-muted-foreground">{item.sentiment.positive}% positive</span>
                  </div>
                  <SentimentBar data={item.sentiment} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Themes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Top Themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topThemes.map((theme) => {
                const maxFreq = Math.max(...topThemes.map((t) => t.frequency));
                const sentimentColor =
                  theme.sentiment === "positive" ? "bg-emerald-500" :
                  theme.sentiment === "negative" ? "bg-red-400" :
                  theme.sentiment === "mixed" ? "bg-amber-400" : "bg-slate-400";
                return (
                  <div key={theme.id} className="space-y-1" data-testid={`theme-${theme.id}`}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${sentimentColor}`} />
                        <span className="font-medium">{theme.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {theme.brand}
                        </Badge>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {theme.frequency} mentions
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${sentimentColor} transition-all`}
                        style={{ width: `${(theme.frequency / maxFreq) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Recent Projects + Brand Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Projects */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {projLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))
              ) : (
                recentProjects.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    data-testid={`project-row-${p.id}`}
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{p.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{p.brand}</span>
                        <span>·</span>
                        <span>{p.region}</span>
                        <span>·</span>
                        <span>{p.methodology}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {p.respondentCount} respondents
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-xs capitalize ${statusColors[p.status] || ""}`}
                      >
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Brand Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">By Brand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(brandCounts).map(([brand, count]) => {
                const maxCount = Math.max(...Object.values(brandCounts));
                return (
                  <div key={brand} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{brand}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">{count} {count === 1 ? 'project' : 'projects'}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
