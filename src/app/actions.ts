"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { ModuleId, MODULES } from "@/lib/modules";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface AnalysisResult {
    refinedGoal: string;
    problemStructure: string;
    selectedModules: {
        id: ModuleId;
        name: string;
        reason: string;
    }[];
    // M00: 構造化
    m00Data?: {
        problems: string[];
        goals: string[];
        constraints: string[];
        assumptions: string[];
    };
    // M10: 市場環境・競合インテリジェンス
    m10Data?: {
        marketAnalysis: { factor: string; impact: string; source: string }[];
        competitors: { name: string; share: number; strength: string; weakness: string; strategy: string }[];
        trends: { keyword: string; growth: string; platform: string; reasoning: string }[];
        evidence: { title: string; url: string; date: string }[];
    };
    // M12: 検索エンジン・キーワード戦略
    m12Data?: {
        trendingKeywords: { word: string; volume: string; growth: string }[];
        relatedQueries: string[];
        platformStrategy: { platform: string; approach: string }[];
    };
    // M20: 販売戦略・成約導線
    m20Data?: {
        targetPersona: { profile: string; painPoints: string[]; gainPoints: string[] };
        strategy: { coreValue: string; channels: string[]; pricing: string };
        salesFlow: { step: string; purpose: string; script: string }[];
        actionPlans: { task: string; priority: "High" | "Mid" | "Low"; deadline: string }[];
    };
    // M21: セミナー・商談設計
    m21Data?: {
        seminarStructure: { section: string; content: string; keyTalk: string }[];
        sessionFlow: { phase: string; purpose: string; script: string }[];
        closingStrategy: string;
    };
    // M30: 事業収支・資金調達
    m30Data?: {
        executiveSummary: string;
        plSimulation: { year: number; revenue: number; profit: number; note: string }[];
        milestones: { date: string; event: string; phase: string; requirement: string }[];
        fundingPlan: { method: string; amount: string; institutionalSupport: string }[];
        teamProfile: { role: string; background: string; strength: string }[];
        riskAnalysis: { factor: string; impact: string; solution: string }[];
    };
    // M40: 業務改善
    m40Data?: {
        currentBottlenecks: string[];
        improvementFlow: { before: string; after: string; tool: string }[];
        costReduction: string;
    };
    // M50: コンテンツ・SNS戦略
    m50Data?: {
        snsStrategy: { platform: string; frequency: string; kpis: { metric: string; target: string }[] }[];
        contentThemes: string[];
        headlines: string[];
        funnelDesign: { stage: string; action: string; prompt: string }[];
        lineMarketing?: {
            tagDesign: { name: string; condition: string; meaning: string }[];
            stepMessages: { day: number; title: string; content: string }[];
            actionTriggers: { label: string; action: string }[];
            kpiTargets: { metric: string; target: string; current?: string }[];
        };
    };
    // M51: コピーライティング・訴求設計
    m51Data?: {
        headlines: string[];
        brief: { target: string; usp: string; benefit: string };
        prompts: { title: string; body: string }[];
    };
    // M52: SNS運用・拡散
    m52Data?: {
        xPosts: { type: string; draft: string }[];
        funnelDesign: string;
    };
    // M60: プロダクト要件・技術仕様 (Expanded)
    m60Data?: {
        systemDefinition?: {
            name: string;
            purpose: string;
            successDefinition: string;
            targetUser: string;
        };
        concept: string;
        userFlow: { action: string; response: string }[];
        features: { name: string; priority: string; description: string }[];
        techStack: { category: string; selection: string; reason: string }[];
        dbSchema?: { table: string; columns: { name: string; type: string; note: string }[] }[];
        apiDesign?: { endpoint: string; method: string; summary: string }[];
        security?: { roles: string[]; auth: string; measures: string[] };
        maintenance?: { monitoring: string; backup: string };
        constraints?: string[];
    };
    // M90: 戦略提案書 (1枚のコンサルシート)
    m90Data?: {
        executiveSummary: string;
        strategicVision: string;
        coreCompetitiveAdvantage: string;
        marketOpportunity: string;
        roadmapSummary: string;
        financialHighlights: string;
        conclusion: string;
    };
    // M91: Simulation
    m91Data?: {
        scenarios: { name: string; result: string; probability: string }[];
        parameters: { name: string; value: string; impact: string }[];
    };
    // M99: Custom
    m99Data?: {
        overview: string;
        details: string[];
    };
    id?: string;
    title?: string;
    lastUpdated?: string;
    theme?: string;
    aiNote: string;
    tags: string[];
}

