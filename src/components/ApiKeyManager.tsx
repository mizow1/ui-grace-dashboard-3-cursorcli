import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Save, Key } from "lucide-react";

const API_KEY_STORAGE_KEY = "gemini-api-key";

interface ApiKeyManagerProps {
  onApiKeyChange?: (apiKey: string) => void;
}

export const ApiKeyManager = ({ onApiKeyChange }: ApiKeyManagerProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSet, setIsSet] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (stored) {
      setApiKey(stored);
      setIsSet(true);
      onApiKeyChange?.(stored);
    }
  }, [onApiKeyChange]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
      setIsSet(true);
      onApiKeyChange?.(apiKey.trim());
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKey("");
    setIsSet(false);
    onApiKeyChange?.("");
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Key className="h-5 w-5" />
          Gemini API設定
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">Google AI Studio APIキー</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                placeholder="AIza..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </div>

        {isSet && (
          <Alert className="border-success/50 bg-success/10">
            <AlertDescription className="text-success">
              APIキーが設定されました。AI分析機能が利用可能です。
            </AlertDescription>
          </Alert>
        )}

        {!isSet && (
          <Alert>
            <AlertDescription>
              Gemini AI分析を利用するには、Google AI StudioでAPIキーを取得してください。
              <br />
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio →
              </a>
            </AlertDescription>
          </Alert>
        )}

        {isSet && (
          <Button variant="outline" onClick={handleClearApiKey}>
            APIキーをクリア
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export const getStoredApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};