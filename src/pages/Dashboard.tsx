import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { useDomain } from "@/contexts/DomainContext";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign,
  BarChart3,
  Calendar,
  Clock,
  AlertTriangle,
  Globe,
  Eye,
  MousePointer
} from "lucide-react";
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

export default function Dashboard() {
  const { selectedDomain, availableDomains } = useDomain();
  const [domains, setDomains] = useState<SeoDomain[]>([]);
  useEffect(() => {
    setDomains(loadDomains());
  }, []);

  const getStatsData = () => {
    if (!selectedDomain) {
      return [
        {
          title: "登録ドメイン数",
          value: availableDomains.length.toString(),
          change: "+新規登録",
          changeType: "increase" as const,
          icon: Globe,
          iconColor: "text-primary"
        },
        {
          title: "分析済みドメイン",
          value: availableDomains.filter(d => d.lastAnalyzed).length.toString(),
          change: "今月実行",
          changeType: "increase" as const,
          icon: BarChart3,
          iconColor: "text-success"
        },
        {
          title: "平均SEOスコア",
          value: availableDomains.length > 0 && availableDomains.some(d => d.seoScore)
            ? Math.round(availableDomains.filter(d => d.seoScore).reduce((acc, d) => acc + (d.seoScore || 0), 0) / availableDomains.filter(d => d.seoScore).length).toString()
            : "--",
          change: "全ドメイン平均",
          changeType: "increase" as const,
          icon: TrendingUp,
          iconColor: "text-warning"
        },
        {
          title: "要改善ドメイン",
          value: availableDomains.filter(d => d.seoScore && d.seoScore < 70).length.toString(),
          change: "改善が必要",
          changeType: "decrease" as const,
          icon: AlertTriangle,
          iconColor: "text-destructive"
        }
      ];
    }

    // 選択されたドメインの統計（モック）
    return [
      {
        title: "月間訪問者数",
        value: (Math.floor(Math.random() * 50000) + 10000).toLocaleString(),
        change: "+12.5%",
        changeType: "increase" as const,
        icon: Users,
        iconColor: "text-primary"
      },
      {
        title: "ページビュー",
        value: (Math.floor(Math.random() * 200000) + 50000).toLocaleString(),
        change: "+8.2%",
        changeType: "increase" as const,
        icon: Eye,
        iconColor: "text-success"
      },
      {
        title: "直帰率",
        value: `${Math.floor(Math.random() * 40) + 30}%`,
        change: "-2.1%",
        changeType: "decrease" as const,
        icon: Activity,
        iconColor: "text-warning"
      },
      {
        title: "SEOスコア",
        value: selectedDomain.seoScore?.toString() || "--",
        change: "最新分析結果",
        changeType: "increase" as const,
        icon: TrendingUp,
        iconColor: "text-primary"
      }
    ];
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-subtle">
      <AdminHeader title="ダッシュボード" />
      
      <main className="flex-1 p-6 space-y-6">
        {/* Domain Status */}
        <div className="mb-6">
          {selectedDomain ? (
            <div className="flex items-center gap-4 p-4 bg-gradient-card border border-border/50 rounded-lg">
              <Globe className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">
                  現在選択中: {selectedDomain.domain}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedDomain.description || "このドメインのSEO分析データを表示しています"}
                </p>
              </div>
              {selectedDomain.seoScore && (
                <Badge 
                  variant={selectedDomain.seoScore >= 80 ? "default" : selectedDomain.seoScore >= 60 ? "secondary" : "destructive"}
                  className="ml-auto"
                >
                  SEOスコア: {selectedDomain.seoScore}
                </Badge>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-gradient-card border border-border/50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-warning" />
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">
                  ドメインが選択されていません
                </h2>
                <p className="text-sm text-muted-foreground">
                  全体の統計を表示しています。詳細な分析を行うにはドメインを選択してください。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getStatsData().map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              iconColor={stat.iconColor}
            />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Chart */}
          <Card className="shadow-admin-md border-border bg-gradient-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                活動状況
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center space-y-2">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">チャートデータを読み込み中...</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="shadow-admin-md border-border bg-gradient-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                最近の活動
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    action: "新しいユーザーが登録されました",
                    user: "田中 太郎",
                    time: "5分前",
                    type: "success"
                  },
                  {
                    action: "データベースのバックアップが完了",
                    user: "システム",
                    time: "1時間前",
                    type: "info"
                  },
                  {
                    action: "セキュリティアラート",
                    user: "セキュリティ",
                    time: "2時間前",
                    type: "warning"
                  },
                  {
                    action: "システム設定が更新されました",
                    user: "管理者",
                    time: "3時間前",
                    type: "info"
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.type === "success" ? "bg-success" :
                      activity.type === "warning" ? "bg-warning" :
                      "bg-primary"
                    }`}></div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">{activity.user}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Health */}
          <Card className="shadow-admin-md border-border bg-gradient-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-success" />
                システムヘルス
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">CPU使用率</span>
                  <span className="text-sm font-medium text-success">23%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">メモリ使用率</span>
                  <span className="text-sm font-medium text-warning">67%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-warning h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ディスク使用率</span>
                  <span className="text-sm font-medium text-success">45%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="shadow-admin-md border-border bg-gradient-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                アラート
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-md bg-warning/10 border border-warning/20">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <div>
                    <p className="text-sm font-medium">メンテナンス予定</p>
                    <p className="text-xs text-muted-foreground">明日 2:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md bg-primary/10 border border-primary/20">
                  <Activity className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">バックアップ完了</p>
                    <p className="text-xs text-muted-foreground">1時間前</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-admin-md border-border bg-gradient-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                クイックアクション
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <p className="text-sm font-medium">新しいユーザーを追加</p>
                  <p className="text-xs text-muted-foreground">ユーザー管理画面へ</p>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <p className="text-sm font-medium">レポート生成</p>
                  <p className="text-xs text-muted-foreground">月次レポートを作成</p>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <p className="text-sm font-medium">システム設定</p>
                  <p className="text-xs text-muted-foreground">基本設定を変更</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}