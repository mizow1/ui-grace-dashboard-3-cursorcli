import { AdminHeader } from "@/components/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Database,
  Save,
  RefreshCw
} from "lucide-react";

export default function Settings() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-subtle">
      <AdminHeader title="システム設定" />
      
      <main className="flex-1 p-6 space-y-6">
        {/* General Settings */}
        <Card className="shadow-admin-md border-border bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              基本設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">サイト名</Label>
                <Input id="site-name" defaultValue="管理システム" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">管理者メール</Label>
                <Input id="admin-email" type="email" defaultValue="admin@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">タイムゾーン</Label>
                <Input id="timezone" defaultValue="Asia/Tokyo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">言語</Label>
                <Input id="language" defaultValue="日本語" />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>メンテナンスモード</Label>
                  <p className="text-sm text-muted-foreground">サイトをメンテナンス状態にします</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>新規登録を許可</Label>
                  <p className="text-sm text-muted-foreground">新しいユーザーの登録を許可します</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>デバッグモード</Label>
                  <p className="text-sm text-muted-foreground">開発用のデバッグ情報を表示します</p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="shadow-admin-md border-border bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              セキュリティ設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">セッションタイムアウト（分）</Label>
                <Input id="session-timeout" type="number" defaultValue="60" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-login-attempts">最大ログイン試行回数</Label>
                <Input id="max-login-attempts" type="number" defaultValue="5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-min-length">パスワード最小文字数</Label>
                <Input id="password-min-length" type="number" defaultValue="8" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backup-interval">バックアップ間隔（時間）</Label>
                <Input id="backup-interval" type="number" defaultValue="24" />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>二要素認証を必須にする</Label>
                  <p className="text-sm text-muted-foreground">すべてのユーザーに2FAを強制します</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>IPアドレス制限</Label>
                  <p className="text-sm text-muted-foreground">特定のIPからのアクセスのみ許可</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>ログイン通知</Label>
                  <p className="text-sm text-muted-foreground">新しいログインがあった時に通知</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="shadow-admin-md border-border bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              通知設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>システムアラート</Label>
                  <p className="text-sm text-muted-foreground">システムの重要な変更を通知</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>ユーザー登録通知</Label>
                  <p className="text-sm text-muted-foreground">新しいユーザー登録時に通知</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>メンテナンス通知</Label>
                  <p className="text-sm text-muted-foreground">メンテナンス予定を事前通知</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>エラー通知</Label>
                  <p className="text-sm text-muted-foreground">システムエラー発生時に通知</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="notification-email">通知先メールアドレス</Label>
              <Input id="notification-email" type="email" defaultValue="admin@example.com" />
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card className="shadow-admin-md border-border bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              データベース設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>データベース接続状態</Label>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success"></div>
                  <span className="text-sm text-success">接続中</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>最終バックアップ</Label>
                <p className="text-sm text-muted-foreground">2024-01-15 02:00:00</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex gap-4">
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                今すぐバックアップ
              </Button>
              <Button variant="outline" className="gap-2">
                <Database className="h-4 w-4" />
                データベース最適化
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="bg-gradient-primary hover:opacity-90 text-white shadow-admin-sm gap-2">
            <Save className="h-4 w-4" />
            設定を保存
          </Button>
        </div>
      </main>
    </div>
  );
}