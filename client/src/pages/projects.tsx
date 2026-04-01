import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Users,
  Calendar,
} from "lucide-react";
import type { Project } from "@shared/schema";

const BRANDS = ["Meera", "Chik", "KESH KING", "Spinz", "Nyle", "Garden", "Chinni's", "Ruchi"];
const CATEGORIES = ["Hair Care", "Personal Care", "Food", "Skin Care"];
const METHODOLOGIES = ["FGD", "IDI", "Ethnography", "Shop-along"];
const REGIONS = ["Tamil Nadu", "Karnataka", "Andhra Pradesh", "Maharashtra", "West Bengal", "Kerala", "Delhi NCR", "Gujarat"];

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  analysis: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  complete: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  archived: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default function ProjectsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setDialogOpen(false);
      toast({ title: "Project created" });
    },
  });

  const filtered = (projects || []).filter((p) => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.brand.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterBrand !== "all" && p.brand !== filterBrand) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      name: fd.get("name"),
      brand: fd.get("brand"),
      category: fd.get("category"),
      region: fd.get("region"),
      methodology: fd.get("methodology"),
      objective: fd.get("objective"),
      status: "draft",
      createdBy: 1,
      createdAt: new Date().toISOString(),
      respondentCount: 0,
    });
  };

  return (
    <div className="space-y-6" data-testid="projects-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage research studies across brands
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-create-project">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Research Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" name="name" required placeholder="e.g., Meera Consumer Immersion Q1 2026" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Brand</Label>
                  <Select name="brand" required>
                    <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                    <SelectContent>
                      {BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select name="category" required>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Region</Label>
                  <Select name="region" required>
                    <SelectTrigger><SelectValue placeholder="Region" /></SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Methodology</Label>
                  <Select name="methodology" required>
                    <SelectTrigger><SelectValue placeholder="Methodology" /></SelectTrigger>
                    <SelectContent>
                      {METHODOLOGIES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="objective">Objective</Label>
                <Textarea id="objective" name="objective" required placeholder="Describe the research objective..." rows={3} />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Project"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-projects"
          />
        </div>
        <Select value={filterBrand} onValueChange={setFilterBrand}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="analysis">Analysis</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-28 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No projects found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card
              key={p.id}
              className="hover:border-primary/30 transition-colors cursor-pointer"
              data-testid={`project-card-${p.id}`}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 mr-3">
                    <h3 className="text-sm font-semibold leading-tight">{p.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{p.objective}</p>
                  </div>
                  <Badge variant="secondary" className={`text-xs capitalize shrink-0 ${statusColors[p.status] || ""}`}>
                    {p.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{p.brand}</Badge>
                  <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
                  <Badge variant="outline" className="text-[10px]">{p.methodology}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {p.region}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {p.respondentCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
