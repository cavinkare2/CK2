import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Smile,
  Frown,
  Meh,
  AlertCircle,
} from "lucide-react";
import type { Theme, Transcript, Project } from "@shared/schema";

function WordCloud({ data }: { data: Record<string, number> }) {
  const maxFreq = Math.max(...Object.values(data));
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-wrap gap-2 justify-center p-6">
      {entries.map(([word, freq]) => {
        const scale = 0.7 + (freq / maxFreq) * 1.3;
        const opacity = 0.4 + (freq / maxFreq) * 0.6;
        return (
          <span
            key={word}
            className="font-semibold text-primary transition-all hover:opacity-100 cursor-default"
            style={{
              fontSize: `${scale}rem`,
              opacity,
            }}
            title={`${word}: ${freq} mentions`}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

export default function AnalysisPage() {
  const [filterBrand, setFilterBrand] = useState<string>("all");

  const { data: allThemes } = useQuery<Theme[]>({ queryKey: ["/api/themes"] });
  const { data: allTranscripts } = useQuery<Transcript[]>({ queryKey: ["/api/transcripts"] });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });

  const brands = [...new Set((projects || []).map((p) => p.brand))];

  // Filter themes by brand
  const filteredThemes = filterBrand === "all"
    ? (allThemes || [])
    : (allThemes || []).filter((t) => t.brand === filterBrand);

  // Group themes by category
  const themesByCategory = filteredThemes.reduce((acc: Record<string, Theme[]>, t) => {
    acc[t.category] = acc[t.category] || [];
    acc[t.category].push(t);
    return acc;
  }, {});

  const categoryLabels: Record<string, { label: string; icon: any; color: string }> = {
    pain_point: { label: "Pain Points", icon: Frown, color: "text-red-500 bg-red-50 dark:bg-red-900/20" },
    unmet_need: { label: "Unmet Needs", icon: AlertCircle, color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
    delight: { label: "Moments of Delight", icon: Smile, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
    behavior: { label: "Consumer Behaviors", icon: TrendingUp, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
    perception: { label: "Brand Perceptions", icon: Brain, color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20" },
  };

  // Aggregate word frequency across all transcripts
  const aggregatedWordFreq = (allTranscripts || []).reduce((acc: Record<string, number>, t) => {
    if (t.wordFrequency) {
      const wf = JSON.parse(t.wordFrequency);
      Object.entries(wf).forEach(([word, count]) => {
        acc[word] = (acc[word] || 0) + (count as number);
      });
    }
    return acc;
  }, {});

  // Sentiment per brand
  const brandSentiments = brands.map((brand) => {
    const brandProjectIds = (projects || []).filter((p) => p.brand === brand).map((p) => p.id);
    const brandTranscripts = (allTranscripts || []).filter((t) => brandProjectIds.includes(t.projectId));
    const agg = brandTranscripts.reduce(
      (acc, t) => {
        if (t.sentiment) {
          const s = JSON.parse(t.sentiment);
          acc.positive += s.positive || 0;
          acc.negative += s.negative || 0;
          acc.neutral += s.neutral || 0;
          acc.mixed += s.mixed || 0;
          acc.count++;
        }
        return acc;
      },
      { positive: 0, negative: 0, neutral: 0, mixed: 0, count: 0 }
    );
    if (agg.count > 0) {
      agg.positive = Math.round(agg.positive / agg.count);
      agg.negative = Math.round(agg.negative / agg.count);
      agg.neutral = Math.round(agg.neutral / agg.count);
      agg.mixed = Math.round(agg.mixed / agg.count);
    }
    return { brand, ...agg };
  });

  return (
    <div className="space-y-6" data-testid="analysis-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered theme extraction, sentiment, and word frequency
          </p>
        </div>
        <Select value={filterBrand} onValueChange={setFilterBrand}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="themes">
        <TabsList>
          <TabsTrigger value="themes">
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Themes
          </TabsTrigger>
          <TabsTrigger value="sentiment">
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Sentiment
          </TabsTrigger>
          <TabsTrigger value="wordcloud">
            <Brain className="h-3.5 w-3.5 mr-1.5" /> Word Cloud
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Comparison
          </TabsTrigger>
        </TabsList>

        {/* Themes Tab */}
        <TabsContent value="themes" className="space-y-4 mt-4">
          {Object.entries(themesByCategory).map(([cat, catThemes]) => {
            const meta = categoryLabels[cat] || { label: cat, icon: Brain, color: "text-slate-500 bg-slate-50" };
            const Icon = meta.icon;
            return (
              <Card key={cat}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${meta.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {meta.label} ({catThemes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {catThemes.sort((a, b) => b.frequency - a.frequency).map((theme) => (
                      <div
                        key={theme.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/30 transition-colors"
                        data-testid={`analysis-theme-${theme.id}`}
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{theme.name}</p>
                          <div className="flex items-center gap-2">
                            {theme.brand && (
                              <Badge variant="outline" className="text-[10px]">{theme.brand}</Badge>
                            )}
                            {theme.region && (
                              <span className="text-[10px] text-muted-foreground">{theme.region}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold tabular-nums">{theme.frequency}</p>
                          <p className="text-[10px] text-muted-foreground">mentions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Sentiment Tab */}
        <TabsContent value="sentiment" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brandSentiments.map(({ brand, positive, negative, neutral, mixed, count }) => {
              if (count === 0) return null;
              const total = positive + negative + neutral + mixed;
              return (
                <Card key={brand}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">{brand}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                      <div className="bg-emerald-500" style={{ width: `${(positive / total) * 100}%` }} />
                      <div className="bg-red-400" style={{ width: `${(negative / total) * 100}%` }} />
                      <div className="bg-slate-400" style={{ width: `${(neutral / total) * 100}%` }} />
                      <div className="bg-amber-400" style={{ width: `${(mixed / total) * 100}%` }} />
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <div>
                        <p className="text-sm font-bold tabular-nums text-emerald-600">{positive}%</p>
                        <p className="text-[10px] text-muted-foreground">Pos</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold tabular-nums text-red-500">{negative}%</p>
                        <p className="text-[10px] text-muted-foreground">Neg</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold tabular-nums text-slate-500">{neutral}%</p>
                        <p className="text-[10px] text-muted-foreground">Neu</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold tabular-nums text-amber-500">{mixed}%</p>
                        <p className="text-[10px] text-muted-foreground">Mix</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Word Cloud Tab */}
        <TabsContent value="wordcloud" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Word Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(aggregatedWordFreq).length > 0 ? (
                <WordCloud data={aggregatedWordFreq} />
              ) : (
                <p className="text-center text-muted-foreground py-8">No word frequency data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cross-Study Comparison Tab */}
        <TabsContent value="comparison" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Brand Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-3 font-semibold">Brand</th>
                      <th className="text-center py-3 px-3 font-semibold">Studies</th>
                      <th className="text-center py-3 px-3 font-semibold">Top Theme</th>
                      <th className="text-center py-3 px-3 font-semibold">Positive %</th>
                      <th className="text-center py-3 px-3 font-semibold">Negative %</th>
                      <th className="text-center py-3 px-3 font-semibold">Respondents</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.map((brand) => {
                      const brandProjects = (projects || []).filter((p) => p.brand === brand);
                      const brandThemes = (allThemes || []).filter((t) => t.brand === brand);
                      const topTheme = brandThemes.sort((a, b) => b.frequency - a.frequency)[0];
                      const sent = brandSentiments.find((s) => s.brand === brand);
                      const totalRespondents = brandProjects.reduce((sum, p) => sum + (p.respondentCount || 0), 0);
                      return (
                        <tr key={brand} className="border-b hover:bg-accent/30">
                          <td className="py-3 px-3 font-medium">{brand}</td>
                          <td className="py-3 px-3 text-center tabular-nums">{brandProjects.length}</td>
                          <td className="py-3 px-3 text-center">
                            {topTheme ? (
                              <Badge variant="outline" className="text-xs">{topTheme.name}</Badge>
                            ) : "—"}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="text-emerald-600 font-semibold tabular-nums">{sent?.positive || 0}%</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="text-red-500 font-semibold tabular-nums">{sent?.negative || 0}%</span>
                          </td>
                          <td className="py-3 px-3 text-center tabular-nums">{totalRespondents}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
