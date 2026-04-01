import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Mic,
  Video,
  FileText,
  Upload,
  Clock,
  MapPin,
} from "lucide-react";
import type { Recording, Project } from "@shared/schema";

const typeIcons: Record<string, any> = {
  audio: Mic,
  video: Video,
  text_note: FileText,
  file_upload: Upload,
};

const typeColors: Record<string, string> = {
  audio: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  video: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  text_note: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  file_upload: "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const statusColors: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  transcribing: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  transcribed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  analyzed: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function RecordingsPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: recordings, isLoading } = useQuery<Recording[]>({ queryKey: ["/api/recordings"] });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });

  const getProject = (id: number) => (projects || []).find((p) => p.id === id);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/recordings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recordings"] });
      setDialogOpen(false);
      toast({ title: "Recording added" });
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      projectId: parseInt(fd.get("projectId") as string),
      type: fd.get("type"),
      fileName: fd.get("fileName") || null,
      duration: parseInt(fd.get("duration") as string) * 60 || 0,
      location: fd.get("location") || null,
      respondentProfile: JSON.stringify({
        sec: fd.get("sec"),
        age: parseInt(fd.get("age") as string) || 25,
        gender: fd.get("gender"),
      }),
      status: "pending",
      createdAt: new Date().toISOString(),
      createdBy: 1,
    });
  };

  // Group by type
  const byType = (recordings || []).reduce((acc: Record<string, number>, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6" data-testid="recordings-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Recordings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Audio, video, and text captures from field research
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-add-recording">
              <Plus className="h-4 w-4 mr-2" />
              Add Recording
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Recording</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Project</Label>
                <Select name="projectId" required>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {(projects || []).map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select name="type" required>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="text_note">Text Note</SelectItem>
                      <SelectItem value="file_upload">File Upload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input id="duration" name="duration" type="number" placeholder="30" />
                </div>
              </div>
              <div>
                <Label htmlFor="fileName">File Name</Label>
                <Input id="fileName" name="fileName" placeholder="recording_01.mp3" />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="Chennai, Tamil Nadu" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>SEC</Label>
                  <Select name="sec">
                    <SelectTrigger><SelectValue placeholder="SEC" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A1">A1</SelectItem>
                      <SelectItem value="A2">A2</SelectItem>
                      <SelectItem value="B1">B1</SelectItem>
                      <SelectItem value="B2">B2</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" name="age" type="number" placeholder="25" />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select name="gender">
                    <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add Recording"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Type summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(typeIcons).map(([type, Icon]) => (
          <Card key={type}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${typeColors[type]}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums">{byType[type] || 0}</p>
                <p className="text-xs text-muted-foreground capitalize">{type.replace("_", " ")}s</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recordings list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (recordings || []).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Mic className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No recordings yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-3 px-4 font-semibold">Recording</th>
                  <th className="text-left py-3 px-4 font-semibold">Project</th>
                  <th className="text-center py-3 px-4 font-semibold">Type</th>
                  <th className="text-center py-3 px-4 font-semibold">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold">Location</th>
                  <th className="text-center py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {(recordings || []).map((rec) => {
                  const proj = getProject(rec.projectId);
                  const Icon = typeIcons[rec.type] || FileText;
                  const profile = rec.respondentProfile ? JSON.parse(rec.respondentProfile) : null;
                  return (
                    <tr key={rec.id} className="border-b hover:bg-accent/30 transition-colors" data-testid={`recording-row-${rec.id}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${typeColors[rec.type]}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="font-medium">{rec.fileName || "Text note"}</p>
                            {profile && (
                              <p className="text-[10px] text-muted-foreground">
                                {profile.gender}, {profile.age}y, SEC {profile.sec}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {proj?.brand || "—"} — {proj?.methodology || ""}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] capitalize">{rec.type.replace("_", " ")}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {rec.duration ? `${Math.round(rec.duration / 60)}m` : "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {rec.location || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary" className={`text-xs capitalize ${statusColors[rec.status] || ""}`}>
                          {rec.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
