import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  MoreHorizontal, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  UserPlus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  lastLogin: string;
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "田中 太郎",
    email: "tanaka@example.com",
    role: "管理者",
    status: "active",
    lastLogin: "2024-01-15 10:30",
    createdAt: "2023-12-01"
  },
  {
    id: "2",
    name: "佐藤 花子",
    email: "sato@example.com",
    role: "編集者",
    status: "active",
    lastLogin: "2024-01-14 16:20",
    createdAt: "2023-11-15"
  },
  {
    id: "3",
    name: "山田 次郎",
    email: "yamada@example.com",
    role: "閲覧者",
    status: "pending",
    lastLogin: "未ログイン",
    createdAt: "2024-01-10"
  },
  {
    id: "4",
    name: "鈴木 美咲",
    email: "suzuki@example.com",
    role: "編集者",
    status: "inactive",
    lastLogin: "2023-12-20 09:15",
    createdAt: "2023-10-05"
  },
  {
    id: "5",
    name: "高橋 健",
    email: "takahashi@example.com",
    role: "管理者",
    status: "active",
    lastLogin: "2024-01-15 14:45",
    createdAt: "2023-09-12"
  }
];

export function UserTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users] = useState<User[]>(mockUsers);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">アクティブ</Badge>;
      case "inactive":
        return <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">無効</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">保留中</Badge>;
      default:
        return <Badge variant="secondary">不明</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      "管理者": "bg-primary/10 text-primary border-primary/20",
      "編集者": "bg-accent/50 text-accent-foreground border-accent",
      "閲覧者": "bg-muted text-muted-foreground border-muted"
    };
    
    return (
      <Badge 
        variant="outline" 
        className={`${roleColors[role as keyof typeof roleColors] || "bg-muted text-muted-foreground"}`}
      >
        {role}
      </Badge>
    );
  };

  return (
    <Card className="shadow-admin-md border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">ユーザー管理</CardTitle>
          <Button className="bg-gradient-primary hover:opacity-90 text-white shadow-admin-sm">
            <UserPlus className="mr-2 h-4 w-4" />
            新規ユーザー
          </Button>
        </div>
        
        {/* Search and Filter */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ユーザーを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/50 border-border focus:bg-background"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            フィルター
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">ユーザー</TableHead>
                <TableHead className="font-semibold">役割</TableHead>
                <TableHead className="font-semibold">ステータス</TableHead>
                <TableHead className="font-semibold">最終ログイン</TableHead>
                <TableHead className="font-semibold">作成日</TableHead>
                <TableHead className="w-[100px] font-semibold">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-popover border border-border">
                        <DropdownMenuItem className="gap-2 hover:bg-muted">
                          <Eye className="h-4 w-4" />
                          詳細表示
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 hover:bg-muted">
                          <Edit className="h-4 w-4" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 hover:bg-muted text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">該当するユーザーが見つかりません</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}