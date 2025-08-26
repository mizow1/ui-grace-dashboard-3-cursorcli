import { Bell, Search, User, Settings, LogOut, Menu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useDomain } from "@/contexts/DomainContext";

interface AdminHeaderProps {
  title?: string;
}

export function AdminHeader({ title = "ダッシュボード" }: AdminHeaderProps) {
  const { selectedDomain, availableDomains, setSelectedDomain } = useDomain();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6 gap-4">
        {/* Sidebar Toggle */}
        <SidebarTrigger className="lg:hidden" />
        
        {/* Page Title */}
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        </div>

        {/* Domain Selector */}
        {availableDomains.length > 0 && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedDomain?.id || ""}
              onValueChange={(value) => {
                const domain = availableDomains.find(d => d.id === value);
                setSelectedDomain(domain || null);
              }}
            >
              <SelectTrigger className="w-[200px] bg-muted/50 border-border">
                <SelectValue 
                  placeholder="ドメインを選択" 
                >
                  {selectedDomain?.domain || "ドメインを選択"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableDomains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id}>
                    {domain.domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="検索..."
              className="pl-10 bg-muted/50 border-border focus:bg-background transition-colors"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-muted">
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-popover border border-border">
              <DropdownMenuLabel className="font-medium">通知</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-2 p-2">
                <div className="flex items-start gap-3 p-2 rounded-md hover:bg-muted transition-colors">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">新しいユーザーが登録されました</p>
                    <p className="text-xs text-muted-foreground">5分前</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-md hover:bg-muted transition-colors">
                  <div className="h-2 w-2 rounded-full bg-warning mt-2 flex-shrink-0"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">システムメンテナンス予定</p>
                    <p className="text-xs text-muted-foreground">1時間前</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-md hover:bg-muted transition-colors">
                  <div className="h-2 w-2 rounded-full bg-success mt-2 flex-shrink-0"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">バックアップが完了しました</p>
                    <p className="text-xs text-muted-foreground">2時間前</p>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-border hover:border-primary transition-colors">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-popover border border-border" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">管理者</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-muted transition-colors">
                <User className="mr-2 h-4 w-4" />
                <span>プロフィール</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-muted transition-colors">
                <Settings className="mr-2 h-4 w-4" />
                <span>設定</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-muted transition-colors text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>ログアウト</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}