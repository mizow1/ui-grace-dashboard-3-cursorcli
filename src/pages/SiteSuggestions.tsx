import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Settings, 
  Search,
  Target,
  Users,
  Gauge,
  Edit,
  Code
} from "lucide-react";
import { ApiKeyManager, getStoredApiKey } from "@/components/ApiKeyManager";
import { type ContentSuggestion, type TechnicalSuggestion } from "@/lib/gemini";
import { SeoDomain } from "./Domains";

// Storage helper for domains
const loadDomains = (): SeoDomain[] => {
  try {
    const stored = localStorage.getItem("seo-domains");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Mock suggestions for demonstration
const mockContentSuggestions: ContentSuggestion[] = [
  {
    id: "content-1",
    title: "ブログセクションの追加",
    description: "定期的なブログ投稿でユーザーエンゲージメントを向上し、検索エンジンでの可視性を高めます。",
    priority: "high",
    category: "コンテンツ拡充",
    estimatedImpact: "検索流入+30%、滞在時間+25%"
  },
  {
    id: "content-2",
    title: "FAQページの充実",
    description: "よくある質問をまとめてユーザビリティを向上し、サポート負荷を軽減します。",
    priority: "medium",
    category: "ユーザビリティ",
    estimatedImpact: "お問い合わせ数-20%、ユーザー満足度向上"
  },
  {
    id: "content-3",
    title: "事例・実績ページの作成",
    description: "お客様の声や実績を紹介してコンバージョン率を向上させます。",
    priority: "medium",
    category: "信頼性向上",
    estimatedImpact: "コンバージョン率+15%"
  }
];

const mockTechnicalSuggestions: TechnicalSuggestion[] = [
  {
    id: "tech-1",
    title: "メタディスクリプションの最適化",
    description: "検索結果での表示を改善し、クリック率を向上させるためのメタタグ最適化。",
    priority: "high",
    category: "SEO最適化",
    implementation: "各ページに150-160文字の魅力的なメタディスクリプションを設定"
  },
  {
    id: "tech-2",
    title: "画像最適化",
    description: "画像のサイズとフォーマットを最適化してページ読み込み速度を向上。",
    priority: "high",
    category: "パフォーマンス",
    implementation: "WebP形式への変換、適切なサイズ設定、lazy loading実装"
  },
  {
    id: "tech-3",
    title: "構造化データの実装",
    description: "検索エンジンがサイト内容を理解しやすくするための構造化データ追加。",
    priority: "medium",
    category: "SEO最適化",
    implementation: "JSON-LDを使用してorganization、breadcrumb、articleスキーマを実装"
  },
  {
    id: "tech-4",
    title: "モバイル最適化",
    description: "モバイルデバイスでのユーザーエクスペリエンス向上。",
    priority: "high",
    category: "レスポンシブ",
    implementation: "タッチターゲットの最適化、フォントサイズ調整、ナビゲーション改善"
  }
];

export default function SiteSuggestions() {
  const [domains, setDomains] = useState<SeoDomain[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [contentSuggestions, setContentSuggestions] = useState<ContentSuggestion[]>(mockContentSuggestions);
  const [technicalSuggestions, setTechnicalSuggestions] = useState<TechnicalSuggestion[]>(mockTechnicalSuggestions);

  useEffect(() => {
    setDomains(loadDomains());
    const storedApiKey = getStoredApiKey();
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const getPriorityBadge = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">高優先度</Badge>;
      case "medium":
        return <Badge variant="secondary">中優先度</Badge>;
      case "low":
        return <Badge variant="outline">低優先度</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="サイト改善提案" />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* API Key Manager */}
        <ApiKeyManager onApiKeyChange={setApiKey} />

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              サイト改善提案
            </h2>
            <p className="text-muted-foreground">
              SEO分析結果に基づいた具体的な改善提案を2つのカテゴリで分類
            </p>
          </div>

          {/* 改善サマリー */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  コンテンツ改善
                </CardTitle>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{contentSuggestions.length}</div>
                <p className="text-xs text-muted-foreground">
                  高優先度: {contentSuggestions.filter(s => s.priority === "high").length}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  技術的改善
                </CardTitle>
                <Code className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{technicalSuggestions.length}</div>
                <p className="text-xs text-muted-foreground">
                  高優先度: {technicalSuggestions.filter(s => s.priority === "high").length}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  実装進捗
                </CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
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
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Edit className="h-5 w-5" />
                コンテンツ改善提案
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contentSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="group p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/30 hover:border-primary/30 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {getPriorityBadge(suggestion.priority)}
                      <Badge variant="outline">{suggestion.category}</Badge>
                    </div>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {suggestion.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
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
            </CardContent>
          </Card>

          {/* 技術的改善提案 */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Code className="h-5 w-5" />
                技術的改善提案
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {technicalSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="group p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/30 hover:border-primary/30 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {getPriorityBadge(suggestion.priority)}
                      <Badge variant="outline">{suggestion.category}</Badge>
                    </div>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {suggestion.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
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
            </CardContent>
          </Card>

          {/* 実装タイムライン */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Clock className="h-5 w-5" />
                実装タイムライン
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {/* 即座に対応 */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-success flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
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
                    <Target className="w-4 h-4" />
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
      </main>
    </div>
  );
}