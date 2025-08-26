
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
  BarChart3,
  PieChart,
  Activity,
  TrendingUp,
  AlertTriangle,
  Settings,
  Users
} from "lucide-react";
import { ApiKeyManager, getStoredApiKey } from "@/components/ApiKeyManager";
import { analyzeCompetitorWithGemini, type SeoAnalysisResult, type CrawlPage, type CompetitorInsight } from "@/lib/gemini";
import { SeoDomain } from "./Domains";

interface CompetitorAnalysisResult extends SeoAnalysisResult {
  url: string;
  title: string;
  description: string;
  loadingTime: number;
  pages: CrawlPage[];
  comparisonInsights?: CompetitorInsight[];
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

export default function CompetitorAnalysis() {
  const [searchParams] = useSearchParams();
  const [targetDomain, setTargetDomain] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CompetitorAnalysisResult | null>(null);
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
      setTargetDomain(domainParam);
    } else if (selectedDomain) {
      setTargetDomain(selectedDomain.domain);
    }

    // Load stored API key
    const storedApiKey = getStoredApiKey();
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, [searchParams, selectedDomain]);

  const handleAnalyze = async () => {
    if (!targetDomain || !competitorUrl || !apiKey) {
      setError("対象ドメイン、競合URL、APIキーがすべて必要です");
      return;
    }
    
    setIsAnalyzing(true);
    setProgress(0);
    setResult(null);
    setError(null);

    try {
      // Step 1: Crawl target domain
      setProgress(10);
      const targetUrl = targetDomain.startsWith("http") ? targetDomain : `https://${targetDomain}`;
      const targetCrawlResponse = await fetch(`/api/crawl?url=${encodeURIComponent(targetUrl)}&maxPages=20&maxDepth=2`);
      
      if (!targetCrawlResponse.ok) {
        throw new Error(`Target crawling failed: ${targetCrawlResponse.statusText}`);
      }

      const targetCrawlData = await targetCrawlResponse.json();
      const targetPages: CrawlPage[] = targetCrawlData.pages || [];
      
      setProgress(30);

      // Step 2: Crawl competitor domain
      const competitorCrawlResponse = await fetch(`/api/crawl?url=${encodeURIComponent(competitorUrl)}&maxPages=20&maxDepth=2`);
      
      if (!competitorCrawlResponse.ok) {
        throw new Error(`Competitor crawling failed: ${competitorCrawlResponse.statusText}`);
      }

      const competitorCrawlData = await competitorCrawlResponse.json();
      const competitorPages: CrawlPage[] = competitorCrawlData.pages || [];
      
      setProgress(60);

      // Step 3: Analyze with Gemini AI
      const targetDomainHost = new URL(targetUrl).hostname;
      const competitorDomainHost = new URL(competitorUrl).hostname;
      
      const analysisResult = await analyzeCompetitorWithGemini(
        targetDomainHost, 
        competitorDomainHost, 
        targetPages, 
        competitorPages, 
        apiKey
      );
      
      setProgress(80);

      // Step 4: Create final result
      const finalResult: CompetitorAnalysisResult = {
        url: competitorUrl,
        title: competitorPages[0]?.title || "競合サイト分析結果",
        description: competitorPages[0]?.description || "AI分析による競合比較レポート",
        loadingTime: Math.random() * 3 + 1, // Mock loading time
        ...analysisResult,
        pages: competitorPages
      };

      setResult(finalResult);
      setProgress(100);

    } catch (error) {
      console.error("Competitor analysis failed:", error);
      setError(error instanceof Error ? error.message : "競合分析中にエラーが発生しました");
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
      <AdminHeader title="競合サイト分析" />
      
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
              競合サイト分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    対象ドメイン（あなたのサイト）
                  </label>
                  <Input
                    type="text"
                    placeholder="example.com"
                    value={targetDomain}
                    onChange={(e) => setTargetDomain(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    競合サイトURL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://competitor-example.com"
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleAnalyze}
                disabled={!targetDomain || !competitorUrl || isAnalyzing || !apiKey}
                className="px-6"
              >
                <Search className="h-4 w-4 mr-2" />
                {isAnalyzing ? "分析中..." : "競合分析開始"}
              </Button>
            </div>
            
            {isAnalyzing && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">競合分析進行中...</span>
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
                競合分析レポート
              </h2>
              <p className="text-muted-foreground">競合サイトの詳細な分析結果をご確認ください</p>
            </div>

            {/* 基本情報カード */}
            <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card/95 via-card to-card/90 backdrop-blur-sm shadow-2xl">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1">
                <CardHeader className="bg-card/50 backdrop-blur-sm">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    競合サイト基本情報
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
                  icon: Globe, 
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

            {/* キーワードとページ情報 */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* キーワード */}
              <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card/95 via-card to-card/90 backdrop-blur-sm shadow-xl">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1">
                  <CardHeader className="bg-card/50 backdrop-blur-sm">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <PieChart className="h-5 w-5 text-primary" />
                      </div>
                      競合キーワード
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

              {/* 競合ページ情報 */}
              <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card/95 via-card to-card/90 backdrop-blur-sm shadow-xl">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1">
                  <CardHeader className="bg-card/50 backdrop-blur-sm">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      競合ページ構造 ({result.pages.length}ページ)
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

            {/* 競合比較インサイト */}
            {result.comparisonInsights && result.comparisonInsights.length > 0 && (
              <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card/95 via-card to-card/90 backdrop-blur-sm shadow-xl">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1">
                  <CardHeader className="bg-card/50 backdrop-blur-sm">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      競合比較分析
                    </CardTitle>
                  </CardHeader>
                </div>
                <CardContent className="p-6">
                  {result.comparisonInsights.map((insight, index) => (
                    <div key={index} className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{insight.domain}</h3>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* 強み */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-success flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            競合の強み
                          </h4>
                          <div className="space-y-2">
                            {insight.strengths.map((strength, i) => (
                              <div key={i} className="p-3 bg-success/10 rounded-lg border border-success/20">
                                <p className="text-sm text-success">{strength}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 弱み */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            競合の弱み
                          </h4>
                          <div className="space-y-2">
                            {insight.weaknesses.map((weakness, i) => (
                              <div key={i} className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                                <p className="text-sm text-destructive">{weakness}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 機会 */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            勝機
                          </h4>
                          <div className="space-y-2">
                            {insight.opportunities.map((opportunity, i) => (
                              <div key={i} className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                <p className="text-sm text-primary">{opportunity}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* コンテンツ改善提案 */}
            {result.contentSuggestions && result.contentSuggestions.length > 0 && (
              <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card/95 via-card to-card/90 backdrop-blur-sm shadow-xl">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1">
                  <CardHeader className="bg-card/50 backdrop-blur-sm">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      競合対策 - コンテンツ改善
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
                        <p className="text-xs text-primary font-medium">
                          期待効果: {suggestion.estimatedImpact}
                        </p>
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
                      競合対策 - 技術的改善
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
                        <p className="text-xs text-success font-medium">
                          実装方法: {suggestion.implementation}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