export async function analyzeProject(
    goals: string[],
    clientTypes: string[],
    freeText: string
): Promise<AnalysisResult> {
    // If no API key, return structured mock data for now
    if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is not set. Returning mock data.");
        return simulateAnalysis(goals, freeText);
    }

    const currentDate = new Date().toLocaleDateString("ja-JP");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `
あなたはエリート戦略コンサルタントです。日本のクライアントに対して、最高レベルの戦略案を提示してください。

## 前提条件
- 現在日付: ${currentDate} (この時点での最新トレンドや市場状況を考慮すること)
- 言語: 日本語

## 入力データ
- 明示されたゴール: ${goals.join(", ")}
- クライアント性質: ${clientTypes.join(", ")}
- 相談内容詳細: "${freeText}"

## 搭載モジュール一覧 (キー: 名前)
${Object.values(MODULES).map(m => `- ${m.id}: ${m.name} (${m.description})`).join("\n")}

## 思考ルール（Layer A, B, C）
1. M00(構造化)は必須。
2. 自由入力から「意図」を読み取り、スコアリングして優先順位を決定。
3. 全項目を出すのは禁止。本質的に必要と思われるものだけに絞る（3〜5個）。
4. ゴールが明確ならM10(探索)は抑制する。

## 出力形式 (JSON)
以下の構造でJSONのみを返してください。
{
  "refinedGoal": "再定義された具体的なゴール",
  "problemStructure": "課題の構造化サマリ（150文字程度）",
  "selectedModules": [
    { "id": "Mxx", "name": "モジュール名", "reason": "選定した具体的な理由" }
  ],
  "m00Data": {
    "problems": ["課題1", "課題2"],
    "goals": ["ゴール1", "ゴール2"],
    "constraints": ["制限1", "制限2"],
    "assumptions": ["前提1", "前提2"]
  },
  "m10Data": {
    "marketAnalysis": [{ "factor": "PEST分析要素", "impact": "影響", "source": "出典" }],
    "competitors": [{ "name": "競合A", "share": 30, "strength": "強み", "weakness": "弱み", "strategy": "対抗策" }],
    "trends": [{ "keyword": "トレンド", "growth": "成長率", "platform": "媒体", "reasoning": "理由" }],
    "evidence": [{ "title": "タイトル", "url": "URL", "date": "日付" }]
  },
  "m12Data": {
    "trendingKeywords": [{ "word": "KW", "volume": "Vol", "growth": "率" }],
    "relatedQueries": ["クエリ1"],
    "platformStrategy": [{ "platform": "媒体", "approach": "アプローチ" }]
  },
  "m20Data": {
    "targetPersona": { 
        "profile": "人物像詳細", 
        "painPoints": ["悩み1", "悩み2"], 
        "gainPoints": ["理想1", "理想2"] 
    },
    "strategy": { 
        "coreValue": "コアバリュー", 
        "channels": ["集客チャネル"], 
        "pricing": "価格戦略" 
    },
    "salesFlow": [{ "step": "ステップ名", "purpose": "目的", "script": "トークスクリプト" }],
    "actionPlans": [{ "task": "タスク", "priority": "High", "deadline": "期限" }]
  },
  "m30Data": {
    "executiveSummary": "事業サマリ",
    "plSimulation": [{ "year": 1, "revenue": 1000, "profit": 100, "note": "メモ" }],
    "milestones": [{ "phase": "フェーズ", "date": "時期", "event": "イベント", "requirement": "要件" }],
    "fundingPlan": [{ "method": "調達方法", "amount": "金額", "institutionalSupport": "制度" }],
    "teamProfile": [{ "role": "役割", "background": "経歴", "strength": "強み" }],
    "riskAnalysis": [{ "factor": "リスク要因", "impact": "影響度", "solution": "対策" }]
  },
  "m40Data": {
    "currentBottlenecks": ["ボトルネック1", "ボトルネック2"],
    "improvementFlow": [{ "before": "改善前", "after": "改善後", "tool": "使用ツール" }],
    "costReduction": "削減効果"
  },
  "m50Data": {
    "snsStrategy": [{ "platform": "媒体", "frequency": "頻度", "kpis": [{ "metric": "指標", "target": "目標" }] }],
    "contentThemes": ["テーマ1", "テーマ2"],
    "headlines": ["見出し1", "見出し2"],
    "funnelDesign": [{ "stage": "段階", "action": "アクション", "prompt": "AI指示" }]
  },
  "m21Data": {
    "seminarStructure": [{ "section": "セクション", "content": "内容", "keyTalk": "キートーク" }],
    "sessionFlow": [{ "phase": "フェーズ", "purpose": "目的", "script": "スクリプト" }],
    "closingStrategy": "クロージング戦略"
  },
  "m51Data": {
    "headlines": ["ヘッドライン案"],
    "brief": { "target": "ターゲット", "usp": "USP", "benefit": "ベネフィット" },
    "prompts": [{ "title": "プロンプト名", "body": "内容" }]
  },
  "m52Data": {
    "xPosts": [{ "type": "タイプ", "draft": "ドラフト" }],
    "funnelDesign": "ファネル設計概要"
  },
  "aiNote": "AIからのアドバイス",
  "tags": ["タグ1", "タグ2"]
}
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Extract JSON from potential markdown code blocks
        const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
        const data = JSON.parse(jsonStr);
        return data;
    } catch (error) {
        console.error("Analysis failed:", error);
        return simulateAnalysis(goals, freeText);
    }
}

function simulateAnalysis(goals: string[], freeText: string): AnalysisResult {
    const isStartup = freeText.includes("創業") || freeText.includes("投資") || freeText.includes("資金") || goals.includes("finance") || goals.includes("bizplan");
    const isPersonal = freeText.includes("副業") || freeText.includes("個人") || goals.includes("sns");
    const isTech = freeText.includes("アプリ") || freeText.includes("システム") || goals.includes("app") || goals.includes("spec") || freeText.includes("仕様");

    const selected: AnalysisResult["selectedModules"] = [
        { id: "M00", name: MODULES.M00.name, reason: "プロジェクトの全体像と制約条件の定義のため" },
        { id: "M10", name: MODULES.M10.name, reason: "事実に基づく市場・競合情報のインテリジェンス提供" },
        { id: "M20", name: MODULES.M20.name, reason: "成約率を最大化するセールスフローと戦略の立案" },
        { id: "M50", name: MODULES.M50.name, reason: "拡散・集客を担うコンテンツファンネルの設計" }
    ];

    if (isStartup || goals.includes("bizplan")) {
        selected.push({ id: "M30", name: MODULES.M30.name, reason: "事業収支とマイルストーン、資金調達の最適化" });
    } else if (isTech) {
        selected.push({ id: "M60", name: MODULES.M60.name, reason: "開発要件と技術アーキテクチャの定義" });
    }

    return {
        refinedGoal: isPersonal ? "個人の専門性を収益化し、月50万円の安定した副収入源を構築する" : "AI技術を活用した新規事業を立ち上げ、1年以内にPMFを達成し、シリーズA規模の資金調達を目指す",
        problemStructure: "市場の飽和により単純な機能差別化は限界。独自の『信頼獲得プロセス』と『AIによる個別体験の最適化』が市場突破のクリティカルパスとなる。",
        selectedModules: selected.slice(0, 5),
        aiNote: "この計画は市場トレンドと競合状況を考慮した最短経路の戦略です。特に『M20：成約導線』の構築が売上直結の最優先課題です。",
        tags: ["Growth", "Scale", "AI-Strategy"],
        m00Data: {
            problems: ["集客の不安定性", "提供価値のコモディティ化", "リピート率の低さ"],
            goals: ["月次売上の安定", "ブランド認知の向上", "LTVの30%向上"],
            constraints: ["初期投資額500万円以内", "少人数体制での運営", "3ヶ月以内でのローンチ"],
            assumptions: ["ターゲット市場の成長率は年10%以上", "主要SNSのリーチアルゴリズムの大きな変更がないこと"]
        },
        m10Data: {
            marketAnalysis: [
                { factor: "PEST: Social", impact: "個のリスキリング需要が加速", source: "経済産業省：新機軸のスキル市場調査 (2024)" },
                { factor: "3C: Competitor", impact: "既存大手がカバーできない『個別調整』へのニーズ", source: "User Interview Data (N=45)" }
            ],
            competitors: [
                { name: "既存プラットフォーマーA", share: 55, strength: "ドメイン権威性", weakness: "個別化の欠如", strategy: "ニッチセグメントでの高付加価値化で対抗" },
                { name: "新興テック企業B", share: 12, strength: "UI/UXのモダンさ", weakness: "信頼・実績不足", strategy: "事例の透明性とサポート厚遇による差別化" }
            ],
            trends: [
                { keyword: "AI Agency", growth: "+180%", platform: "LinkedIn / X", reasoning: "B2BでのAI導入を支援する実働部隊への需要急増" },
                { keyword: "Micro-SaaS", growth: "+90%", platform: "Product Hunt", reasoning: "単一の痛みを解決する軽量ツールの需要増" }
            ],
            evidence: [
                { title: "DX白書 2024 (IPA)", url: "https://www.ipa.go.jp/publish/whitepaper/dx.html", date: "2024-03" },
                { title: "Crunchbase: AI Investment Trends", url: "https://www.crunchbase.com/", date: "2024-05" }
            ]
        },
        m20Data: {
            targetPersona: {
                profile: "30代、ITリテラシー中程度の会社員。将来のキャリアに不安を感じ、自らの専門性を活かした副業や独立を模索している。",
                painPoints: ["具体的ステップが不明", "時間的リソースの限界", "技術的障壁"],
                gainPoints: ["専門性の体系化", "自動収益フローの構築", "コミュニティ参加"]
            },
            strategy: {
                coreValue: "AIを活用したパーソナライズ・キャリア・ストラテジー",
                channels: ["X / Note (教育)", "限定Webinar (納得)", "個別Zoom相談 (成約)"],
                pricing: "298,000円 (3ヶ月コーチングプラン)"
            },
            salesFlow: [
                { step: "認知 (SNS)", purpose: "専門性の認知と教育", script: "AI時代のサバイバルスキルを公開中" },
                { step: "比較 (Webinar)", purpose: "手法の有効性の証明", script: "私が実践した最短経路のロードマップを解説" },
                { step: "決断 (相談会)", purpose: "個別の不安払拭とクロージング", script: "あなたの現状なら、このステップが最適です" }
            ],
            actionPlans: [
                { task: "LPプロトタイプ作成", priority: "High", deadline: "Week 2" },
                { task: "N=1ヒアリングの実施", priority: "High", deadline: "Week 1" },
                { task: "広告運用テスト開始", priority: "Mid", deadline: "Week 4" }
            ]
        },
        m30Data: {
            executiveSummary: "本事業は、労働集約的なモデルから脱却し、AIによる自動化と専門性の掛け合わせにより、高い営業利益率（40%超）を早期に実現する高収益型モデルを目指します。",
            plSimulation: [
                { year: 1, revenue: 12000000, profit: 4000000, note: "初期投資と認知獲得フェーズ。赤字を抑えたスモールスタート。" },
                { year: 2, revenue: 48000000, profit: 22000000, note: "LTVの向上と紹介・リピートによる広告費の効率化。" }
            ],
            milestones: [
                { date: "2024-10", event: "MVPリリース", requirement: "アクティブユーザー50名获得", phase: "Launch" },
                { date: "2025-04", event: "シリーズA資金調達", requirement: "月次売上400万円の安定達成", phase: "Scale" }
            ],
            fundingPlan: [
                { method: "日本政策金融公庫（創業融資）", amount: "1,500万円", institutionalSupport: "中小企業経営強化法に基づく支援あり" },
                { method: "IT導入補助金", amount: "450万円", institutionalSupport: "通常枠にて申請予定" }
            ],
            teamProfile: [
                { role: "CEO/Founder", background: "大手コンサル出身、新規事業立ち上げ経験者", strength: "戦略立案、人脈" },
                { role: "Product/AI Lead", background: "フルスタックエンジニア、AI開発経験5年", strength: "迅速なプロトタイピング、技術選定" }
            ],
            riskAnalysis: [
                { factor: "競合大手の参入", impact: "High", solution: "コミュニティ化によるスイッチングコストの増大" },
                { factor: "AI精度への依存", impact: "Mid", solution: "人間の専門家による最終監修プロセスの組み込み" }
            ]
        },
        m50Data: {
            snsStrategy: [
                { platform: "X (Twitter)", frequency: "1日3回投稿", kpis: [{ metric: "公式LINEへの遷移率", target: "3.0%" }] },
                { platform: "Instagram", frequency: "2日に1回投稿", kpis: [{ metric: "保存数", target: "150件/投稿" }] }
            ],
            contentThemes: ["AI×キャリア時短術", "業界の裏側暴露", "成功事例の言語化"],
            headlines: ["【必読】AIで年収を2倍にした3つの習慣", "まだその作業、手動でやってるの？"],
            funnelDesign: [
                { stage: "認知 (ToFU)", action: "無料プレゼント配布", prompt: "リード獲得用電子書籍の目次案を作成" },
                { stage: "信頼 (MoFU)", action: "3日間LINE講座", prompt: "教育用ステップメール案（DAY1-3）を生成" }
            ]
        },
        m60Data: {
            concept: "AIをコーチとして伴走させるキャリア設計プラットフォーム",
            userFlow: [
                { action: "プロフィール・スキル入力", response: "パーソナライズされた課題と適性の抽出" },
                { action: "チャットベースの相談", response: "リアルタイムの戦略提案とタスク生成" }
            ],
            features: [
                { name: "AIキャリア診断", priority: "P0", description: "独自の多角形アルゴリズムによる適正判定" },
                { name: "自動タスク生成", priority: "P1", description: "ガントチャート形式の実行プラン自動作成" }
            ],
            techStack: [
                { category: "Frontend", selection: "Next.js 14", reason: "SEO性能とVercel連携の容易さ" },
                { category: "Backend/AI", selection: "Gemini 1.5 Pro + Vercel AI SDK", reason: "高度な推論とストリーミング対応" },
                { category: "Infrastructure", selection: "Supabase (PostgreSQL)", reason: "リアルタイム機能と認証機能の内包" }
            ],
            dbSchema: [
                { table: "users", columns: [{ name: "id", type: "uuid", note: "PK" }, { name: "email", type: "varchar", note: "Unique" }, { name: "subscription_status", type: "varchar", note: "Free/Pro" }] },
                { table: "analysis_history", columns: [{ name: "id", type: "uuid", note: "PK" }, { name: "user_id", type: "uuid", note: "FK" }, { name: "result_json", type: "jsonb", note: "Main Data" }, { name: "created_at", type: "timestamp", note: "Initial date" }] }
            ],
            apiDesign: [
                { endpoint: "/api/analyze", method: "POST", summary: "ユーザーデータに基づいたAI分析の実行" }
            ]
        },
        m90Data: {
            executiveSummary: "本提案は、AI時代における『個の専門性』の価値を最大化し、効率的かつ持続可能な収益源を構築するための包括的戦略です。",
            strategicVision: "業界の常識を覆すAI伴走型モデルにより、1年以内に市場シェア10%獲得を目指す。",
            coreCompetitiveAdvantage: "AIによる個別体験の極致。競合他社が提供できない『24時間365日のパーソナライズ伴走』。",
            marketOpportunity: "リスキリング市場の急速な拡大と、既存の教育サービスの個別化不足。ここにある数千億円規模のギャップを射抜きます。",
            roadmapSummary: "3ヶ月でMVP検証、6ヶ月でコミュニティ化、12ヶ月でプラットフォーム化。",
            financialHighlights: "2年目で売上4,800万円、利益率45%超の見込み。キャッシュフローの早期安定化。",
            conclusion: "これは単なる計画ではなく、未来への投資です。技術と専門性の融合により、揺るぎない市場ポジションを確立します。"
        }
    };
}

export async function chatWithAI(
    currentAnalysis: AnalysisResult,
    userMessage: string,
    history: { role: "user" | "model"; parts: string }[]
): Promise<{ reply: string }> {
    if (!process.env.GEMINI_API_KEY) {
        return { reply: "（デモモード）AI APIキーが設定されていないため、これは自動応答です。本来ならここで、あなたのプロジェクト「" + currentAnalysis.refinedGoal + "」について詳しく議論できます。" };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: `あなたは戦略コンサルタントです。以下のプロジェクト分析結果を前提に、ユーザーの質問に答えてください。回答は必ず日本語で行ってください。\n\n${JSON.stringify(currentAnalysis)}` }],
            },
            {
                role: "model",
                parts: [{ text: "承知いたしました。プロジェクトの背景と現状の分析結果を全てのモジュールについて理解しました。どのような観点でもアドバイス可能です。" }],
            },
            ...history.map(h => ({ role: h.role, parts: [{ text: h.parts }] }))
        ],
    });

    try {
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return { reply: response.text() };
    } catch (error) {
        console.error("Chat failed:", error);
        return { reply: "申し訳ありません。エラーが発生しました。" };
    }
}
