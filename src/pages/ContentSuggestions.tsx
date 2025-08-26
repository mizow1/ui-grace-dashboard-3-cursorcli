import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { useDomain } from "@/contexts/DomainContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, Target, Users, TrendingUp, BookOpen, Search, AlertTriangle, Edit } from "lucide-react";
import { ApiKeyManager, getStoredApiKey } from "@/components/ApiKeyManager";
import { generateContentWithGemini } from "@/lib/gemini";
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

interface GeneratedContent {
  title: string;
  content: string;
  outline: string[];
  topic: string;
  keywords: string[];
  targetAudience: string;
  contentType: string;
  createdAt: string;
}

export default function ContentSuggestions() {
  const [domains, setDomains] = useState<SeoDomain[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { selectedDomain } = useDomain();
  
  // Form states
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [contentType, setContentType] = useState("記事");
  
  // Generated content
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  useEffect(() => {
    setDomains(loadDomains());
    const storedApiKey = getStoredApiKey();
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleGenerateContent = async () => {
    if (!topic || !keywords || !targetAudience || !apiKey) {
      setError("すべての入力項目とAPIキーが必要です");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      setProgress(30);
      
      const keywordList = keywords.split(",").map(k => k.trim()).filter(k => k);
      const result = await generateContentWithGemini(
        topic,
        keywordList,
        targetAudience,
        contentType,
        apiKey
      );

      setProgress(80);

      const content: GeneratedContent = {
        ...result,
        topic,
        keywords: keywordList,
        targetAudience,
        contentType,
        createdAt: new Date().toISOString()
      };

      setGeneratedContent(content);
      setProgress(100);

    } catch (error) {
      console.error("Content generation failed:", error);
      setError(error instanceof Error ? error.message : "コンテンツ生成中にエラーが発生しました");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="コンテンツ提案" />
      
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

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              AIコンテンツ生成
            </h2>
            <p className="text-muted-foreground">
              Gemini AIを使用してSEOに最適化されたコンテンツを生成します
            </p>
          </div>

          {/* コンテンツ生成フォーム */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Lightbulb className="h-5 w-5" />
                AIコンテンツ生成
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground">トピック</label>
                  <Input 
                    placeholder="例: デジタルマーケティング戦略" 
                    className="mt-1"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground">対象読者</label>
                  <Input 
                    placeholder="例: 中小企業経営者" 
                    className="mt-1"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground">キーワード</label>
                  <Input 
                    placeholder="キーワードをカンマ区切りで入力" 
                    className="mt-1"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground">コンテンツタイプ</label>
                  <select 
                    className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                  >
                    <option value="記事">記事</option>
                    <option value="ブログ投稿">ブログ投稿</option>
                    <option value="商品説明">商品説明</option>
                    <option value="サービス紹介">サービス紹介</option>
                    <option value="FAQ">FAQ</option>
                    <option value="ガイド">ガイド</option>
                  </select>
                </div>
              </div>
              
              <Button 
                onClick={handleGenerateContent}
                disabled={!topic || !keywords || !targetAudience || isGenerating || !apiKey}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isGenerating ? "生成中..." : "AIコンテンツを生成"}
              </Button>

              {isGenerating && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">コンテンツ生成中...</span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 生成されたコンテンツ */}
          {generatedContent && (
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <BookOpen className="h-5 w-5" />
                  生成されたコンテンツ
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{generatedContent.contentType}</Badge>
                  <Badge variant="secondary">{generatedContent.targetAudience}</Badge>
                  {generatedContent.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* タイトル */}
                <div>
                  <h3 className="text-xl font-bold text-card-foreground mb-4">
                    {generatedContent.title}
                  </h3>
                </div>

                {/* アウトライン */}
                <div>
                  <h4 className="text-lg font-semibold text-card-foreground mb-3">構成案</h4>
                  <div className="space-y-2">
                    {generatedContent.outline.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium text-primary min-w-[2rem]">
                          {index + 1}.
                        </span>
                        <span className="text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* コンテンツ本文 */}
                <div>
                  <h4 className="text-lg font-semibold text-card-foreground mb-3">コンテンツ本文</h4>
                  <div 
                    className="prose prose-sm max-w-none bg-muted/20 p-4 rounded-lg border border-border/30"
                    dangerouslySetInnerHTML={{ __html: generatedContent.content }}
                  />
                </div>

                {/* アクションボタン */}
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={() => navigator.clipboard.writeText(generatedContent.content)}>
                    <Target className="w-4 h-4 mr-2" />
                    コピー
                  </Button>
                  <Button variant="outline" onClick={() => setGeneratedContent(null)}>
                    <Edit className="w-4 h-4 mr-2" />
                    新しく生成
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* コンテンツ提案カード（生成されたコンテンツがない場合のみ表示） */}
          {!generatedContent && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "SEO最適化ガイド",
                  type: "how-to",
                  priority: "high",
                  keywords: ["SEO", "検索エンジン最適化", "ランキング"],
                  expectedTraffic: "+25%"
                },
                {
                  title: "ユーザーエクスペリエンス改善",
                  type: "best-practices",
                  priority: "medium",
                  keywords: ["UX", "ユーザビリティ", "コンバージョン"],
                  expectedTraffic: "+15%"
                },
                {
                  title: "モバイル最適化のポイント",
                  type: "tutorial",
                  priority: "high",
                  keywords: ["モバイル", "レスポンシブ", "モバイルファースト"],
                  expectedTraffic: "+30%"
                },
                {
                  title: "サイト速度改善方法",
                  type: "technical",
                  priority: "medium",
                  keywords: ["パフォーマンス", "読み込み速度", "最適化"],
                  expectedTraffic: "+20%"
                }
              ].map((suggestion, index) => (
                <Card key={index} className="bg-gradient-card border-border/50 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-card-foreground">
                        {suggestion.title}
                      </CardTitle>
                      <Badge 
                        variant={suggestion.priority === "high" ? "destructive" : "secondary"}
                        className="ml-2"
                      >
                        {suggestion.priority === "high" ? "高優先度" : "中優先度"}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {suggestion.type}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-card-foreground mb-2">関連キーワード</h4>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.keywords.map((keyword, kidx) => (
                          <Badge key={kidx} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">期待トラフィック増加</span>
                      <span className="text-sm font-medium text-success">{suggestion.expectedTraffic}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => {
                        setTopic(suggestion.title);
                        setKeywords(suggestion.keywords.join(", "));
                        setTargetAudience("ウェブサイト運営者");
                      }}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      このトピックで生成
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}