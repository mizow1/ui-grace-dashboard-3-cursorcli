import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { useDomain } from "@/contexts/DomainContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Globe, ExternalLink, Settings, BarChart3, Eye, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface SeoDomain {
  id: string;
  domain: string;
  status: "active" | "pending" | "inactive";
  registeredDate: string;
  description?: string;
  lastAnalyzed?: string;
  seoScore?: number;
  type: "primary" | "subdomain" | "competitor";
}

// Storage key for domains
const DOMAINS_STORAGE_KEY = "seo-domains";

// Helper functions for localStorage
const loadDomains = (): SeoDomain[] => {
  try {
    const stored = localStorage.getItem(DOMAINS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveDomains = (domains: SeoDomain[]) => {
  try {
    localStorage.setItem(DOMAINS_STORAGE_KEY, JSON.stringify(domains));
  } catch (error) {
    console.error("Failed to save domains:", error);
  }
};

const getStatusBadge = (status: "active" | "pending" | "inactive") => {
  switch (status) {
    case "active":
      return <Badge className="bg-success/20 text-success border-success/30">アクティブ</Badge>;
    case "pending":
      return <Badge className="bg-warning/20 text-warning border-warning/30">保留中</Badge>;
    case "inactive":
      return <Badge className="bg-destructive/20 text-destructive border-destructive/30">非アクティブ</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function Domains() {
  const [domains, setDomains] = useState<SeoDomain[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const navigate = useNavigate();
  const { refreshDomains } = useDomain();

  useEffect(() => {
    setDomains(loadDomains());
  }, []);

  const handleAddDomain = () => {
    if (!newDomain.trim()) return;

    const domain: SeoDomain = {
      id: Date.now().toString(),
      domain: newDomain.trim(),
      status: "active",
      registeredDate: new Date().toISOString().split('T')[0],
      description: newDescription.trim() || undefined,
      type: "primary"
    };

    const updatedDomains = [...domains, domain];
    setDomains(updatedDomains);
    saveDomains(updatedDomains);
    refreshDomains(); // ドメインコンテキストを更新
    
    setNewDomain("");
    setNewDescription("");
    setIsDialogOpen(false);
  };

  const handleAnalyzeDomain = (domainId: string) => {
    navigate(`/site-analytics?domain=${encodeURIComponent(domains.find(d => d.id === domainId)?.domain || '')}`);
  };

  const handleCompetitorAnalysis = (domainId: string) => {
    navigate(`/competitor-analysis?domain=${encodeURIComponent(domains.find(d => d.id === domainId)?.domain || '')}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-subtle">
      <AdminHeader title="SEOドメイン管理" />
      
      <main className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">SEO管理ドメイン</h2>
            <p className="text-muted-foreground">SEO改善を管理したいドメインを登録・管理できます</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                ドメインを追加
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>新しいドメインを追加</DialogTitle>
                <DialogDescription>
                  SEO改善を管理したいドメインを登録してください。
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="domain" className="text-right">
                    ドメイン
                  </Label>
                  <Input
                    id="domain"
                    placeholder="example.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    説明
                  </Label>
                  <Input
                    id="description"
                    placeholder="サイトの説明（任意）"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button type="button" onClick={handleAddDomain}>
                  追加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                登録ドメイン数
              </CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{domains.length}</div>
              <p className="text-xs text-muted-foreground">
                アクティブ: {domains.filter(d => d.status === "active").length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                分析済みサイト
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {domains.filter(d => d.lastAnalyzed).length}
              </div>
              <p className="text-xs text-muted-foreground">
                今月の分析回数
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                平均SEOスコア
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {domains.length > 0 && domains.some(d => d.seoScore) 
                  ? Math.round(domains.filter(d => d.seoScore).reduce((acc, d) => acc + (d.seoScore || 0), 0) / domains.filter(d => d.seoScore).length)
                  : "--"}
              </div>
              <p className="text-xs text-muted-foreground">
                分析済みドメインの平均
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                要改善ドメイン
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {domains.filter(d => d.seoScore && d.seoScore < 70).length}
              </div>
              <p className="text-xs text-muted-foreground">
                SEOスコア70未満
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-card-foreground">登録ドメイン一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {domains.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">ドメインが登録されていません</h3>
                <p className="text-muted-foreground mb-4">
                  最初のドメインを追加してSEO管理を開始しましょう
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  ドメインを追加
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="text-muted-foreground">ドメイン名</TableHead>
                    <TableHead className="text-muted-foreground">ステータス</TableHead>
                    <TableHead className="text-muted-foreground">説明</TableHead>
                    <TableHead className="text-muted-foreground">登録日</TableHead>
                    <TableHead className="text-muted-foreground">最終分析</TableHead>
                    <TableHead className="text-muted-foreground">SEOスコア</TableHead>
                    <TableHead className="text-muted-foreground">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains.map((domain) => (
                    <TableRow key={domain.id} className="border-border/50 hover:bg-muted/50">
                      <TableCell className="font-medium text-card-foreground">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-primary" />
                          <span>{domain.domain}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(domain.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {domain.description || "説明なし"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{domain.registeredDate}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {domain.lastAnalyzed ? new Date(domain.lastAnalyzed).toLocaleDateString('ja-JP') : "未分析"}
                      </TableCell>
                      <TableCell>
                        {domain.seoScore ? (
                          <Badge variant={domain.seoScore >= 80 ? "default" : domain.seoScore >= 60 ? "secondary" : "destructive"}>
                            {domain.seoScore}点
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">未測定</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleAnalyzeDomain(domain.id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleCompetitorAnalysis(domain.id)}>
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}