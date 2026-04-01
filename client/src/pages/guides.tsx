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
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  ListOrdered,
} from "lucide-react";
import type { DiscussionGuide } from "@shared/schema";

const METHODOLOGIES = ["FGD", "IDI", "Ethnography", "Shop-along"];

export default function GuidesPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);

  const { data: guides, isLoading } = useQuery<DiscussionGuide[]>({
    queryKey: ["/api/discussion-guides"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/discussion-guides", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussion-guides"] });
      setDialogOpen(false);
      toast({ title: "Discussion guide created" });
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      name: fd.get("name"),
      methodology: fd.get("methodology"),
      version: "1.0",
      sections: JSON.stringify([
        { title: "Introduction & Warm-up", questions: ["Introduce yourself and your background"] },
        { title: "Usage & Habits", questions: ["Walk me through your typical usage"] },
        { title: "Brand Perception", questions: ["What comes to mind about this brand?"] },
        { title: "Pain Points & Needs", questions: ["What frustrates you?"] },
        { title: "Wrap-up", questions: ["Any final thoughts?"] },
      ]),
      createdAt: new Date().toISOString(),
    });
  };

  const methodologyColors: Record<string, string> = {
    FGD: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    IDI: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Ethnography: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "Shop-along": "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  };

  return (
    <div className="space-y-6" data-testid="guides-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Discussion Guides</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Templates and guides for research sessions
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-create-guide">
              <Plus className="h-4 w-4 mr-2" />
              New Guide
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Discussion Guide</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="gname">Guide Name</Label>
                <Input id="gname" name="name" required placeholder="e.g., Meera FGD Guide v1" />
              </div>
              <div>
                <Label>Methodology</Label>
                <Select name="methodology" required>
                  <SelectTrigger><SelectValue placeholder="Select methodology" /></SelectTrigger>
                  <SelectContent>
                    {METHODOLOGIES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Guide"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Template Library */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {["FGD Guide", "IDI Guide", "Ethnography Checklist", "Shop-along Protocol"].map((tmpl, i) => (
          <Card key={tmpl} className="cursor-pointer hover:border-primary/30 transition-colors">
            <CardContent className="p-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-lg bg-accent mx-auto flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-accent-foreground" />
              </div>
              <p className="text-sm font-medium">{tmpl}</p>
              <p className="text-[10px] text-muted-foreground">Template</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Guides List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (guides || []).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No discussion guides yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(guides || []).map((guide) => {
            const sections = guide.sections ? JSON.parse(guide.sections) : [];
            const isExpanded = expandedGuide === guide.id;
            return (
              <Card key={guide.id} data-testid={`guide-card-${guide.id}`}>
                <CardContent className="p-0">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/30 transition-colors"
                    onClick={() => setExpandedGuide(isExpanded ? null : guide.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{guide.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>v{guide.version}</span>
                          <span>·</span>
                          <span>{sections.length} sections</span>
                          <span>·</span>
                          <span>
                            {new Date(guide.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`text-xs ${methodologyColors[guide.methodology] || ""}`}>
                        {guide.methodology}
                      </Badge>
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t">
                      <div className="space-y-4 pt-4">
                        {sections.map((section: any, si: number) => (
                          <div key={si} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <ListOrdered className="h-3.5 w-3.5 text-primary" />
                              <p className="text-sm font-semibold">{section.title}</p>
                            </div>
                            <div className="ml-6 space-y-1.5">
                              {section.questions.map((q: string, qi: number) => (
                                <div key={qi} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <span className="text-xs font-medium text-primary mt-0.5">{si + 1}.{qi + 1}</span>
                                  <span>{q}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
