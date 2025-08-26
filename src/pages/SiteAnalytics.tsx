import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminHeader } from "@/components/AdminHeader";
import { useDomain } from "@/contexts/DomainContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Globe, 
  Clock, 
  Users, 
  Eye, 
  MousePointer, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  Settings
} from "lucide-react";
import { ApiKeyManager, getStoredApiKey } from "@/components/ApiKeyManager";
import { analyzeSiteWithGemini, type SeoAnalysisResult, type CrawlPage } from "@/lib/gemini";
import { SeoDomain } from "./Domains";

interface AnalysisResult extends SeoAnalysisResult {
  url: string;
  title: string;
  description: string;
  loadingTime: number;
  traffic: {
    dailyVisitors: number;
    pageViews: number;
    bounceRate: number;
    avgSessionDuration: string;
  };
  pages: CrawlPage[];
}

// Storage helper for domains
const loadDomains = (): SeoDomain[] => {
  try {
    const stored = localStorage.getItem("seo-domains");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveDomains = (domains: SeoDomain[]) => {
  try {
    localStorage.setItem("seo-domains", JSON.stringify(domains));
  } catch (error) {
    console.error("Failed to save domains:", error);
  }
};

export default function SiteAnalytics() {
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [domains, setDomains] = useState<SeoDomain[]>([]);
  const { selectedDomain } = useDomain();

  useEffect(() => {
    // Load domains
    setDomains(loadDomains());
    
    // Check for domain parameter from URL or selected domain
    const domainParam = searchParams.get("domain");
    if (domainParam) {
      setUrl(domainParam.startsWith("http") ? domainParam : `https://${domainParam}`);
    } else if (selectedDomain) {
      setUrl(selectedDomain.domain.startsWith("http") ? selectedDomain.domain : `https://${selectedDomain.domain}`);
    }

    // Load stored API key
    const storedApiKey = getStoredApiKey();
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, [searchParams, selectedDomain]);

  const handleAnalyze = async () => {
    if (!url || !apiKey) {
      setError("URLとAPIキーが必要です");
      return;
    }
    
    setIsAnalyzing(true);
    setProgress(0);
    setResult(null);
    setError(null);

    try {
      // Step 1: Crawl the website
      setProgress(20);
      const crawlResponse = await fetch(`/api/crawl?url=${encodeURIComponent(url)}&maxPages=20&maxDepth=2`);
      
      if (!crawlResponse.ok) {
        throw new Error(`Crawling failed: ${crawlResponse.statusText}`);
      }

      const crawlData = await crawlResponse.json();
      const pages: CrawlPage[] = crawlData.pages || [];
      
      setProgress(50);

      // Step 2: Analyze with Gemini AI
      const domain = new URL(url).hostname;
      const analysisResult = await analyzeSiteWithGemini(domain, pages, apiKey);
      
      setProgress(80);

      // Step 3: Create final result with mock traffic data
      const finalResult: AnalysisResult = {
        url,
        title: pages[0]?.title || "サイト分析結果",
        description: pages[0]?.description || "AI分析による詳細レポート",
        loadingTime: Math.random() * 3 + 1, // Mock loading time
        ...analysisResult,
        traffic: {
          dailyVisitors: Math.floor(Math.random() * 5000) + 500,
          pageViews: Math.floor(Math.random() * 15000) + 1000,
          bounceRate: Math.floor(Math.random() * 40) + 30,
          avgSessionDuration: `${Math.floor(Math.random() * 3) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
        },
        pages
      };

      setResult(finalResult);
      setProgress(100);

      // Update domain with analysis results
      const updatedDomains = domains.map(d => {
        if (d.domain === domain || url.includes(d.domain)) {
          return {
            ...d,
            lastAnalyzed: new Date().toISOString(),
            seoScore: analysisResult.seoScore
          };
        }
        return d;
      });
      setDomains(updatedDomains);
      saveDomains(updatedDomains);

    } catch (error) {
      console.error("Analysis failed:", error);
      setError(error instanceof Error ? error.message : "分析中にエラーが発生しました");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="サイト分析" />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* API Key Manager */}
        <ApiKeyManager onApiKeyChange={setApiKey} />
        
        {/* Error Alert */}
        {error && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-destructive">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* URL入力セクション */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              ウェブサイト分析・改善提案
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleAnalyze}
                disabled={!url || isAnalyzing || !apiKey}
                className="px-6"
              >
                <Search className="h-4 w-4 mr-2" />
                {isAnalyzing ? "分析中..." : "分析開始"}
              </Button>
            </div>
            
            {isAnalyzing && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">分析進行中...</span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* 分析結果レポート */}
        {result && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* レポートヘッダー */}
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                分析レポート
              </h2>
              <p className="text-muted-foreground">ウェブサイトの詳細な分析結果をご確認ください</p>
            </div>

            {/* 基本情報カード */}
            <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card/95 via-card to-card/90 backdrop-blur-sm shadow-2xl">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1">
                <CardHeader className="bg-card/50 backdrop-blur-sm">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    サイト基本情報
                  </CardTitle>
                </CardHeader>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="group">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">URL</p>
                      <p className="text-lg font-medium text-primary group-hover:text-primary-glow transition-colors">
                        {result.url}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">サイトタイトル</p>
                      <p className="text-lg font-semibold text-foreground">{result.title}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">説明</p>
                      <p className="text-base text-muted-foreground leading-relaxed">{result.description}</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-sm text-muted-foreground">読み込み時間</span>
                        <span className="ml-2 font-bold text-lg text-foreground">{result.loadingTime}秒</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* パフォーマンススコア */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[
                { 
                  title: "SEOスコア", 
                  score: result.seoScore, 
                  icon: BarChart3, 
                  description: "検索エンジン最適化" 
                },
                { 
                  title: "パフォーマンス", 
                  score: result.performanceScore, 
                  icon: Activity, 
                  description: "サイト表示速度" 
                },
                { 
                  title: "アクセシビリティ", 
                  score: result.accessibilityScore, 
                  icon: Users, 
                  description: "利用しやすさ" 
                }
              ].map((item, index) => (
                <Card key={index} className="group relative overflow-hidden border-2 border-primary/10 bg-gradient-to-br from-card via-card/95 to-card/80 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="text-center pb-4 relative z-10">
                    <div className="mx-auto mb-3 p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardHeader>
                  <CardContent className="text-center space-y-6 relative z-10">
                    {/* 円形プログレスバー */}
                    <div className="relative w-32 h-32 mx-auto">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-muted/30 stroke-current"
                          fill="none"
                          strokeWidth="2.5"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={`${getProgressColor(item.score)} stroke-current transition-all duration-1000 ease-out`}
                          fill="none"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray={`${item.score}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          style={{
                            strokeDashoffset: 0,
                            filter: 'drop-shadow(0 0 6px currentColor)'
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-black ${getScoreColor(item.score)}`}>
                          {item.score}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">/ 100</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Badge 
                        variant={getScoreBadgeVariant(item.score)} 
                        className="px-4 py-1.5 text-sm font-medium"
                      >
                        {item.score >= 80 ? "優秀" : item.score >= 60 ? "良好" : "要改善"}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {item.score >= 80 ? "非常に良い状態です" : 
                         item.score >= 60 ? "改善の余地があります" : "大幅な改善が必要です"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* トラフィック統計 */}
            <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card/95 via-card to-card/90 backdrop-blur-sm shadow-2xl">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1">
                <CardHeader className="bg-card/50 backdrop-blur-sm">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                    トラフィック統計
                  </CardTitle>
                </CardHeader>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { 
                      label: "日間訪問者", 
                      value: result.traffic.dailyVisitors.toLocaleString(), 
                      icon: Users, 
                      color: "text-blue-400",
                      bgColor: "bg-blue-500/10",
                      borderColor: "border-blue-500/20"
                    },
                    { 
                      label: "ページビュー", 
                      value: result.traffic.pageViews.toLocaleString(), 
                      icon: Eye, 
                      color: "text-green-400",
                      bgColor: "bg-green-500/10",
                      borderColor: "border-green-500/20"
                    },
                    { 
                      label: "直帰率", 
                      value: `${result.traffic.bounceRate}%`, 
                      icon: TrendingDown, 
                      color: "text-orange-400",
                      bgColor: "bg-orange-500/10",
                      borderColor: "border-orange-500/20"
                    },
                    { 
                      label: "平均滞在時間", 
                      value: result.traffic.avgSessionDuration, 
                      icon: Clock, 
                      color: "text-purple-400",
                      bgColor: "bg-purple-500/10",
                      borderColor: "border-purple-500/20"
                    }
                  ].map((stat, index) => (
                    <div key={index} className={`group relative p-6 rounded-xl border ${stat.borderColor} ${stat.bgColor} hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg ${stat.bgColor} border ${stat.borderColor}`}>
                          <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* キーワードと改善提案 */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* キーワード */}
              <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card/95 via-card to-card/90 backdrop-blur-sm shadow-xl">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1">
                  <CardHeader className="bg-card/50 backdrop-blur-sm">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <PieChart className="h-5 w-5 text-primary" />
                      </div>
                      主要キーワード
                    </CardTitle>
                  </CardHeader>
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-3">
                    {result.keywords.map((keyword, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="px-4 py-2 text-sm bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 transition-all duration-200 hover:scale-105 font-medium"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* クロール結果 */}
              <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card/95 via-card to-card/90 backdrop-blur-sm shadow-xl">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1">
                  <CardHeader className="bg-card/50 backdrop-blur-sm">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      クロール済みページ ({result.pages.length}ページ)
                    </CardTitle>
                  </CardHeader>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {result.pages.slice(0, 10).map((page, index) => (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg border border-border/30 hover:border-primary/30 transition-colors">
                        <div className="font-medium text-sm text-foreground mb-1">
                          {page.title || "タイトルなし"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {page.url}
                        </div>
                      </div>
                    ))}
                    {result.pages.length > 10 && (
                      <div className="text-center text-sm text-muted-foreground">
                        他 {result.pages.length - 10} ページ...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 改善サマリー */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">
                    コンテンツ改善
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">
                    {result.contentSuggestions?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    高優先度: {result.contentSuggestions?.filter(s => s.priority === "high").length || 0}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">
                    技術的改善
                  </CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">
                    {result.technicalSuggestions?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    高優先度: {result.technicalSuggestions?.filter(s => s.priority === "high").length || 0}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">
                    実装進捗
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">0%</div>
                  <p className="text-xs text-muted-foreground">
                    未実装項目
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">
                    期待効果
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">+40%</div>
                  <p className="text-xs text-muted-foreground">
                    検索流入向上
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* コンテンツ改善提案 */}
            {result.contentSuggestions && result.contentSuggestions.length > 0 && (
              <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card/95 via-card to-card/90 backdrop-blur-sm shadow-xl">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1">
                  <CardHeader className="bg-card/50 backdrop-blur-sm">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      コンテンツ改善提案
                    </CardTitle>
                  </CardHeader>
                </div>
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {result.contentSuggestions.map((suggestion, index) => (
                      <div key={suggestion.id} className="group p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/30 hover:border-primary/30 transition-all duration-200 hover:shadow-md">
                        <div className="flex items-start gap-3 mb-3">
                          <Badge variant={suggestion.priority === "high" ? "destructive" : suggestion.priority === "medium" ? "secondary" : "outline"}>
                            {suggestion.priority === "high" ? "高" : suggestion.priority === "medium" ? "中" : "低"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{suggestion.category}</span>
                        </div>
                        <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {suggestion.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-primary font-medium">
                            期待効果: {suggestion.estimatedImpact}
                          </p>
                          <Button size="sm" variant="outline">
                            実装開始
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 技術的改善提案 */}
            {result.technicalSuggestions && result.technicalSuggestions.length > 0 && (
              <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card/95 via-card to-card/90 backdrop-blur-sm shadow-xl">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1">
                  <CardHeader className="bg-card/50 backdrop-blur-sm">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Settings className="h-5 w-5 text-primary" />
                      </div>
                      技術的改善提案
                    </CardTitle>
                  </CardHeader>
                </div>
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {result.technicalSuggestions.map((suggestion, index) => (
                      <div key={suggestion.id} className="group p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/30 hover:border-primary/30 transition-all duration-200 hover:shadow-md">
                        <div className="flex items-start gap-3 mb-3">
                          <Badge variant={suggestion.priority === "high" ? "destructive" : suggestion.priority === "medium" ? "secondary" : "outline"}>
                            {suggestion.priority === "high" ? "高" : suggestion.priority === "medium" ? "中" : "低"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{suggestion.category}</span>
                        </div>
                        <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {suggestion.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {suggestion.description}
                        </p>
                        <div className="bg-muted/20 p-3 rounded-lg mb-3">
                          <p className="text-xs text-success font-medium">
                            実装方法: {suggestion.implementation}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <Button size="sm" variant="outline">
                            実装ガイド
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 実装タイムライン */}
            <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card/95 via-card to-card/90 backdrop-blur-sm shadow-xl">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1">
                <CardHeader className="bg-card/50 backdrop-blur-sm">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    実装タイムライン
                  </CardTitle>
                </CardHeader>
              </div>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-3">
                  {/* 即座に対応 */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-success flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      即座に対応（1週間以内）
                    </h4>
                    <div className="space-y-2">
                      {["メタディスクリプション最適化", "alt属性の追加", "タイトルタグ改善"].map((item, index) => (
                        <div key={index} className="p-2 rounded bg-success/10 border border-success/20">
                          <p className="text-xs text-success">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 短期対応 */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-warning flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      短期対応（1ヶ月以内）
                    </h4>
                    <div className="space-y-2">
                      {["画像最適化", "モバイル最適化", "ページ速度改善"].map((item, index) => (
                        <div key={index} className="p-2 rounded bg-warning/10 border border-warning/20">
                          <p className="text-xs text-warning">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 長期対応 */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary flex items-center gap-2">
                      <MousePointer className="w-4 h-4" />
                      長期対応（3ヶ月以内）
                    </h4>
                    <div className="space-y-2">
                      {["ブログセクション追加", "構造化データ実装", "コンテンツ戦略策定"].map((item, index) => (
                        <div key={index} className="p-2 rounded bg-primary/10 border border-primary/20">
                          <p className="text-xs text-primary">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}