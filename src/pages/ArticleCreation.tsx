import { useState } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { useDomain } from "@/contexts/DomainContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Wand2, Save, Trash2, Edit3 } from "lucide-react";

// サンプルデータ：実装予定に追加されたページ
const scheduledPages = [
  {
    id: "1",
    title: "ブログページの作成",
    description: "SEO強化とユーザー engagement向上のため、定期的なブログ投稿を行うページを作成",
    priority: "高",
    category: "新規ページ作成",
    suggestedContent: {
      title: "技術ブログ - Example Corp",
      description: "最新技術トレンドや開発ノウハウを発信する技術ブログ",
      h1: "技術ブログ",
      h2: ["最新記事", "人気記事", "カテゴリー別記事", "月別アーカイブ"],
      contentSections: [
        {
          heading: "最新記事セクション",
          content: "最新の技術記事を時系列で表示。各記事には投稿日、カテゴリー、タグ、概要を含める。"
        },
        {
          heading: "記事詳細ページ",
          content: "記事本文、著者情報、関連記事、コメント機能、SNSシェアボタンを配置。"
        }
      ]
    }
  },
  {
    id: "2", 
    title: "FAQページの追加",
    description: "お客様からよくいただく質問をまとめたページで、サポート負荷軽減とUX向上を図る",
    priority: "高",
    category: "新規ページ作成",
    suggestedContent: {
      title: "よくある質問 - Example Corp",
      description: "お客様からよくいただくご質問とその回答をまとめています",
      h1: "よくある質問（FAQ）",
      h2: ["サービスについて", "料金について", "サポートについて", "技術的な質問"],
      contentSections: [
        {
          heading: "サービス概要",
          content: "弊社サービスの基本的な機能、利用方法、対象ユーザーに関する質問と回答。"
        },
        {
          heading: "料金・プラン",
          content: "各種プランの詳細、支払い方法、解約手続きに関する質問と回答。"
        }
      ]
    }
  }
];

// ユーザー追加ページの初期データ
const initialUserPages = [
  {
    id: "user-1",
    title: "会社紹介動画ページ",
    description: "会社の魅力を伝える動画コンテンツページ",
    priority: "中",
    category: "ユーザー追加",
    suggestedContent: {
      title: "",
      description: "",
      h1: "",
      h2: [],
      contentSections: []
    }
  }
];

interface PageContent {
  title: string;
  description: string;
  h1: string;
  h2: string[];
  contentSections: {
    heading: string;
    content: string;
  }[];
}

interface PageItem {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  suggestedContent: PageContent;
}

