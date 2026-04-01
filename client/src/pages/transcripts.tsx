import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Play,
  Languages,
  Quote,
  Clock,
} from "lucide-react";
import type { Transcript, Project, Recording } from "@shared/schema";

export default function TranscriptsPage() {
  const { data: transcripts, isLoading } = useQuery<Transcript[]>({
    queryKey: ["/api/transcripts"],
  });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: recordings } = useQuery<Recording[]>({ queryKey: ["/api/recordings"] });

  const getProject = (id: number) => (projects || []).find((p) => p.id === id);
  const getRecording = (id: number) => (recordings || []).find((r) => r.id === id);

  const selectedTranscript = transcripts?.[0];
  const selectedProject = selectedTranscript ? getProject(selectedTranscript.projectId) : null;
  const selectedRecording = selectedTranscript ? getRecording(selectedTranscript.recordingId) : null;

  return (
    <div className="space-y-6" data-testid="transcripts-page">
      <div>
        <h1 className="text-xl font-bold">Transcripts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and analyze transcribed recordings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Transcript list */}
        <Card className="lg:col-span-1 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              All Transcripts ({transcripts?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                (transcripts || []).map((t) => {
                  const proj = getProject(t.projectId);
                  const rec = getRecording(t.recordingId);
                  return (
                    <div
                      key={t.id}
                      className="p-3 border-b hover:bg-accent/50 transition-colors cursor-pointer"
                      data-testid={`transcript-item-${t.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium leading-tight">
                            {proj?.brand || "Unknown"} — {proj?.methodology || ""}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Languages className="h-3 w-3" /> {t.language}
                            </span>
                            {rec && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {Math.round((rec.duration || 0) / 60)}m
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {rec?.type || "file"}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transcript detail */}
        <Card className="lg:col-span-2">
          {selectedTranscript ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {selectedProject?.brand} — {selectedProject?.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedTranscript.language} · {selectedProject?.region} · {selectedProject?.methodology}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Play className="h-3.5 w-3.5 mr-1" /> Play Audio
                    </Button>
                    <Button variant="outline" size="sm">
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="transcript">
                  <TabsList className="mb-4">
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                    <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                    <TabsTrigger value="themes">Themes</TabsTrigger>
                    <TabsTrigger value="verbatims">Verbatims</TabsTrigger>
                  </TabsList>

                  <TabsContent value="transcript" className="space-y-4">
                    {/* Speaker segments */}
                    {selectedTranscript.speakers && (
                      <div className="flex gap-3 mb-4">
                        {JSON.parse(selectedTranscript.speakers).map((s: any, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {s.name}: {s.segments} segments
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      <div className="p-3 rounded-lg bg-accent/30 border-l-2 border-primary">
                        <p className="text-xs font-medium text-primary mb-1">Moderator (00:00)</p>
                        <p className="text-sm">Good morning. Thank you for joining us today. Could you start by telling me about your daily hair care routine?</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 border-l-2 border-muted-foreground/30">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Respondent 1 (00:45)</p>
                        <p className="text-sm">Sure. I usually wash my hair every alternate day. I use {selectedProject?.brand} shampoo — I've been using it for about two years now. The fragrance is what attracted me first, and the smoothness I get after washing is really good.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-accent/30 border-l-2 border-primary">
                        <p className="text-xs font-medium text-primary mb-1">Moderator (01:30)</p>
                        <p className="text-sm">What made you switch from your previous brand?</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 border-l-2 border-muted-foreground/30">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Respondent 1 (01:45)</p>
                        <p className="text-sm">My friend recommended it. She said it helped with her hair fall problem. I tried it and within a month I could see the difference. The price is a bit higher than what I was using before, but the results make it worth it.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-accent/30 border-l-2 border-primary">
                        <p className="text-xs font-medium text-primary mb-1">Moderator (02:30)</p>
                        <p className="text-sm">If you could change one thing about the product, what would it be?</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 border-l-2 border-muted-foreground/30">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Respondent 1 (02:50)</p>
                        <p className="text-sm">I wish the bottle was bigger. The 200ml finishes very quickly since I have long hair. A 400ml or 500ml option would be great. Also, if the price could be slightly lower, that would make it easier for daily use.</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="sentiment" className="space-y-4">
                    {selectedTranscript.sentiment && (() => {
                      const s = JSON.parse(selectedTranscript.sentiment);
                      const total = s.positive + s.negative + s.neutral + s.mixed;
                      return (
                        <div className="space-y-6">
                          <div className="grid grid-cols-4 gap-4">
                            {[
                              { label: "Positive", value: s.positive, color: "bg-emerald-500", textColor: "text-emerald-600" },
                              { label: "Negative", value: s.negative, color: "bg-red-400", textColor: "text-red-500" },
                              { label: "Neutral", value: s.neutral, color: "bg-slate-400", textColor: "text-slate-500" },
                              { label: "Mixed", value: s.mixed, color: "bg-amber-400", textColor: "text-amber-500" },
                            ].map((item) => (
                              <div key={item.label} className="text-center p-4 rounded-lg border">
                                <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-2`} />
                                <p className={`text-2xl font-bold tabular-nums ${item.textColor}`}>{item.value}%</p>
                                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex h-4 rounded-full overflow-hidden bg-muted">
                            <div className="bg-emerald-500 transition-all" style={{ width: `${(s.positive / total) * 100}%` }} />
                            <div className="bg-red-400 transition-all" style={{ width: `${(s.negative / total) * 100}%` }} />
                            <div className="bg-slate-400 transition-all" style={{ width: `${(s.neutral / total) * 100}%` }} />
                            <div className="bg-amber-400 transition-all" style={{ width: `${(s.mixed / total) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })()}
                  </TabsContent>

                  <TabsContent value="themes" className="space-y-4">
                    {selectedTranscript.themes && JSON.parse(selectedTranscript.themes).map((theme: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {i + 1}
                        </div>
                        <span className="text-sm font-medium">{theme}</span>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="verbatims" className="space-y-3">
                    {selectedTranscript.verbatims && JSON.parse(selectedTranscript.verbatims).map((v: string, i: number) => (
                      <div key={i} className="p-4 rounded-lg bg-accent/30 border-l-4 border-primary">
                        <Quote className="h-4 w-4 text-primary mb-2" />
                        <p className="text-sm italic">{v}</p>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="p-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Select a transcript to view details</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
