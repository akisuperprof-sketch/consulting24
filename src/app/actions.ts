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
    // Detailed data for M00 Structure
    m00Data?: {
        problems: string[];
        goals: string[];
        constraints: string[];
        assumptions: string[];
    };
    // Detailed data for M10 Market Analysis
    m10Data?: {
        marketSize: string;
        growthRate: string;
        competitors: { name: string; share: number; strength: string }[];
        trends: string[];
    };
    // Detailed data for M20 Sales Strategy
    m20Data?: {
        targetPersona: string;
        coreValue: string;
        channels: string[];
        actionPlans: { task: string; priority: "High" | "Mid" | "Low" }[];
    };
    // Detailed data for M30 Business Plan
    m30Data?: {
        plSimulation: { year: number; revenue: number; profit: number }[];
        milestones: { phase: string; date: string; event: string }[];
        fundingNeeds: string;
    };
    // Detailed data for M40 Operation
    m40Data?: {
        currentFlow: string[];
        bottlenecks: string[];
        improvementPlan: string[];
    };
    // Detailed data for M50 SNS/Content
    m50Data?: {
        themes: string[];
        schedule: string[];
        kpis: { metric: string; target: string }[];
    };
    // Detailed data for M60 App/System
    m60Data?: {
        concept: string;
        features: string[];
        techStack: string[];
    };
    // Detailed data for M91 Simulation
    m91Data?: {
        scenarios: { name: string; result: string; probability: string }[];
        parameters: { name: string; value: string }[];
    };
    // Detailed data for M99 Custom
    m99Data?: {
        overview: string;
        details: string[];
    };
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
    "marketSize": "市場規模",
    "growthRate": "成長率",
    "competitors": [{ "name": "競合A", "share": 30, "strength": "強み" }],
    "trends": ["トレンド1"]
  },
  "m20Data": {
    "targetPersona": "人物像",
    "coreValue": "強み",
    "channels": ["媒体"],
    "actionPlans": [{ "task": "タスク", "priority": "High" }]
  },
  "m30Data": {
    "plSimulation": [{ "year": 1, "revenue": 100, "profit": 10 }],
    "milestones": [{ "phase": "開発", "date": "Q1", "event": "マイルストーン" }],
    "fundingNeeds": "資金ニーズ"
  },
  "m40Data": {
    "currentFlow": ["現状1", "現状2"],
    "bottlenecks": ["課題1", "課題2"],
    "improvementPlan": ["改善策1", "改善策2"]
  },
  "m50Data": {
    "themes": ["テーマ1", "テーマ2"],
    "schedule": ["投稿頻度など"],
    "kpis": [{ "metric": "指標名", "target": "目標値" }]
  },
  "aiNote": "AIからの判断の背景やアドバイス",
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
    const isStartup = freeText.includes("創業") || freeText.includes("資金") || goals.includes("finance") || goals.includes("bizplan");
    const isPersonal = freeText.includes("副業") || freeText.includes("個人") || goals.includes("sns");
    const isCorporate = freeText.includes("法人") || freeText.includes("効率") || goals.includes("efficiency");

    const selected: AnalysisResult["selectedModules"] = [
        { id: "M00", name: MODULES.M00.name, reason: "全てのプロジェクトの基盤となる構造化のため" }
    ];

    if (goals.includes("revenue") || goals.includes("strategy") || freeText.includes("売上") || freeText.includes("集客") || freeText.includes("顧客")) {
        selected.push({ id: "M20", name: MODULES.M20.name, reason: "売上不振の直接的な打開策を立案するための戦略策定モジュール" });
    }

    if (freeText.includes("競合") || freeText.includes("市場") || goals.includes("strategy") || freeText.includes("PEST") || freeText.includes("分析")) {
        selected.push({ id: "M11", name: MODULES.M11.name, reason: "市場環境と競合状況の客観的な把握が必要なため" });
        selected.push({ id: "M10", name: MODULES.M10.name, reason: "広範な市場トレンドとセグメント探索のため" });
    }

    if (isStartup || freeText.includes("事業計画") || goals.includes("bizplan") || freeText.includes("融資")) {
        selected.push({ id: "M30", name: MODULES.M30.name, reason: "公的機関や金融機関への提出を見据えた事業計画の整理" });
        selected.push({ id: "M31", name: MODULES.M31.name, reason: "最適な資金調達手段の選定と制度の整理" });
    }

    if (freeText.includes("コンテンツ") || freeText.includes("記事") || freeText.includes("SNS") || goals.includes("sns") || freeText.includes("LINE")) {
        selected.push({ id: "M50", name: MODULES.M50.name, reason: "発信内容の具体化と運用設計の支援" });
    }

    if (freeText.includes("アプリ") || freeText.includes("システム") || goals.includes("app") || goals.includes("spec") || freeText.includes("仕様")) {
        selected.push({ id: "M60", name: MODULES.M60.name, reason: "開発要件と画面構成の定義支援" });
    }

    if (isCorporate || freeText.includes("効率") || freeText.includes("DX") || goals.includes("事務") || goals.includes("efficiency")) {
        selected.push({ id: "M40", name: MODULES.M40.name, reason: "業務プロセスの棚卸しと効率化案の提示" });
    }

    if (freeText.includes("シミュレーション") || freeText.includes("数値") || freeText.includes("計算") || freeText.includes("収支")) {
        selected.push({ id: "M91", name: MODULES.M91.name, reason: "数値シミュレーションによる妥当性検証のため" });
    }

    // Deduplicate and limit to 5
    const uniqueMap = new Map();
    selected.forEach(m => uniqueMap.set(m.id, m));
    const uniqueSelected = Array.from(uniqueMap.values()).slice(0, 5);

    // Context-sensitive Data Generation
    const m10Data = isStartup ? {
        marketSize: "2,500億円 (年平均成長率 15.2%)",
        growthRate: "+120% (YoY)",
        competitors: [
            { name: "Unicorn A", share: 45, strength: "ネットワーク効果" },
            { name: "Incumbent B", share: 30, strength: "顧客基盤" },
            { name: "New Entry C", share: 5, strength: "低価格" }
        ],
        trends: ["AIによる自動化の加速", "CtoC取引の拡大", "法規制の緩和"]
    } : {
        marketSize: "1,200億円 (安定推移)",
        growthRate: "+2.5% (YoY)",
        competitors: [
            { name: "大手A社", share: 60, strength: "ブランド力" },
            { name: "地場B社", share: 20, strength: "地域密着" },
            { name: "ネット専業C", share: 10, strength: "価格競争力" }
        ],
        trends: ["高齢化による需要変化", "原材料費の高騰", "職人不足"]
    };

    const m30Data = isStartup ? {
        plSimulation: [
            { year: 1, revenue: 0, profit: -800 },
            { year: 2, revenue: 5000, profit: -200 },
            { year: 3, revenue: 12000, profit: 3000 }
        ],
        milestones: [
            { phase: "Seed", date: "2024/Q2", event: "MVPリリース・検証" },
            { phase: "Series A", date: "2025/Q1", event: "PMF達成・組織拡大" },
            { phase: "Series B", date: "2026/Q3", event: "全国展開・黒字化" }
        ],
        fundingNeeds: "向こう18ヶ月で3,000万円（人件費: 1,500万、マーケ: 1,000万、その他: 500万）"
    } : {
        plSimulation: [
            { year: 1, revenue: 3000, profit: 300 },
            { year: 2, revenue: 3500, profit: 500 },
            { year: 3, revenue: 4200, profit: 800 }
        ],
        milestones: [
            { phase: "基盤強化", date: "3ヶ月後", event: "新システム安定稼働" },
            { phase: "販路拡大", date: "6ヶ月後", event: "新規エリアへの出店" },
            { phase: "多角化", date: "1年後", event: "新商品ラインナップ追加" }
        ],
        fundingNeeds: "設備投資として500万円（自己資金＋公庫融資）"
    };

    const m40Data = isCorporate ? {
        currentFlow: ["FAX受注", "基幹システム手入力", "在庫確認(電話)", "出荷指示書作成"],
        bottlenecks: ["手入力による誤発注(月3件)", "電話確認の待機時間", "紙ベースの保管コスト"],
        improvementPlan: ["Web受発注システムの導入", "在庫連携APIの実装", "完全ペーパーレス化"]
    } : {
        currentFlow: ["問い合わせ確認", "個別メール返信", "入金確認", "サービス提供"],
        bottlenecks: ["返信漏れ", "入金消し込みの手間", "リマインド忘れ"],
        improvementPlan: ["自動送信ツールの活用", "決済リンクの自動発行", "タスク管理一元化"]
    };

    const m60Data = {
        concept: isStartup ? "業界初のAIマッチングアプリ" : "既存会員向け会員証アプリ",
        features: ["ログイン/認証", "プッシュ通知", "マイページ", isStartup ? "AIマッチング" : "ポイント管理", "決済機能"],
        techStack: ["Flutter (Cross Platform)", "Firebase (Backend)", "Stripe (Payment)"]
    };

    return {
        refinedGoal: freeText.length > 5 ? freeText.substring(0, 30) + "..." : "プロジェクトの構造化と戦略立案",
        problemStructure: freeText || "現状の課題は、リソースの分散と優先順位の不明確さにあります。AIによる構造化を通じて、最もインパクトの大きい施策に集中できる環境を整えます。",
        selectedModules: uniqueSelected,
        m00Data: {
            problems: isStartup
                ? ["PMF（市場適合）未達成", "ランウェイ（資金）の枯渇懸念", "開発リソース不足"]
                : ["既存事業の成長鈍化", "アナログ業務による非効率", "新規客の獲得コスト増"],
            goals: isStartup
                ? ["月次成長率20%の達成", "次回ラウンドでの資金調達", "コアファンの獲得"]
                : ["業務時間30%削減", "粗利率の5pt改善", "既存顧客単価アップ"],
            constraints: ["限られた予算", "即効性が求められる", "人的リソースの制約"],
            assumptions: ["潜在需要は確実に存在する", "競合はまだ本格参入していない"]
        },
        m10Data,
        m20Data: {
            targetPersona: isPersonal ? "「なんとなく不安」を抱える20代後半" : "決裁権を持つ中小企業経営者",
            coreValue: isStartup ? "業界を破壊する圧倒的なユーザー体験" : "創業50年の信頼と確かな技術力",
            channels: isPersonal ? ["Instagramリール", "note", "YouTube Shorts"] : ["展示会", "業界紙", "代理店営業"],
            actionPlans: [
                { task: "ターゲットへのヒアリング（N=5）", priority: "High" },
                { task: "競合サービスの徹底分析と比較表作成", priority: "High" },
                { task: "MVP（最小機能版）の仕様策定", priority: "Mid" }
            ]
        },
        m30Data,
        m40Data,
        m50Data: {
            themes: isPersonal
                ? ["副業の始め方", "失敗談", "収益公開"]
                : ["専門知識の解説", "お客様の声", "開発裏話"],
            schedule: ["毎日 20:00", "土日は朝・夜 2回"],
            kpis: [
                { metric: "フォロワー増加数", target: "+500/月" },
                { metric: "エンゲージメント率", target: "5.0%" },
                { metric: "CV数", target: "10件/月" }
            ]
        },
        m60Data,
        theme: freeText || "事業構想",
        aiNote: isStartup
            ? "スタートアップにおいてはスピードが命です。M30で資金計画を固めつつ、M50で認知を広げる同時並行アプローチを推奨します。"
            : "既存の強みを活かしつつ、M40での業務効率化で利益体質を作り、生まれた余力をM20の新規開拓に回すのが定石です。",
        tags: isStartup ? ["急成長", "資金調達", "ピボット"] : ["業務改善", "利益率向上", "DX"]
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