export default function ArticleCreation() {
  const [userPages, setUserPages] = useState<PageItem[]>(initialUserPages);
  const [selectedPage, setSelectedPage] = useState<PageItem | null>(null);
  const [editingContent, setEditingContent] = useState<PageContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newPageDialog, setNewPageDialog] = useState(false);
  const { selectedDomain } = useDomain();
  const [newPageForm, setNewPageForm] = useState({
    title: "",
    description: "",
    priority: "中"
  });

  const allPages = [...scheduledPages, ...userPages];

  const handleAddUserPage = () => {
    const newPage: PageItem = {
      id: `user-${Date.now()}`,
      title: newPageForm.title,
      description: newPageForm.description,
      priority: newPageForm.priority,
      category: "ユーザー追加",
      suggestedContent: {
        title: "",
        description: "",
        h1: "",
        h2: [],
        contentSections: []
      }
    };
    setUserPages([...userPages, newPage]);
    setNewPageForm({ title: "", description: "", priority: "中" });
    setNewPageDialog(false);
  };

  const handleDeleteUserPage = (pageId: string) => {
    setUserPages(userPages.filter(page => page.id !== pageId));
  };

  const handleEditPage = (page: PageItem) => {
    setSelectedPage(page);
    setEditingContent({ ...page.suggestedContent });
  };

  const handleSaveContent = () => {
    if (!selectedPage || !editingContent) return;

    if (selectedPage.category === "ユーザー追加") {
      setUserPages(userPages.map(page => 
        page.id === selectedPage.id 
          ? { ...page, suggestedContent: editingContent }
          : page
      ));
    }
    
    setSelectedPage(null);
    setEditingContent(null);
  };

  const handleGenerateContent = async () => {
    if (!selectedPage) return;
    
    setIsGenerating(true);
    // サンプル生成処理
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generated: PageContent = {
      title: `${selectedPage.title} - Example Corp`,
      description: `${selectedPage.description}に関する詳細ページです。`,
      h1: selectedPage.title,
      h2: ["概要", "詳細情報", "関連サービス", "お問い合わせ"],
      contentSections: [
        {
          heading: "ページ概要",
          content: `${selectedPage.description}について詳しく説明するセクションです。ユーザーにとって価値のある情報を提供します。`
        },
        {
          heading: "詳細コンテンツ",
          content: "具体的な内容、手順、注意点などを詳細に記載。読みやすい構成で情報を整理します。"
        },
        {
          heading: "関連情報",
          content: "関連するサービスや参考情報、次のアクションへの導線を配置します。"
        }
      ]
    };
    
    setEditingContent(generated);
    setIsGenerating(false);
  };

  const addH2Item = () => {
    if (!editingContent) return;
    setEditingContent({
      ...editingContent,
      h2: [...editingContent.h2, ""]
    });
  };

  const updateH2Item = (index: number, value: string) => {
    if (!editingContent) return;
    const newH2 = [...editingContent.h2];
    newH2[index] = value;
    setEditingContent({
      ...editingContent,
      h2: newH2
    });
  };

  const removeH2Item = (index: number) => {
    if (!editingContent) return;
    setEditingContent({
      ...editingContent,
      h2: editingContent.h2.filter((_, i) => i !== index)
    });
  };

  const addContentSection = () => {
    if (!editingContent) return;
    setEditingContent({
      ...editingContent,
      contentSections: [...editingContent.contentSections, { heading: "", content: "" }]
    });
  };

  const updateContentSection = (index: number, field: 'heading' | 'content', value: string) => {
    if (!editingContent) return;
    const newSections = [...editingContent.contentSections];
    newSections[index][field] = value;
    setEditingContent({
      ...editingContent,
      contentSections: newSections
    });
  };

  const removeContentSection = (index: number) => {
    if (!editingContent) return;
    setEditingContent({
      ...editingContent,
      contentSections: editingContent.contentSections.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="記事提案・作成" />
      
      <main className="container mx-auto p-6 space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">記事提案・作成</h1>
            <p className="text-muted-foreground">
              {selectedDomain ? `${selectedDomain.domain} の` : ''}実装予定のページとユーザー追加ページのコンテンツを提案・作成します
            </p>
          </div>
        <Dialog open={newPageDialog} onOpenChange={setNewPageDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              ページを追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規ページ追加</DialogTitle>
              <DialogDescription>作成したいページの基本情報を入力してください</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">ページタイトル</Label>
                <Input
                  id="title"
                  value={newPageForm.title}
                  onChange={(e) => setNewPageForm({...newPageForm, title: e.target.value})}
                  placeholder="例：お客様の声ページ"
                />
              </div>
              <div>
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={newPageForm.description}
                  onChange={(e) => setNewPageForm({...newPageForm, description: e.target.value})}
                  placeholder="ページの目的や内容を説明してください"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setNewPageDialog(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleAddUserPage} disabled={!newPageForm.title}>
                  追加
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ページ一覧 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>対象ページ一覧</span>
            </CardTitle>
            <CardDescription>実装予定とユーザー追加ページの管理</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="scheduled" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="scheduled">実装予定 ({scheduledPages.length})</TabsTrigger>
                <TabsTrigger value="user">ユーザー追加 ({userPages.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="scheduled" className="space-y-3 mt-4">
                {scheduledPages.map((page) => (
                  <div key={page.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{page.title}</h4>
                          <Badge variant={page.priority === "高" ? "destructive" : "secondary"}>
                            {page.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{page.description}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleEditPage(page)}>
                        <Edit3 className="h-4 w-4 mr-1" />
                        編集
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="user" className="space-y-3 mt-4">
                {userPages.map((page) => (
                  <div key={page.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{page.title}</h4>
                          <Badge variant="outline">{page.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{page.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditPage(page)}>
                          <Edit3 className="h-4 w-4 mr-1" />
                          編集
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteUserPage(page.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* コンテンツ編集エリア */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5" />
              <span>コンテンツ編集</span>
            </CardTitle>
            <CardDescription>
              {selectedPage ? `編集中: ${selectedPage.title}` : "ページを選択してください"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPage && editingContent ? (
              <div className="space-y-6">
                <div className="flex justify-between">
                  <Button
                    onClick={handleGenerateContent}
                    disabled={isGenerating}
                    variant="secondary"
                  >
                    {isGenerating ? (
                      <>
                        <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        AI提案生成
                      </>
                    )}
                  </Button>
                  <Button onClick={handleSaveContent}>
                    <Save className="mr-2 h-4 w-4" />
                    保存
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">ページタイトル</Label>
                    <Input
                      id="title"
                      value={editingContent.title}
                      onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                      placeholder="ページのタイトルを入力"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">メタディスクリプション</Label>
                    <Textarea
                      id="description"
                      value={editingContent.description}
                      onChange={(e) => setEditingContent({...editingContent, description: e.target.value})}
                      placeholder="検索結果に表示される説明文"
                      className="min-h-[60px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="h1">H1タグ</Label>
                    <Input
                      id="h1"
                      value={editingContent.h1}
                      onChange={(e) => setEditingContent({...editingContent, h1: e.target.value})}
                      placeholder="メインタイトル（H1）"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>H2タグ</Label>
                      <Button size="sm" variant="outline" onClick={addH2Item}>
                        <Plus className="h-4 w-4 mr-1" />
                        追加
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {editingContent.h2.map((h2, index) => (
                        <div key={index} className="flex space-x-2">
                          <Input
                            value={h2}
                            onChange={(e) => updateH2Item(index, e.target.value)}
                            placeholder={`H2タグ ${index + 1}`}
                          />
                          <Button size="sm" variant="outline" onClick={() => removeH2Item(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>コンテンツセクション</Label>
                      <Button size="sm" variant="outline" onClick={addContentSection}>
                        <Plus className="h-4 w-4 mr-1" />
                        追加
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {editingContent.contentSections.map((section, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center space-x-2">
                            <Input
                              value={section.heading}
                              onChange={(e) => updateContentSection(index, 'heading', e.target.value)}
                              placeholder="セクション見出し"
                              className="flex-1"
                            />
                            <Button size="sm" variant="outline" onClick={() => removeContentSection(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            value={section.content}
                            onChange={(e) => updateContentSection(index, 'content', e.target.value)}
                            placeholder="セクションの内容"
                            className="min-h-[80px]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>ページを選択してコンテンツ編集を開始してください</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </main>
    </div>
  );
}