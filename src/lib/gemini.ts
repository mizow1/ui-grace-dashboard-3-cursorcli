import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini AI client
// Note: In production, this should be in a secure environment variable
let genAI: GoogleGenerativeAI | null = null;

export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenerativeAI(apiKey);
};

export const getGeminiModel = () => {
  if (!genAI) {
    throw new Error("Gemini AI not initialized. Please set your API key first.");
  }
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash-experimental" });
};

// Types for SEO analysis
export interface SeoAnalysisResult {
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
  contentSuggestions: ContentSuggestion[];
  technicalSuggestions: TechnicalSuggestion[];
  keywords: string[];
  competitorInsights?: CompetitorInsight[];
}

export interface ContentSuggestion {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string;
  estimatedImpact: string;
}

export interface TechnicalSuggestion {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string;
  implementation: string;
}

export interface CompetitorInsight {
  domain: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}

export interface CrawlPage {
  url: string;
  title?: string;
  description?: string;
  headings?: { h1?: string; h2?: string[] };
}

// Site analysis using Gemini AI
export const analyzeSiteWithGemini = async (
  domain: string,
  pages: CrawlPage[],
  apiKey: string
): Promise<SeoAnalysisResult> => {
  try {
    initializeGemini(apiKey);
    const model = getGeminiModel();

    const prompt = `
あなたはSEOエキスパートです。以下のウェブサイトの情報を分析して、詳細なSEO分析レポートを作成してください。

ドメイン: ${domain}

ページ情報:
${pages.map(page => `
URL: ${page.url}
タイトル: ${page.title || "なし"}
説明: ${page.description || "なし"}
H1: ${page.headings?.h1 || "なし"}
H2: ${page.headings?.h2?.join(", ") || "なし"}
`).join("\n")}

以下の形式でJSONレスポンスを返してください:

{
  "seoScore": 数値(0-100),
  "performanceScore": 数値(0-100),
  "accessibilityScore": 数値(0-100),
  "keywords": ["キーワード1", "キーワード2", ...],
  "contentSuggestions": [
    {
      "id": "ユニークID",
      "title": "提案タイトル",
      "description": "詳細説明",
      "priority": "high/medium/low",
      "category": "カテゴリ",
      "estimatedImpact": "期待される効果"
    }
  ],
  "technicalSuggestions": [
    {
      "id": "ユニークID", 
      "title": "技術的改善提案",
      "description": "詳細説明",
      "priority": "high/medium/low",
      "category": "カテゴリ",
      "implementation": "実装方法"
    }
  ]
}

分析の観点:
1. コンテンツの質と構造
2. HTMLの技術的最適化
3. メタデータの改善
4. 内部リンク構造
5. キーワード最適化
6. ユーザビリティ
7. アクセシビリティ

日本語で回答してください。
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from Gemini AI");
    }

    const analysisResult = JSON.parse(jsonMatch[0]);
    return analysisResult;
  } catch (error) {
    console.error("Error analyzing site with Gemini:", error);
    throw error;
  }
};

// Competitor analysis using Gemini AI
export const analyzeCompetitorWithGemini = async (
  targetDomain: string,
  competitorDomain: string,
  targetPages: CrawlPage[],
  competitorPages: CrawlPage[],
  apiKey: string
): Promise<SeoAnalysisResult & { comparisonInsights: CompetitorInsight[] }> => {
  try {
    initializeGemini(apiKey);
    const model = getGeminiModel();

    const prompt = `
あなたはSEOコンサルタントです。以下の2つのウェブサイトを比較分析してください。

対象サイト: ${targetDomain}
競合サイト: ${competitorDomain}

対象サイトのページ情報:
${targetPages.map(page => `
URL: ${page.url}
タイトル: ${page.title || "なし"}
説明: ${page.description || "なし"}
H1: ${page.headings?.h1 || "なし"}
H2: ${page.headings?.h2?.join(", ") || "なし"}
`).join("\n")}

競合サイトのページ情報:
${competitorPages.map(page => `
URL: ${page.url}
タイトル: ${page.title || "なし"}
説明: ${page.description || "なし"}
H1: ${page.headings?.h1 || "なし"}
H2: ${page.headings?.h2?.join(", ") || "なし"}
`).join("\n")}

以下の形式でJSONレスポンスを返してください:

{
  "seoScore": 数値(0-100),
  "performanceScore": 数値(0-100),
  "accessibilityScore": 数値(0-100),
  "keywords": ["競合キーワード1", "競合キーワード2", ...],
  "contentSuggestions": [
    {
      "id": "ユニークID",
      "title": "競合に勝つためのコンテンツ提案",
      "description": "詳細説明",
      "priority": "high/medium/low",
      "category": "カテゴリ",
      "estimatedImpact": "期待される効果"
    }
  ],
  "technicalSuggestions": [
    {
      "id": "ユニークID",
      "title": "競合を上回る技術的改善",
      "description": "詳細説明", 
      "priority": "high/medium/low",
      "category": "カテゴリ",
      "implementation": "実装方法"
    }
  ],
  "comparisonInsights": [
    {
      "domain": "${competitorDomain}",
      "strengths": ["競合の強み1", "競合の強み2"],
      "weaknesses": ["競合の弱み1", "競合の弱み2"],
      "opportunities": ["勝機1", "勝機2"]
    }
  ]
}

分析の観点:
1. コンテンツの質と量の比較
2. キーワード戦略の比較
3. 技術的SEOの比較
4. ユーザーエクスペリエンスの比較
5. 競合に勝つための具体的戦略

日本語で回答してください。
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from Gemini AI");
    }

    const analysisResult = JSON.parse(jsonMatch[0]);
    return analysisResult;
  } catch (error) {
    console.error("Error analyzing competitor with Gemini:", error);
    throw error;
  }
};

// Generate content suggestions using Gemini AI
export const generateContentWithGemini = async (
  topic: string,
  keywords: string[],
  targetAudience: string,
  contentType: string,
  apiKey: string
): Promise<{ title: string; content: string; outline: string[] }> => {
  try {
    initializeGemini(apiKey);
    const model = getGeminiModel();

    const prompt = `
あなたはSEOライターです。以下の条件でコンテンツを作成してください。

トピック: ${topic}
キーワード: ${keywords.join(", ")}
ターゲット読者: ${targetAudience}
コンテンツタイプ: ${contentType}

以下の形式でJSONレスポンスを返してください:

{
  "title": "SEOに最適化されたタイトル",
  "outline": ["見出し1", "見出し2", "見出し3", ...],
  "content": "詳細なコンテンツ本文（HTMLタグ付き）"
}

要件:
1. キーワードを自然に含める
2. 読者の検索意図に答える
3. 構造化された見出しを使用
4. 価値のある情報を提供
5. SEOベストプラクティスに従う

日本語で作成してください。
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from Gemini AI");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw error;
  }
};