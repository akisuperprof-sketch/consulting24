"use client";

import { motion } from "framer-motion";
import {
    BarChart3,
    ChevronRight,
    Download,
    History,
    Home,
    Layers,
    LayoutDashboard,
    MessageSquare,
    Plus,
    Save,
    Settings,
    Target,
    Zap,
    AlertCircle,
    CheckCircle2,
    Lock,
    Lightbulb as LightbulbIcon,
    Users,
    ShieldCheck,
    Send,
    Flag,
    TrendingUp,
    Globe,
    FileText,
    Cpu,
    Smartphone,
    Calculator,
    Library, RotateCcw,
    Printer,
    FileDown,
    X,
    Edit3,
    Code,
    Menu,
    Maximize,
    Activity,
    Loader2,
    ArrowUpRight,
    HelpCircle,
    ChevronDown,
    MessageCircle,
    Share2,
    Twitter,
    ArrowRightCircle,
    Package,
    Database,
    Table,
    Search,
    HandCoins,
    ExternalLink
} from "lucide-react";

import { useState, useEffect, useRef, useMemo } from "react";
import { AnalysisResult, chatWithAI } from "@/app/actions";

import { ModuleId, MODULES } from "@/lib/modules";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const NextStepBox = ({ type = "内容" }: { type?: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-6 bg-white border border-slate-200 rounded-[2.5rem] flex items-center justify-between group shadow-sm hover:shadow-md transition-all"
        >
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <LightbulbIcon size={24} />
                </div>
                <div className="text-sm">
                    <p className="text-slate-800 font-bold mb-1">
                        この{type}に間違いや修正があれば右上の<span className="text-indigo-600 group-hover:text-indigo-400 font-black px-1 underline underline-offset-4 decoration-slate-200 transition-colors">編集モード</span>を、修正必要なければ使用して下さい。
                    </p>
                    <p className="text-slate-500 font-medium">
                        左のサイドバーから起動モジュールの次の項目を選びましょう！
                    </p>
                </div>
            </div>
            <div className="hidden lg:block mr-4">
                <ArrowUpRight className="text-slate-200 group-hover:text-indigo-600 transition-all animate-bounce" size={24} />
            </div>
        </motion.div>
    );
};

const GeneratingOverlay = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
    >
        <div className="w-20 h-20 relative mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
            <motion.div
                className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-2">戦略を構築中...</h3>
        <p className="text-slate-500 font-medium">AIが市場データ、競合、最新トレンドを多角的に解析しています。</p>
        <div className="mt-8 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold animate-pulse">
            Analyzing search volume & platform specific trends...
        </div>
    </motion.div>
);

// Helper for simple markdown-like rendering
const MarkdownText = ({ text }: { text: string }) => {
    return (
        <div className="whitespace-pre-wrap leading-relaxed space-y-3 font-medium">
            {text.split('\n').map((line, i) => {
                if (!line.trim()) return <div key={i} className="h-2" />;

                // Handle basic list items
                const isList = line.trim().startsWith('- ') || line.trim().startsWith('* ') || /^\d+\./.test(line.trim());

                // Split by key patterns: Bold (**text**) and URLs (http://...)
                const parts = line.split(/(\*\*.*?\*\*)|(https?:\/\/[^\s]+)/g);

                return (
                    <div key={i} className={cn(isList ? "pl-4 relative" : "")}>
                        {isList && <span className="absolute left-0 top-0 text-blue-400">•</span>}
                        {parts.map((part, j) => {
                            if (!part) return null;

                            if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                    <strong key={j} className="text-slate-900 font-black px-1.5 py-0.5 bg-blue-100/50 rounded border border-blue-200 shadow-sm mx-0.5">
                                        {part.slice(2, -2)}
                                    </strong>
                                );
                            } else if (part.match(/^https?:\/\//)) {
                                return (
                                    <a key={j} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline break-all font-bold inline-flex items-center">
                                        <ExternalLink size={12} className="mr-0.5 inline" />
                                        {part}
                                    </a>
                                );
                            }
                            return <span key={j}>{part}</span>;
                        })}
                    </div>
                );
            })}
        </div>
    );
};

interface DashboardProps {
    analysis: AnalysisResult;
    onRestart: () => void;
    onUpdate?: (data: AnalysisResult) => void;
}

export default function Dashboard({ analysis, onRestart, onUpdate }: DashboardProps) {
    const [activeModule, setActiveModule] = useState<ModuleId>(analysis.selectedModules[0].id);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isPresentationMode, setIsPresentationMode] = useState(false);
    const [showHelp, setShowHelp] = useState(true);

    // Data State (for editing)
    const [data, setData] = useState<AnalysisResult>(analysis);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState("");

    // History State
    const [savedReports, setSavedReports] = useState<{ id: string, date: string, title: string, data: AnalysisResult }[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("consulting_history");
        if (saved) {
            setSavedReports(JSON.parse(saved));
        }
    }, []);

    // Auto-save callback
    useEffect(() => {
        if (onUpdate) {
            onUpdate(data);
        }
    }, [data, onUpdate]);

    const saveToHistory = () => {
        const newReport = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            title: data.refinedGoal,
            data: data
        };
        const updated = [newReport, ...savedReports];
        setSavedReports(updated);
        localStorage.setItem("consulting_history", JSON.stringify(updated));

        setShowExportMenu(false);
    };

    const deleteHistory = (id: string) => {
        const updated = savedReports.filter(r => r.id !== id);
        setSavedReports(updated);
        localStorage.setItem("consulting_history", JSON.stringify(updated));
    };

    const loadHistoryItem = (report: { data: AnalysisResult }) => {
        setData(report.data);
        setActiveModule(report.data.selectedModules[0].id);

    };

    // Sync props to state if props change (optional)
    useEffect(() => {
        setData(analysis);
    }, [analysis]);

    // Chat State
    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState<{ role: "user" | "model"; parts: string }[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    // Sidebar & Chat State
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isM00Blinking, setIsM00Blinking] = useState(false);

    // Simulation states
    const [revenueMultiplier, setRevenueMultiplier] = useState(1.0);
    const [costMultiplier, setCostMultiplier] = useState(1.0);

    const simulatedPL = useMemo(() => {
        if (!data.m30Data) return [];
        return data.m30Data.plSimulation.map(year => ({
            ...year,
            revenue: Math.round(year.revenue * revenueMultiplier),
            profit: Math.round((year.revenue * revenueMultiplier) - ((year.revenue - year.profit) * costMultiplier))
        }));
    }, [data.m30Data, revenueMultiplier, costMultiplier]);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollHint, setShowScrollHint] = useState(false);

    useEffect(() => {
        const checkScroll = () => {
            if (scrollContainerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
                // Show hint if there's more than 100px of scrollable content below
                setShowScrollHint(scrollHeight - clientHeight - scrollTop > 80);
            }
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
            checkScroll();
            // Check again after a short delay for content to render
            const timer = setTimeout(checkScroll, 800);
            return () => {
                container.removeEventListener('scroll', checkScroll);
                clearTimeout(timer);
            };
        }
    }, [activeModule, data]);

    const handleGenerateDetail = () => {
        // Validation: check if base data exists
        if (!data.m00Data || data.m00Data.problems.length === 0) {
            setIsM00Blinking(true);
            setTimeout(() => setIsM00Blinking(false), 3000);
            alert("『構造化整理モジュール（M00）』の情報が不足しています。サイドバーで対象のモジュールを選択し、コアの問題とゴールを確定させてください。");
            return;
        }

        setIsGenerating(true);
        // Simulate AI thinking time
        setTimeout(() => {
            const newData = { ...data };
            let updated = false;
            const isStartup = data.theme?.includes("創業") || data.theme?.includes("スタートアップ") || data.refinedGoal.includes("スタートアップ") || data.tags.includes("急成長");
            const isPersonal = data.theme?.includes("個人") || data.theme?.includes("副業") || data.theme?.includes("自宅") || data.refinedGoal.includes("個人") || data.refinedGoal.includes("副業") || data.refinedGoal.includes("自宅");

            if ((activeModule === "M10" || activeModule === "M11") && !newData.m10Data) {
                newData.m10Data = {
                    growthRate: isPersonal ? "105%" : "125%",
                    marketSize: isPersonal ? "500億円" : "1.2兆円",
                    trends: isPersonal ? ["リモートワークの定着", "個のスキルの収益化", "マイクロ法人"] : ["AIによる個別最適化", "EdTechの普及", "リカレント教育の需要増"],
                    competitors: isPersonal ? [
                        { name: "既存プラットフォーム", share: 70, strength: "集客力" },
                        { name: "個人発信者", share: 20, strength: "親近感" }
                    ] : [
                        { name: "A社 (大手)", share: 45, strength: "ブランド力" },
                        { name: "B社 (新興)", share: 15, strength: "AI技術" }
                    ],
                    evidence: isPersonal ? [
                        { source: "フリーランス実態調査 2024", url: "https://www.lancers.co.jp/news/pr/21568/" },
                        { source: "総務省: 労働力調査報告", url: "https://www.stat.go.jp/data/roudou/index.html" }
                    ] : [
                        { source: "IDC Japan: AI市場予測 2024", url: "https://www.idc.com/jp/report/market-forecast" },
                        { source: "文部科学省: 教育情報化の現状", url: "https://www.mext.go.jp/a_menu/shotou/zyouhou/index.htm" }
                    ]
                };
                updated = true;
            } else if (activeModule === "M20" && !newData.m20Data) {
                newData.m20Data = {
                    targetPersona: isPersonal ? "隙間時間で収入を得たい主婦・会社員" : "30-40代のキャリアアップ志向層",
                    coreValue: isPersonal ? "誰でも再現可能なスモールステップ" : "短期間で実務レベルのAIスキル習得",
                    channels: isPersonal ? ["SNS (X/Instagram)", "ココナラ", "ブログ"] : ["LinkedIn", "Tech系メディア", "ウェビナー"],
                    actionPlans: [
                        { task: isPersonal ? "実績作り（モニター募集）" : "オンライン広告の出稿開始", priority: "High" },
                        { task: "集客導線の設計", priority: "High" }
                    ]
                };
                updated = true;
            } else if ((activeModule === "M30" || activeModule === "M31") && !newData.m30Data) {
                if (isPersonal) {
                    newData.m30Data = {
                        fundingNeeds: "初期投資として5万円（機材・ツール代）程度を想定。自宅作業のため、大きな固定費は発生せず、初月から黒字化を目指す構成。",
                        milestones: [
                            { date: "1ヶ月目", event: "サービス設計・SNS開設", phase: "集客開始" },
                            { date: "3ヶ月目", event: "初収益達成 (3-5万円)", phase: "検証" },
                            { date: "6ヶ月目", event: "月収10万円達成", phase: "安定" }
                        ],
                        plSimulation: [
                            { year: 1, revenue: 1200000, profit: 1000000 },
                            { year: 2, revenue: 1800000, profit: 1500000 },
                            { year: 3, revenue: 2400000, profit: 2000000 },
                            { year: 4, revenue: 3000000, profit: 2500000 },
                            { year: 5, revenue: 4000000, profit: 3200000 }
                        ]
                    };
                } else {
                    newData.m30Data = {
                        fundingNeeds: "初期開発費として2000万円、運転資金として1000万円が必要。初年度は赤字想定だが、2年目以降の急成長で回収予定。",
                        milestones: [
                            { date: "2025-04", event: "プロトタイプ完成", phase: "Seed" },
                            { date: "2025-10", event: "β版リリース", phase: "Early" },
                            { date: "2026-04", event: "正式サービス開始", phase: "Growth" }
                        ],
                        plSimulation: [
                            { year: 1, revenue: 30000000, profit: -10000000 },
                            { year: 2, revenue: 80000000, profit: 5000000 },
                            { year: 3, revenue: 200000000, profit: 50000000 },
                            { year: 4, revenue: 450000000, profit: 120000000 },
                            { year: 5, revenue: 800000000, profit: 250000000 }
                        ]
                    };
                }
                updated = true;
            } else if ((activeModule === "M60" || activeModule === "M61") && !newData.m60Data) {
                newData.m60Data = {
                    concept: isStartup ? "業界初のAIマッチングアプリ" : "既存客向け高効率支援システム",
                    features: ["AIマッチングエンジン", "リアルタイム通知", "ダッシュボード", "決済連携", "履歴管理"],
                    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Gemini API"]
                };
                updated = true;
            } else if (activeModule === "M40" && !newData.m40Data) {
                newData.m40Data = {
                    currentFlow: ["現状1", "現状2"],
                    bottlenecks: ["手作業によるタイムロス", "情報共有の遅れ"],
                    improvementPlan: ["自動化ツールの導入", "チャットボット活用"]
                };
                updated = true;
            } else if (activeModule === "M50" && !newData.m50Data) {
                newData.m50Data = {
                    themes: ["AIトレンド解説", "活用事例紹介"],
                    schedule: ["週3回"],
                    kpis: [
                        { metric: "フォロワー数", target: "1000人" },
                        { metric: "エンゲージメント率", target: "5%" }
                    ]
                };
                updated = true;
            } else if (activeModule === "M21" && !newData.m21Data) {
                newData.m21Data = {
                    seminarStructure: [
                        { section: "問題の深刻化", content: "ターゲットが抱える『不の感情』を言語化し、解決の必要性を共有する", keyTalk: "「このままだと、1年後には競合にリードの半分を奪われる可能性があります。」" },
                        { section: "解決策の提示", content: "『これなら私にもできる』と思わせるシンプルな3ステップを提示", keyTalk: "「まずは『設計』。次に『習慣化』。最後に『自動化』。これだけで未来は変わります。」" },
                        { section: "出口設計", content: "個別相談（導入診断）への限定2択誘導", keyTalk: "「今日お伝えしたのは全体の1割です。残りの9割、あなた専用のプランを個別に組みませんか？」" }
                    ],
                    sessionFlow: [
                        { phase: "冒頭・安心設計", purpose: "時間・目的・特別感の合意", script: "「今日は45分で、あなたの案件に合わせたAI活用法を決めます。全員に提案はしません。」" },
                        { phase: "KGI/KPI設定", purpose: "なりたい姿と数字の言語化", script: "「もし毎日2時間浮いたら、本当は何に時間を使いたいですか？」" },
                        { phase: "梯子落とし", purpose: "一人でやる限界と現実の提示", script: "「独学が難しいのは、ツール選びではなく『自社に合わせた型』がないからです。」" }
                    ],
                    closingStrategy: "説得しない。相手が『必要です』と言った時のみプランを提示する。"
                };
                updated = true;
            } else if (activeModule === "M51" && !newData.m51Data) {
                newData.m51Data = {
                    headlines: [
                        "【実録】AIを相棒にしたら、LPの成約率が1.8倍に跳ねた話",
                        "なぜ、あなたの書く文章は『丁寧なのに売れない』のか？",
                        "【穴埋め式】天才コピーライターの思考を再現する究極のプロンプト"
                    ],
                    brief: {
                        target: "SNSでの集客に行き詰まりを感じている教育マーケター",
                        usp: "心理学×コピーライティング×生成AIプロンプトの三位一体",
                        benefit: "『書く苦しみ』から解放され、勝手に売れる文章が日常的に生成される"
                    },
                    prompts: [
                        { title: "コピー設計ブリーフ", body: "あなたはプロのライターです。以下の商材からターゲットとベネフィットを抽出してください..." },
                        { title: "一括コピー生成", body: "ブリーフを元に、見出し20個とリード文をA/Bテスト前提で出力してください..." }
                    ]
                };
                updated = true;
            } else if (activeModule === "M52" && !newData.m52Data) {
                newData.m52Data = {
                    xPosts: [
                        { type: "教育", draft: "成果を出す人は『道具』より先に『設計図』を整える。AIも同じで、プロンプトより..." },
                        { type: "共感", draft: "毎日PCの前で3時間悩んでいた頃の自分に伝えたい。その悩み、型さえあれば5分で..." },
                        { type: "拡散", draft: "【完全版】誰でも『飛ぶように売れる』文章が作れるプロンプト集をnoteにまとめました。" }
                    ],
                    funnelDesign: "X（日々教育）→ note（深い信頼獲得）→ 個別相談（最終意思決定）"
                };
                updated = true;
            } else if (activeModule === "M91" && !newData.m91Data) {
                newData.m91Data = {
                    scenarios: [
                        { name: "楽観ケース (Best)", result: "利益率 25%達成", probability: "20%" },
                        { name: "基本ケース (Base)", result: "利益率 15%達成", probability: "60%" },
                        { name: "保守ケース (Worst)", result: "利益率 5%確保", probability: "20%" }
                    ],
                    parameters: [
                        { name: "顧客獲得単価 (CPA)", value: "15,000円" },
                        { name: "LTV (ライフタイムバリュー)", value: "120,000円" },
                        { name: "月間成約数", value: "30件" }
                    ]
                };
                updated = true;
            } else if (activeModule === "M12" && !newData.m12Data) {
                newData.m12Data = {
                    trendingKeywords: [
                        { word: "生成AI 活用事例", volume: "24,000", growth: "+150%" },
                        { word: "DX 伴走支援", volume: "12,500", growth: "+85%" },
                        { word: "AIエージェント 開発", volume: "8,200", growth: "+320%" }
                    ],
                    relatedQueries: ["AI 導入 費用", "中小企業 生成AI 補助金", "ChatGPT 業務効率化 事例"],
                    platformStrategy: [
                        { platform: "X (Twitter)", approach: "最新のAIニュース解説と、現場での『具体的な失敗談』の共有で信頼を獲得。" },
                        { platform: "Note / 記事", approach: "『1ヶ月で100時間削減した具体的な方法』といった図解入りの詳細実装ガイド。" }
                    ]
                };
                updated = true;
            } else if (activeModule === "M99" && !newData.m99Data) {
                newData.m99Data = {
                    overview: "カスタムモジュールの分析結果",
                    details: [
                        "ユーザー定義の要件に基づく詳細分析",
                        "課題解決のためのステップ案",
                        "必要なリソースの定義"
                    ]
                };
                updated = true;
            }

            if (updated) {
                setData(newData);
            } else {
                console.log("Data already exists or module not supported");
            }
            setIsGenerating(false);
        }, 1500); // 1.5s delay for effect
    };

    const handleAddCustomModule = () => {
        const newId = "M99" as ModuleId;
        const newModule = { id: newId, name: "カスタムモジュール", reason: "ユーザー追加" };

        // Prevent duplicate
        if (data.selectedModules.find(m => m.id === newId)) {
            setActiveModule(newId);
            return;
        }

        const newData = { ...data, selectedModules: [...data.selectedModules, newModule] };
        setData(newData);
        setActiveModule(newId);

    };


    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const newMessage = { role: "user" as const, parts: chatInput };
        setChatHistory(prev => [...prev, newMessage]);
        setChatInput("");
        setIsChatLoading(true);

        try {
            const result = await chatWithAI(analysis, newMessage.parts, chatHistory);
            setChatHistory(prev => [...prev, { role: "model", parts: result.reply }]);
        } catch (error) {
            console.error(error);
            setChatHistory(prev => [...prev, { role: "model", parts: "エラーが発生しました。もう一度お試しください。" }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
        setShowExportMenu(false);
    };

    const handleDownload = () => {
        const date = new Date().toISOString().split('T')[0];
        let content = `# AI Business Strategy Report\nDate: ${date}\nProject: ${analysis.refinedGoal}\n\n`;
        content += `## AI Advisor Note\n${analysis.aiNote}\n\n`;

        content += `## Selected Modules\n`;
        analysis.selectedModules.forEach(m => {
            content += `- ${m.name}: ${m.reason}\n`;
        });
        content += `\n`;

        if (data.m00Data) {
            content += `## M00: Structure\n`;
            content += `### Problems\n${data.m00Data.problems.map(p => `- ${p}`).join('\n')}\n`;
            content += `### Goals\n${data.m00Data.goals.map(g => `- ${g}`).join('\n')}\n`;
        }

        if (data.m10Data) {
            content += `\n## M10: Market Analysis\n`;
            content += `Growth Rate: ${data.m10Data.growthRate}\n`;
            content += `Market Size: ${data.m10Data.marketSize}\n`;
            content += `Trends: ${data.m10Data.trends.join(', ')}\n`;
        }

        if (data.m20Data) {
            content += `\n## M20: Sales Strategy\n`;
            content += `Target: ${data.m20Data.targetPersona}\n`;
            content += `Core Value: ${data.m20Data.coreValue}\n`;
            content += `Channels: ${data.m20Data.channels.join(', ')}\n`;
        }

        if (data.m30Data) {
            content += `\n## M30: Business & Financing\n`;
            content += `Funding Needs: ${data.m30Data.fundingNeeds}\n`;
            content += `Milestones:\n${data.m30Data.milestones.map(m => `- ${m.date}: ${m.event} (${m.phase})`).join('\n')}\n`;
        }

        if (data.m40Data) {
            content += `\n## M40: Operations\n`;
            content += `Bottlenecks:\n${data.m40Data.bottlenecks.map(b => `- ${b}`).join('\n')}\n`;
            content += `Improvement Plan:\n${data.m40Data.improvementPlan.map((p, i) => `- ${i + 1}. ${p}`).join('\n')}\n`;
        }

        if (data.m50Data) {
            content += `\n## M50: SNS & Content\n`;
            content += `Themes: ${data.m50Data.themes.join(', ')}\n`;
            content += `KPIs:\n${data.m50Data.kpis.map(k => `- ${k.metric}: ${k.target}`).join('\n')}\n`;
        }


        // Add more sections as needed...

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `strategy_report_${date}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Generic deep update helper
    const updateData = (updater: (prev: AnalysisResult) => AnalysisResult) => {
        setData(prev => {
            const newData = updater(prev);
            return newData;
        });
    };

    const updateM00 = (field: 'problems' | 'goals' | 'constraints' | 'assumptions', index: number, value: string) => {
        updateData(prev => {
            if (!prev.m00Data) return prev;
            const next = { ...prev, m00Data: { ...prev.m00Data } };
            const list = [...next.m00Data[field]];
            list[index] = value;
            next.m00Data[field] = list;
            return next;
        });
    };

    const updateM10 = (field: keyof NonNullable<AnalysisResult['m10Data']>, index: number, subField: string | null, value: any) => {
        updateData(prev => {
            if (!prev.m10Data) return prev;
            const next = { ...prev, m10Data: { ...prev.m10Data } };
            if (Array.isArray(next.m10Data[field])) {
                const arr = [...(next.m10Data[field] as any[])];
                if (index >= 0 && subField) {
                    arr[index] = { ...arr[index], [subField]: value };
                } else if (index >= 0) {
                    arr[index] = value;
                }
                (next.m10Data as any)[field] = arr;
            }
            return next;
        });
    };

    const updateM12 = (field: keyof NonNullable<AnalysisResult['m12Data']>, index: number, subField: string | null, value: any) => {
        updateData(prev => {
            if (!prev.m12Data) return prev;
            const next = { ...prev, m12Data: { ...prev.m12Data } };
            if (Array.isArray(next.m12Data[field])) {
                const arr = [...(next.m12Data[field] as any[])];
                if (index >= 0 && subField) {
                    arr[index] = { ...arr[index], [subField]: value };
                } else if (index >= 0) {
                    arr[index] = value;
                }
                (next.m12Data as any)[field] = arr;
            }
            return next;
        });
    };

    const updateM20 = (field: keyof NonNullable<AnalysisResult['m20Data']>, index: number = -1, subField: string | null = null, value: any) => {
        updateData(prev => {
            if (!prev.m20Data) return prev;
            const next = { ...prev, m20Data: { ...prev.m20Data } };
            if (field === 'targetPersona' && subField) {
                next.m20Data.targetPersona = { ...next.m20Data.targetPersona, [subField]: value };
            } else if (field === 'strategy' && subField) {
                next.m20Data.strategy = { ...next.m20Data.strategy, [subField]: value };
            } else if (Array.isArray(next.m20Data[field]) && index >= 0) {
                const arr = [...(next.m20Data[field] as any[])];
                if (subField) {
                    arr[index] = { ...arr[index], [subField]: value };
                } else {
                    arr[index] = value;
                }
                (next.m20Data as any)[field] = arr;
            }
            return next;
        });
    };

    const updateM21 = (field: keyof NonNullable<AnalysisResult['m21Data']>, index: number, subField: string | null, value: any) => {
        updateData(prev => {
            if (!prev.m21Data) return prev;
            const next = { ...prev, m21Data: { ...prev.m21Data } };
            if (field === 'closingStrategy') {
                next.m21Data.closingStrategy = value;
            } else if (Array.isArray(next.m21Data[field])) {
                const arr = [...(next.m21Data[field] as any[])];
                if (index >= 0 && subField) {
                    arr[index] = { ...arr[index], [subField]: value };
                } else if (index >= 0) {
                    arr[index] = value;
                }
                (next.m21Data as any)[field] = arr;
            }
            return next;
        });
    };

    const updateM30 = (field: keyof NonNullable<AnalysisResult['m30Data']>, index: number, subField: string | null, value: any) => {
        updateData(prev => {
            if (!prev.m30Data) return prev;
            const next = { ...prev, m30Data: { ...prev.m30Data } };
            if (field === 'executiveSummary') {
                next.m30Data.executiveSummary = value;
            } else if (Array.isArray(next.m30Data[field])) {
                const arr = [...(next.m30Data[field] as any[])];
                if (index >= 0 && subField) {
                    arr[index] = { ...arr[index], [subField]: value };
                } else if (index >= 0) {
                    arr[index] = value;
                }
                (next.m30Data as any)[field] = arr;
            }
            return next;
        });
    };

    const updateM40 = (field: keyof NonNullable<AnalysisResult['m40Data']>, index: number, subField: string | null, value: any) => {
        updateData(prev => {
            if (!prev.m40Data) return prev;
            const next = { ...prev, m40Data: { ...prev.m40Data } };
            if (field === 'costReduction') {
                next.m40Data.costReduction = value;
            } else if (Array.isArray(next.m40Data[field])) {
                const arr = [...(next.m40Data[field] as any[])];
                if (index >= 0 && subField) {
                    arr[index] = { ...arr[index], [subField]: value };
                } else if (index >= 0) {
                    arr[index] = value;
                }
                (next.m40Data as any)[field] = arr;
            }
            return next;
        });
    };

    const updateM50 = (field: keyof NonNullable<AnalysisResult['m50Data']>, index: number, subField: string | null, value: any) => {
        updateData(prev => {
            if (!prev.m50Data) return prev;
            const next = { ...prev, m50Data: { ...prev.m50Data } };
            if (Array.isArray(next.m50Data[field])) {
                const arr = [...(next.m50Data[field] as any[])];
                if (index >= 0 && subField) {
                    arr[index] = { ...arr[index], [subField]: value };
                } else if (index >= 0) {
                    arr[index] = value;
                }
                (next.m50Data as any)[field] = arr;
            }
            return next;
        });
    };

    const updateM51 = (field: keyof NonNullable<AnalysisResult['m51Data']>, index: number, subField: string | null, value: any) => {
        updateData(prev => {
            if (!prev.m51Data) return prev;
            const next = { ...prev, m51Data: { ...prev.m51Data } };
            if (field === 'brief' && subField) {
                (next.m51Data.brief as any)[subField] = value;
            } else if (Array.isArray(next.m51Data[field])) {
                const arr = [...(next.m51Data[field] as any[])];
                if (index >= 0 && subField) {
                    arr[index] = { ...arr[index], [subField]: value };
                } else if (index >= 0) {
                    arr[index] = value;
                }
                (next.m51Data as any)[field] = arr;
            }
            return next;
        });
    };

    const updateM52 = (field: keyof NonNullable<AnalysisResult['m52Data']>, index: number, subField: string | null, value: any) => {
        updateData(prev => {
            if (!prev.m52Data) return prev;
            const next = { ...prev, m52Data: { ...prev.m52Data } };
            if (field === 'funnelDesign') {
                next.m52Data.funnelDesign = value;
            } else if (Array.isArray(next.m52Data[field])) {
                const arr = [...(next.m52Data[field] as any[])];
                if (index >= 0 && subField) {
                    arr[index] = { ...arr[index], [subField]: value };
                } else if (index >= 0) {
                    arr[index] = value;
                }
                (next.m52Data as any)[field] = arr;
            }
            return next;
        });
    };

    const updateM60 = (field: keyof NonNullable<AnalysisResult['m60Data']>, index: number, subField: string | null, value: any) => {
        updateData(prev => {
            if (!prev.m60Data) return prev;
            const next = { ...prev, m60Data: { ...prev.m60Data } };
            if (field === 'concept') {
                next.m60Data.concept = value;
            } else if (field === 'systemDefinition' && subField) {
                next.m60Data.systemDefinition = { ...(next.m60Data.systemDefinition || { name: "", purpose: "", successDefinition: "", targetUser: "" }), [subField]: value };
            } else if (Array.isArray(next.m60Data[field])) {
                const arr = [...(next.m60Data[field] as any[])];
                if (index >= 0 && subField) {
                    arr[index] = { ...arr[index], [subField]: value };
                } else if (index >= 0) {
                    arr[index] = value;
                }
                (next.m60Data as any)[field] = arr;
            }
            return next;
        });
    };

    const updateM90 = (field: keyof NonNullable<AnalysisResult['m90Data']>, value: string) => {
        updateData(prev => {
            if (!prev.m90Data) return prev;
            return { ...prev, m90Data: { ...prev.m90Data, [field]: value } };
        });
    };

    const updateM91 = (field: 'scenarios' | 'parameters', index: number, subField: string | null, value: string) => {
        updateData(prev => {
            if (!prev.m91Data) return prev;
            const next = { ...prev, m91Data: { ...prev.m91Data } };
            const arr = [...(next.m91Data[field] as any[])];
            if (index >= 0 && subField) {
                arr[index] = { ...arr[index], [subField]: value };
            } else if (index >= 0 && field === 'parameters') {
                arr[index] = { ...arr[index], value: value };
            }
            (next.m91Data as any)[field] = arr;
            return next;
        });
    };

    const updateM99 = (field: 'overview' | 'details', index: number = -1, value: string) => {
        updateData(prev => {
            if (!prev.m99Data) return prev;
            const next = { ...prev, m99Data: { ...prev.m99Data } };
            if (field === 'details' && index >= 0) {
                const list = [...next.m99Data.details];
                list[index] = value;
                next.m99Data.details = list;
            } else if (field === 'overview') {
                next.m99Data.overview = value;
            }
            return next;
        });
    };

    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden print:h-auto print:overflow-visible relative">
            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar (Hidden in Presentation Mode) */}
            {!isPresentationMode && (
                <aside
                    onMouseEnter={() => setIsSidebarExpanded(true)}
                    onMouseLeave={() => setIsSidebarExpanded(false)}
                    className={cn(
                        "bg-white border-r border-slate-200 flex flex-col print:hidden fixed inset-y-0 left-0 z-50 transition-all duration-300 lg:static lg:translate-x-0 overflow-hidden",
                        isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
                        isSidebarExpanded ? "lg:w-72 shadow-2xl" : "lg:w-20"
                    )}
                >
                    <div className="p-6">
                        <div className={cn("flex items-center space-x-3 mb-8 transition-all", isSidebarExpanded ? "opacity-100" : "justify-center")}>
                            <div className="w-8 h-8 min-w-[32px] bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <Zap size={20} />
                            </div>
                            {isSidebarExpanded && <span className="font-bold text-xl tracking-tight whitespace-nowrap">AI Strategy</span>}
                        </div>
                        <nav className="space-y-1">
                            {isSidebarExpanded && (
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3 whitespace-nowrap">
                                    起動モジュール
                                </div>
                            )}
                            {data.selectedModules.map((m) => {
                                const isM00 = m.id === "M00";
                                const module_has_data = (() => {
                                    switch (m.id) {
                                        case "M00": return !!data.m00Data;
                                        case "M10": case "M11": return !!data.m10Data;
                                        case "M12": return !!data.m12Data;
                                        case "M20": return !!data.m20Data;
                                        case "M21": return !!data.m21Data;
                                        case "M30": case "M31": return !!data.m30Data;
                                        case "M40": return !!data.m40Data;
                                        case "M50": return !!data.m50Data;
                                        case "M51": return !!data.m51Data;
                                        case "M52": return !!data.m52Data;
                                        case "M60": case "M61": return !!data.m60Data;
                                        case "M91": return !!data.m91Data;
                                        case "M99": return !!data.m99Data;
                                        default: return false;
                                    }
                                })();

                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => { setActiveModule(m.id); setIsMobileMenuOpen(false); }}
                                        className={cn(
                                            "w-full flex items-center px-3 py-2.5 rounded-xl transition-all whitespace-nowrap group",
                                            activeModule === m.id
                                                ? "bg-blue-50 text-blue-600 font-bold shadow-sm"
                                                : "text-slate-600 hover:bg-slate-50",
                                            !isSidebarExpanded && "justify-center px-0",
                                            isM00 && isM00Blinking && "animate-pulse ring-2 ring-blue-500 ring-offset-2 bg-blue-100"
                                        )}
                                    >
                                        <div className="relative">
                                            <Layers
                                                size={18}
                                                className={cn(
                                                    "opacity-70 flex-shrink-0 transition-all",
                                                    isSidebarExpanded ? "mr-3" : "mr-0",
                                                    module_has_data ? "text-blue-500 opacity-100" : "text-slate-400 font-normal",
                                                    !module_has_data && activeModule === m.id && "animate-pulse scale-110"
                                                )}
                                            />
                                            {module_has_data && (
                                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                                    <div className="w-1 h-1 bg-white rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                        {isSidebarExpanded && <span className={cn("text-sm", !module_has_data && "opacity-70 font-medium")}>{m.name}</span>}
                                        {isSidebarExpanded && activeModule === m.id && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />}
                                    </button>
                                );
                            })}

                            {/* Unselected Modules */}
                            {isSidebarExpanded && (
                                <div className="mt-6 mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    その他 (利用可能)
                                </div>
                            )}
                            {Object.values(MODULES)
                                .filter(m => !data.selectedModules.some(sm => sm.id === m.id) && !["M90", "M91", "M92"].includes(m.id))
                                .map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => {
                                            setActiveModule(m.id);
                                            setIsMobileMenuOpen(false);
                                            // Proactively add to selected modules if not already there
                                            if (!data.selectedModules.some(sm => sm.id === m.id)) {
                                                const newModule = { id: m.id, name: m.name, reason: "個別リサーチ対象に追加" };
                                                setData({
                                                    ...data,
                                                    selectedModules: [...data.selectedModules, newModule]
                                                });
                                            }
                                        }}
                                        className={cn(
                                            "w-full flex items-center px-3 py-2 rounded-lg transition-all whitespace-nowrap opacity-60 hover:opacity-100",
                                            activeModule === m.id ? "bg-slate-100 text-slate-900 font-bold opacity-100" : "text-slate-500 hover:bg-slate-50",
                                            !isSidebarExpanded && "justify-center px-0"
                                        )}
                                    >
                                        <Layers size={16} className={cn("flex-shrink-0", isSidebarExpanded ? "mr-3" : "mr-0")} />
                                        {isSidebarExpanded && <span className="text-xs">{m.name}</span>}
                                    </button>
                                ))
                            }

                            <div className="my-4 border-t border-slate-100" />
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
                                ユーティリティ
                            </div>
                            <button
                                onClick={() => setActiveModule("M92")}
                                className={cn(
                                    "w-full flex items-center px-3 py-2.5 rounded-xl transition-all whitespace-nowrap",
                                    activeModule === "M92"
                                        ? "bg-purple-50 text-purple-600 font-bold shadow-sm"
                                        : "text-slate-600 hover:bg-slate-50",
                                    !isSidebarExpanded && "justify-center px-0"
                                )}
                            >
                                <Library size={18} className={cn("opacity-70 flex-shrink-0", isSidebarExpanded ? "mr-3" : "mr-0")} />
                                {isSidebarExpanded && <span className="text-sm">履歴管理 (M92)</span>}
                            </button>
                        </nav>
                    </div>

                    <div className={cn("mt-auto p-6 space-y-4 text-center pb-24 lg:pb-6", !isSidebarExpanded && "p-2 pb-24")}>
                        {isSidebarExpanded && (
                            <button
                                onClick={onRestart}
                                className="w-full flex items-center justify-center px-4 py-3 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all border border-slate-100 group"
                            >
                                <History size={18} className="mr-3 group-hover:rotate-[-45deg] transition-transform" />
                                <span className="text-sm font-bold">最初からやり直す</span>
                            </button>
                        )}
                        <div className={cn("p-4 bg-slate-900 text-white rounded-2xl transition-all overflow-hidden text-left", !isSidebarExpanded && "p-2 flex items-center justify-center")}>
                            {isSidebarExpanded ? (
                                <>
                                    <div className="text-xs opacity-70 mb-1">現在のフェーズ</div>
                                    <div className="text-sm font-bold whitespace-nowrap mb-3">戦略策定・構造化</div>

                                    <div className="pt-3 border-t border-slate-700 relative">
                                        <div className="flex items-center text-xs font-bold text-blue-300 mb-2">
                                            <ArrowUpRight size={14} className="mr-1" />
                                            <span>次のおすすめアクション</span>
                                        </div>
                                        <div className="p-3 bg-slate-800/50 rounded-lg border border-blue-500/30 text-[11px] text-slate-200 leading-relaxed relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                                            各モジュールの<span className="font-bold text-white">「詳細データを生成」</span>ボタンを押し、分析を完了させてください。
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <Activity size={18} />
                            )}
                        </div>
                    </div>
                </aside>
            )
            }

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative print:block print:overflow-visible print:h-auto">
                <header className={cn(
                    "h-16 lg:h-20 bg-white/70 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10 font-medium print:relative print:border-none print:px-0 print:mb-8 transition-all",
                    isPresentationMode && "h-14 bg-transparent border-none"
                )}>
                    <div className="flex items-center space-x-2 text-sm max-w-[70%]">
                        {!isPresentationMode && (
                            <button
                                className="mr-2 p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                <Menu size={20} />
                            </button>
                        )}
                        {!isPresentationMode && (
                            <div className="flex items-center bg-slate-100 px-2 py-1 rounded-lg mr-3 print:hidden">
                                <span className="text-slate-500 text-[10px] font-black font-mono">ID: {data.id || "---"}</span>
                            </div>
                        )}
                        {isEditingTitle ? (
                            <input
                                className="font-bold text-slate-900 text-lg lg:text-xl border-b-2 border-blue-500 focus:outline-none bg-transparent"
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                autoFocus
                                onBlur={() => {
                                    setData({ ...data, title: tempTitle });
                                    setIsEditingTitle(false);
                                }}
                                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur() }}
                            />
                        ) : (
                            <span
                                onClick={() => { setTempTitle(data.title || data.refinedGoal); setIsEditingTitle(true); }}
                                className={cn("font-bold text-slate-900 text-lg lg:text-xl print:text-3xl truncate transition-all max-w-[200px] lg:max-w-md cursor-pointer hover:underline decoration-slate-300 underline-offset-4", isPresentationMode && "text-2xl lg:text-3xl max-w-full")}
                            >
                                {data.title || data.refinedGoal}
                            </span>
                        )}
                        {!isEditingTitle && !isPresentationMode && <Edit3 size={14} className="ml-2 text-slate-300" />}
                    </div>
                    <div className="flex items-center space-x-2 lg:space-x-4 print:hidden">
                        {isPresentationMode ? (
                            <button
                                onClick={() => setIsPresentationMode(false)}
                                className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-black transition-colors"
                            >
                                Exit Presentation
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowHelp(true)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors mr-1"
                                    title="使い方ガイド"
                                >
                                    <HelpCircle size={20} />
                                </button>
                                <button
                                    onClick={() => setIsPresentationMode(true)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                    title="Start Presentation"
                                >
                                    <Maximize size={20} />
                                </button>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={cn(
                                        "flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                        isEditing ? "bg-green-600 text-white shadow-lg shadow-green-200" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                                    )}
                                >
                                    {isEditing ? <Save size={16} className="mr-2" /> : <Edit3 size={16} className="mr-2" />}
                                    {isEditing ? "保存して完了" : "編集モード"}
                                </button>

                                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                    <MessageSquare size={20} />
                                </button>

                                <div className="relative">
                                    <button
                                        onClick={() => setShowExportMenu(!showExportMenu)}
                                        className="flex items-center px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-black transition-colors"
                                    >
                                        <Download size={16} className="mr-2" />
                                        出力を生成
                                    </button>

                                    {showExportMenu && (
                                        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                                            <button
                                                onClick={handlePrint}
                                                className="w-full flex items-center px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-bold"
                                            >
                                                <Printer size={16} className="mr-3 text-blue-500" />
                                                PDFレポート (Print)
                                            </button>
                                            <button
                                                onClick={saveToHistory}
                                                className="w-full flex items-center px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-bold"
                                            >
                                                <Save size={16} className="mr-3 text-purple-500" />
                                                現在の状態を保存
                                            </button>
                                            <button
                                                onClick={handleDownload}
                                                className="w-full flex items-center px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-bold"
                                            >
                                                <FileDown size={16} className="mr-3 text-emerald-500" />
                                                Markdown形式
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* Canvas */}
                <div
                    ref={scrollContainerRef}
                    className={cn(
                        "flex-1 overflow-y-auto p-2 lg:p-4 space-y-3 bg-[#f8fafc] transition-all relative scroll-smooth",
                        isPresentationMode && "bg-white p-6 lg:p-12"
                    )}
                >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-2">
                        <div className="flex items-center space-x-4 w-full">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                {activeModule === "M92" ? "履歴管理" : data.selectedModules.find(m => m.id === activeModule)?.name}
                            </h2>
                            {activeModule !== "M92" && (
                                <span className="hidden sm:inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full uppercase tracking-widest font-black border border-blue-100">
                                    Ready for Deep Analysis
                                </span>
                            )}
                        </div>
                        {activeModule !== "M92" && (
                            <div className="flex items-center space-x-2 w-full lg:w-auto mt-2 lg:mt-0">
                                {/* Only "Consult AI" button should be here. "Generate" is in module body. */}
                                <button
                                    onClick={() => {
                                        const el = document.getElementById('ai-advisor-section');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="flex-1 lg:flex-none px-4 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold transition-all active:scale-95 flex items-center shadow-sm"
                                >
                                    <MessageSquare size={14} className="mr-2 text-indigo-500" />
                                    AIアドバイザーに相談
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Analysis Workspace (Full Width now) */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-4 lg:p-8 min-h-[500px] relative overflow-hidden">
                                {/* Watermark for skeleton */}
                                <div className="absolute top-10 right-10 flex items-center space-x-2 text-slate-50 select-none pointer-events-none">
                                    <BarChart3 size={90} className="rotate-12 opacity-30" />
                                </div>

                                <div className="relative z-10">
                                    {/* M00: Structure */}
                                    {activeModule === "M00" && data.m00Data && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                                                <div className="space-y-6">
                                                    <div className="flex items-center space-x-3 text-rose-600 font-black text-xs uppercase tracking-widest">
                                                        <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">!</div>
                                                        <span>課題 (Core Problems)</span>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {data.m00Data.problems.map((p, i) => (
                                                            <motion.div
                                                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                                                key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-medium leading-relaxed font-sans"
                                                            >
                                                                {isEditing ? (
                                                                    <textarea
                                                                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-900 resize-none h-auto"
                                                                        rows={2}
                                                                        value={p}
                                                                        onChange={(e) => updateM00('problems', i, e.target.value)}
                                                                    />
                                                                ) : p}
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-6">
                                                    <div className="flex items-center space-x-3 text-blue-600 font-black text-xs uppercase tracking-widest">
                                                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">✓</div>
                                                        <span>目標 (Target Goals)</span>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {data.m00Data.goals.map((g, i) => (
                                                            <motion.div
                                                                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                                                key={i} className="p-5 bg-blue-50/30 border border-blue-100/50 rounded-2xl text-slate-700 font-medium leading-relaxed italic font-sans"
                                                            >
                                                                {isEditing ? (
                                                                    <textarea
                                                                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-900 resize-none h-auto"
                                                                        rows={2}
                                                                        value={g}
                                                                        onChange={(e) => updateM00('goals', i, e.target.value)}
                                                                    />
                                                                ) : g}
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-6">
                                                    <div className="flex items-center space-x-3 text-amber-600 font-black text-xs uppercase tracking-widest">
                                                        <Lock size={14} />
                                                        <span>制約条件 (Constraints)</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {data.m00Data.constraints.map((c, i) => (
                                                            <div key={i} className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 text-[13px] font-bold text-amber-700">
                                                                {isEditing ? (
                                                                    <input className="bg-transparent border-b border-amber-200 outline-none w-24" value={c} onChange={(e) => updateM00('constraints', i, e.target.value)} />
                                                                ) : c}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-6">
                                                    <div className="flex items-center space-x-3 text-slate-500 font-black text-xs uppercase tracking-widest">
                                                        <LightbulbIcon size={14} />
                                                        <span>前提条件 (Assumptions)</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {data.m00Data.assumptions.map((a, i) => (
                                                            <div key={i} className="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-600">
                                                                {isEditing ? (
                                                                    <input className="bg-transparent border-b border-slate-300 outline-none w-24" value={a} onChange={(e) => updateM00('assumptions', i, e.target.value)} />
                                                                ) : a}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <NextStepBox type="構造" />
                                        </div>
                                    )}

                                    {/* M20: Sales Strategy */}
                                    {activeModule === "M20" && !data.m20Data && (
                                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-80 animate-in fade-in zoom-in duration-300">
                                            <Users size={56} className="text-indigo-200 mb-4" />
                                            <h3 className="text-lg font-bold text-slate-800 mb-2">販売戦略・ターゲットの定義</h3>
                                            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
                                                {data.theme ? `「${data.theme}」に` : ""}最適なターゲットペルソナと<br />
                                                具体的なアクションプランを策定します。
                                            </p>
                                            <button
                                                onClick={handleGenerateDetail}
                                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all flex items-center"
                                            >
                                                <Zap className="mr-2" size={18} fill="currentColor" />
                                                詳細データを生成する
                                            </button>
                                        </div>
                                    )}
                                    {activeModule === "M20" && data.m20Data && (
                                        <div className="space-y-8">
                                            {/* Persona Section */}
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                <div className="lg:col-span-2 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                                                    <div className="flex items-center space-x-2 text-indigo-600 mb-4">
                                                        <Users size={20} />
                                                        <span className="text-xs font-black uppercase tracking-widest">Target Persona Profile</span>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {isEditing ? (
                                                            <textarea
                                                                className="w-full text-lg font-bold text-slate-800 bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-indigo-500"
                                                                value={data.m20Data.targetPersona.profile}
                                                                onChange={(e) => updateM20('targetPersona', -1, 'profile', e.target.value)}
                                                                rows={3}
                                                            />
                                                        ) : (
                                                            <p className="text-lg font-bold text-slate-800 leading-tight">{data.m20Data.targetPersona.profile}</p>
                                                        )}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <span className="text-[10px] font-black text-rose-500 uppercase">Pain Points (現有課題)</span>
                                                                <ul className="space-y-1">
                                                                    {data.m20Data.targetPersona.painPoints.map((p, i) => (
                                                                        <li key={i} className="text-sm text-slate-600 flex items-start">
                                                                            <span className="text-rose-400 mr-2">✕</span>
                                                                            {isEditing ? (
                                                                                <input className="w-full bg-transparent border-b border-rose-100 focus:outline-none" value={p} onChange={(e) => {
                                                                                    const list = [...data.m20Data!.targetPersona.painPoints];
                                                                                    list[i] = e.target.value;
                                                                                    updateM20('targetPersona', -1, 'painPoints', list);
                                                                                }} />
                                                                            ) : p}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <span className="text-[10px] font-black text-emerald-500 uppercase">Gain Points (期待価値)</span>
                                                                <ul className="space-y-1">
                                                                    {data.m20Data.targetPersona.gainPoints.map((g, i) => (
                                                                        <li key={i} className="text-sm text-slate-600 flex items-start">
                                                                            <span className="text-emerald-400 mr-2">✓</span>
                                                                            {isEditing ? (
                                                                                <input className="w-full bg-transparent border-b border-emerald-100 focus:outline-none" value={g} onChange={(e) => {
                                                                                    const list = [...data.m20Data!.targetPersona.gainPoints];
                                                                                    list[i] = e.target.value;
                                                                                    updateM20('targetPersona', -1, 'gainPoints', list);
                                                                                }} />
                                                                            ) : g}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-100 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-center space-x-2 text-indigo-200 mb-6">
                                                            <ShieldCheck size={20} />
                                                            <span className="text-xs font-black uppercase tracking-widest">Core Strategy</span>
                                                        </div>
                                                        <div className="space-y-6">
                                                            <div>
                                                                <label className="text-[10px] text-indigo-300 font-bold uppercase block mb-1">Value Proposition</label>
                                                                {isEditing ? (
                                                                    <input className="w-full bg-indigo-500 border-none rounded p-1 text-sm font-bold" value={data.m20Data.strategy.coreValue} onChange={(e) => updateM20('strategy', -1, 'coreValue', e.target.value)} />
                                                                ) : (
                                                                    <div className="text-lg font-black leading-tight">{data.m20Data.strategy.coreValue}</div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-indigo-300 font-bold uppercase block mb-1">Pricing Model</label>
                                                                {isEditing ? (
                                                                    <input className="w-full bg-indigo-500 border-none rounded p-1 text-sm font-bold" value={data.m20Data.strategy.pricing} onChange={(e) => updateM20('strategy', -1, 'pricing', e.target.value)} />
                                                                ) : (
                                                                    <div className="text-xl font-black">{data.m20Data.strategy.pricing}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sales Flow Section */}
                                            <div className="space-y-4">
                                                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest px-4 flex items-center">
                                                    <Zap className="mr-2" size={12} />
                                                    Strategic Sales Flow (成約導線設計)
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {data.m20Data.salesFlow.map((flow, i) => (
                                                        <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl relative overflow-hidden group hover:bg-white hover:shadow-lg transition-all">
                                                            <div className="absolute top-0 right-0 p-2 text-slate-100 font-black text-6xl select-none leading-none group-hover:text-indigo-50 transition-colors">
                                                                0{i + 1}
                                                            </div>
                                                            <div className="relative z-10">
                                                                <div className="text-xs font-black text-indigo-600 mb-1">{isEditing ? <input className="w-full bg-transparent border-b border-indigo-200" value={flow.step} onChange={(e) => updateM20('salesFlow', i, 'step', e.target.value)} /> : flow.step}</div>
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-3">{isEditing ? <input className="w-full bg-transparent border-b border-slate-200" value={flow.purpose} onChange={(e) => updateM20('salesFlow', i, 'purpose', e.target.value)} /> : flow.purpose}</div>
                                                                <div className="bg-white/80 rounded-xl p-3 border border-slate-200/50 text-sm font-medium text-slate-700 italic">
                                                                    「{isEditing ? <textarea className="w-full bg-transparent border-none resize-none p-0 focus:ring-0" rows={2} value={flow.script} onChange={(e) => updateM20('salesFlow', i, 'script', e.target.value)} /> : flow.script}」
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Action Plan Section */}
                                            <div className="space-y-4">
                                                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest px-4 flex items-center">
                                                    <TrendingUp className="mr-2" size={12} />
                                                    Critical Action Plan
                                                </h4>
                                                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">Deadline</th>
                                                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">Task</th>
                                                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">Priority</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {data.m20Data.actionPlans.map((plan, i) => (
                                                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                                    <td className="px-6 py-4 text-xs font-bold text-slate-400 w-24">
                                                                        {isEditing ? <input className="w-full bg-transparent border-b border-slate-200" value={plan.deadline} onChange={(e) => updateM20('actionPlans', i, 'deadline', e.target.value)} /> : plan.deadline}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm font-bold text-slate-700 border-l border-slate-50">
                                                                        {isEditing ? <input className="w-full bg-transparent border-b border-indigo-200" value={plan.task} onChange={(e) => updateM20('actionPlans', i, 'task', e.target.value)} /> : plan.task}
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        {isEditing ? (
                                                                            <select className="text-xs font-black uppercase tracking-tighter bg-slate-100 rounded px-2 py-1" value={plan.priority} onChange={(e) => updateM20('actionPlans', i, 'priority', e.target.value)}>
                                                                                <option value="High">High</option>
                                                                                <option value="Mid">Mid</option>
                                                                                <option value="Low">Low</option>
                                                                            </select>
                                                                        ) : (
                                                                            <span className={cn(
                                                                                "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter whitespace-nowrap",
                                                                                plan.priority === "High" ? "bg-rose-100 text-rose-600" :
                                                                                    plan.priority === "Mid" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"
                                                                            )}>{plan.priority}</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <NextStepBox type="戦略案" />
                                        </div>
                                    )}

                                    {/* M10: Market Environment & Intelligence */}
                                    {activeModule === "M10" && data.m10Data && (
                                        <div className="space-y-8">
                                            {/* Macro Analysis (PEST/3C) */}
                                            <div className="space-y-4">
                                                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest px-4 flex items-center">
                                                    <Globe className="mr-2" size={12} />
                                                    Market intelligence (環境分析)
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {data.m10Data.marketAnalysis.map((item, i) => (
                                                        <div key={i} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-widest">
                                                                    {isEditing ? <input className="bg-transparent border-none w-24" value={item.factor} onChange={(e) => updateM10('marketAnalysis', i, 'factor', e.target.value)} /> : item.factor}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-medium italic">Source: {isEditing ? <input className="bg-transparent border-none w-32" value={item.source} onChange={(e) => updateM10('marketAnalysis', i, 'source', e.target.value)} /> : item.source}</span>
                                                            </div>
                                                            <div className="text-sm font-bold text-slate-800 leading-relaxed">
                                                                {isEditing ? <textarea className="w-full bg-transparent border-b border-blue-100 resize-none" rows={2} value={item.impact} onChange={(e) => updateM10('marketAnalysis', i, 'impact', e.target.value)} /> : item.impact}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Top Trends & Evidence */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest px-4 flex items-center">
                                                        <TrendingUp className="mr-2" size={12} />
                                                        Current Growth Trends
                                                    </h4>
                                                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-6">
                                                        {data.m10Data.trends.map((t, i) => (
                                                            <div key={i} className="flex items-start space-x-4">
                                                                <div className="text-2xl font-black text-blue-200">#{i + 1}</div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-base font-black text-slate-800">{isEditing ? <input className="bg-transparent border-b border-blue-200" value={t.keyword} onChange={(e) => updateM10('trends', i, 'keyword', e.target.value)} /> : t.keyword}</span>
                                                                        <span className="text-xs font-black text-emerald-500">{isEditing ? <input className="bg-transparent border-none w-16 text-right" value={t.growth} onChange={(e) => updateM10('trends', i, 'growth', e.target.value)} /> : t.growth}</span>
                                                                    </div>
                                                                    <div className="text-[10px] font-bold text-blue-500 uppercase mb-2">Platform: {isEditing ? <input className="bg-transparent border-none w-24" value={t.platform} onChange={(e) => updateM10('trends', i, 'platform', e.target.value)} /> : t.platform}</div>
                                                                    <div className="text-xs text-slate-600 leading-relaxed border-l-2 border-blue-100 pl-3">
                                                                        {isEditing ? <textarea className="w-full bg-transparent border-none resize-none" rows={2} value={t.reasoning} onChange={(e) => updateM10('trends', i, 'reasoning', e.target.value)} /> : t.reasoning}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest px-4 flex items-center">
                                                        <Search className="mr-2" size={12} />
                                                        Competitor Benchmarks
                                                    </h4>
                                                    <div className="space-y-4">
                                                        {data.m10Data.competitors.map((c, i) => (
                                                            <div key={i} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm group">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div className="font-black text-slate-800">{isEditing ? <input className="bg-transparent border-b border-blue-200" value={c.name} onChange={(e) => updateM10('competitors', i, 'name', e.target.value)} /> : c.name}</div>
                                                                    <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black text-slate-400">SHARE: {isEditing ? <input className="bg-transparent border-none w-8 text-right" type="number" value={c.share} onChange={(e) => updateM10('competitors', i, 'share', Number(e.target.value))} /> : c.share}%</div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                                    <div className="space-y-1">
                                                                        <span className="text-[9px] font-black text-slate-400 uppercase">Strength</span>
                                                                        <div className="text-[11px] font-bold text-slate-700 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                                                                            {isEditing ? <input className="bg-transparent border-none w-full" value={c.strength} onChange={(e) => updateM10('competitors', i, 'strength', e.target.value)} /> : c.strength}
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <span className="text-[9px] font-black text-slate-400 uppercase">Weakness</span>
                                                                        <div className="text-[11px] font-bold text-slate-700 bg-rose-50 p-2 rounded-xl border border-rose-100">
                                                                            {isEditing ? <input className="bg-transparent border-none w-full" value={c.weakness} onChange={(e) => updateM10('competitors', i, 'weakness', e.target.value)} /> : c.weakness}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="p-3 bg-blue-600 rounded-2xl text-[11px] font-black text-white hover:bg-blue-700 transition-colors">
                                                                    対抗戦略: {isEditing ? <input className="bg-transparent border-none w-full text-white placeholder:text-blue-300" value={c.strategy} onChange={(e) => updateM10('competitors', i, 'strategy', e.target.value)} /> : c.strategy}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Evidence Links */}
                                            <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative">
                                                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                                                    <Globe size={120} />
                                                </div>
                                                <h4 className="font-black text-[10px] text-blue-400 uppercase tracking-widest mb-6 relative z-10">Verification Evidence (根拠ソース)</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                                    {data.m10Data.evidence.map((ev, i) => (
                                                        <a key={i} href={ev.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                                                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                                                <ExternalLink size={18} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-white mb-0.5">{ev.title}</div>
                                                                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">{ev.date} Publication</div>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                            <NextStepBox type="分析結果" />
                                        </div>
                                    )}

                                    {/* M12: Trend/Keywords (Data-Driven) */}
                                    {activeModule === "M12" && !data.m12Data && (
                                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-80 animate-in fade-in zoom-in duration-300">
                                            <Globe size={56} className="text-orange-200 mb-4" />
                                            <h3 className="text-lg font-bold text-slate-800 mb-2">トレンド・キーワード分析の生成</h3>
                                            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
                                                現在の検索トレンドとSNSキーワードを解析し、<br />
                                                「刺さる」発信のためのキーワード群を特定します。
                                            </p>
                                            <button
                                                onClick={handleGenerateDetail}
                                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all flex items-center"
                                            >
                                                <Zap className="mr-2" size={18} fill="currentColor" />
                                                詳細データを生成する
                                            </button>
                                        </div>
                                    )}
                                    {activeModule === "M12" && data.m12Data && (
                                        <div className="space-y-6">
                                            <div className="flex items-center space-x-3 mb-2 text-orange-600">
                                                <TrendingUp />
                                                <span className="font-black text-[10px] uppercase tracking-widest">Trending Keywords & Analysis</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {data.m12Data.trendingKeywords.map((k, i) => (
                                                    <div key={i} className="p-6 bg-orange-50 rounded-3xl border border-orange-100 group hover:bg-white hover:shadow-xl transition-all">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="px-2 py-1 bg-white rounded text-[10px] font-black text-orange-600 border border-orange-100">
                                                                VOL: {isEditing ? <input className="w-12 bg-transparent border-b border-orange-200" value={k.volume} onChange={(e) => updateM12('trendingKeywords', i, 'volume', e.target.value)} /> : k.volume}
                                                            </div>
                                                            <div className="text-emerald-500 font-bold text-xs">
                                                                {isEditing ? <input className="w-12 bg-transparent border-b border-orange-200 text-right" value={k.growth} onChange={(e) => updateM12('trendingKeywords', i, 'growth', e.target.value)} /> : k.growth}
                                                            </div>
                                                        </div>
                                                        <div className="text-lg font-black text-slate-800">
                                                            {isEditing ? <input className="w-full bg-transparent border-b border-orange-300" value={k.word} onChange={(e) => updateM12('trendingKeywords', i, 'word', e.target.value)} /> : k.word}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                                    <h5 className="font-bold mb-6 text-sm text-slate-500 uppercase">関連クエリ (Seed Keywords)</h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {data.m12Data.relatedQueries.map((q, i) => (
                                                            <span key={i} className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">
                                                                {isEditing ? (
                                                                    <input className="bg-transparent border-b border-slate-300 w-24" value={q} onChange={(e) => updateM12('relatedQueries', i, null, e.target.value)} />
                                                                ) : q}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                                    <h5 className="font-bold mb-6 text-sm text-slate-500 uppercase">プラットフォーム別方針</h5>
                                                    <div className="space-y-6">
                                                        {data.m12Data.platformStrategy.map((s, i) => (
                                                            <div key={i} className="flex items-start">
                                                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mr-4 flex-shrink-0 font-black text-xs">
                                                                    {s.platform[0]}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="font-bold text-slate-800 text-sm mb-1">
                                                                        {isEditing ? <input className="w-full bg-transparent border-b border-slate-200" value={s.platform} onChange={(e) => updateM12('platformStrategy', i, 'platform', e.target.value)} /> : s.platform}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500 leading-relaxed">
                                                                        {isEditing ? <textarea className="w-full bg-transparent border-b border-slate-200 resize-none" rows={2} value={s.approach} onChange={(e) => updateM12('platformStrategy', i, 'approach', e.target.value)} /> : s.approach}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <NextStepBox type="キーワード分析" />
                                        </div>
                                    )}

                                    {/* M30/M31: Business & Finance (Data-Driven) */}
                                    {(activeModule === "M30" || activeModule === "M31") && !data.m30Data && (
                                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-80 animate-in fade-in zoom-in duration-300">
                                            <TrendingUp size={56} className="text-emerald-200 mb-4" />
                                            <h3 className="text-lg font-bold text-slate-800 mb-2">事業計画・収益試算の生成</h3>
                                            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
                                                {data.theme ? `「${data.theme}」の` : ""}実現に向けた<br />
                                                5年間の収益予測とキャッシュフロー、<br />
                                                マイルストーンを設計します。
                                            </p>
                                            <button
                                                onClick={handleGenerateDetail}
                                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all flex items-center"
                                            >
                                                <Zap className="mr-2" size={18} fill="currentColor" />
                                                詳細データを生成する
                                            </button>
                                        </div>
                                    )}
                                    {(activeModule === "M30" || activeModule === "M31") && data.m30Data && (
                                        <div className="space-y-6">
                                            <div className="flex items-center space-x-3 mb-4 text-emerald-600">
                                                <TrendingUp />
                                                <span className="font-black text-[10px] uppercase tracking-widest">Business Plan & Financial Structure</span>
                                            </div>
                                            {/* M30: Business Plan (Simulation) */}
                                            <div className="bg-slate-900 text-white p-6 rounded-3xl relative overflow-hidden">
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 relative z-10 gap-6">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="p-3 bg-emerald-500/20 rounded-xl">
                                                            <Calculator className="text-emerald-400" size={24} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-xl">5カ年 収支シミュレーション</div>
                                                            <div className="text-xs text-slate-400">パラメータ調整</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row items-center gap-6 bg-white/5 p-4 rounded-2xl border border-white/10">
                                                        <div className="flex flex-col w-full sm:w-auto">
                                                            <div className="flex justify-between mb-2">
                                                                <label className="text-xs font-bold text-emerald-400">売上成長率</label>
                                                                <span className="text-xs font-mono bg-emerald-500/20 px-2 rounded text-emerald-300">x{revenueMultiplier.toFixed(1)}</span>
                                                            </div>
                                                            <input
                                                                type="range" min="0.5" max="3.0" step="0.1"
                                                                value={revenueMultiplier}
                                                                onChange={(e) => setRevenueMultiplier(parseFloat(e.target.value))}
                                                                className="w-40 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                                            />
                                                        </div>
                                                        <div className="w-px h-8 bg-white/10 hidden sm:block" />
                                                        <div className="flex flex-col w-full sm:w-auto">
                                                            <div className="flex justify-between mb-2">
                                                                <label className="text-xs font-bold text-rose-400">コスト係数</label>
                                                                <span className="text-xs font-mono bg-rose-500/20 px-2 rounded text-rose-300">x{costMultiplier.toFixed(1)}</span>
                                                            </div>
                                                            <input
                                                                type="range" min="0.5" max="2.0" step="0.1"
                                                                value={costMultiplier}
                                                                onChange={(e) => setCostMultiplier(parseFloat(e.target.value))}
                                                                className="w-40 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Scenario Presets (Developer Idea) */}
                                                <div className="flex sm:justify-end gap-2 mb-8 relative z-10 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                                                    <button
                                                        onClick={() => { setRevenueMultiplier(1.1); setCostMultiplier(1.0); }}
                                                        className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium border border-white/5 transition-all whitespace-nowrap"
                                                    >
                                                        🐢 堅実成長プラン
                                                    </button>
                                                    <button
                                                        onClick={() => { setRevenueMultiplier(1.5); setCostMultiplier(1.1); }}
                                                        className="px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium border border-emerald-500/20 transition-all whitespace-nowrap"
                                                    >
                                                        🚀 積極投資プラン
                                                    </button>
                                                    <button
                                                        onClick={() => { setRevenueMultiplier(2.5); setCostMultiplier(1.4); }}
                                                        className="px-3 py-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-medium border border-purple-500/20 transition-all whitespace-nowrap"
                                                    >
                                                        🦄 ユニコーンモード
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-5 gap-4 items-end h-64 relative z-10 px-2">
                                                    {(() => {
                                                        const currentSim = simulatedPL || data.m30Data.plSimulation;
                                                        const maxVal = Math.max(...currentSim.map(d => d.revenue)) * 1.2;

                                                        return currentSim.map((d, i) => (
                                                            <div key={i} className="flex flex-col justify-end h-full space-y-2 group">
                                                                <div className="flex items-end space-x-1 h-full relative">
                                                                    <motion.div
                                                                        initial={{ height: 0 }}
                                                                        animate={{ height: `${Math.min((d.revenue / maxVal) * 100, 100)}%` }}
                                                                        transition={{ type: "spring", stiffness: 100 }}
                                                                        className="w-full bg-emerald-500 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity relative min-h-[10%]"
                                                                    >
                                                                        <span className="absolute -top-6 left-0 w-full text-center text-[10px] sm:text-xs font-bold text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            {(d.revenue / 10000).toFixed(1)}万
                                                                        </span>
                                                                    </motion.div>
                                                                    <motion.div
                                                                        initial={{ height: 0 }}
                                                                        animate={{ height: `${Math.min((d.profit / maxVal) * 100, 100)}%` }}
                                                                        transition={{ type: "spring", stiffness: 100 }}
                                                                        className="w-full bg-emerald-300 rounded-t-lg opacity-60 group-hover:opacity-100 transition-opacity min-h-[5%]"
                                                                    />
                                                                </div>
                                                                <div className="text-center text-xs font-bold text-slate-500 border-t border-slate-700 pt-2">{d.year}年目</div>
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>

                                                {/* Background decoration */}
                                                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                                    <h5 className="font-bold mb-4 text-xs text-slate-400">マイルストーン</h5>
                                                    <div className="space-y-3">
                                                        {data.m30Data.milestones.map((m, i) => (
                                                            <div key={i} className="flex flex-col text-sm border-l-2 border-slate-200 pl-4 py-1">
                                                                {isEditing ? (
                                                                    <>
                                                                        <div className="flex gap-2">
                                                                            <input className="text-xs text-slate-400 font-bold bg-transparent border-b border-slate-300 w-24 mb-1" value={m.date} onChange={(e) => updateM30('milestones', i, 'date', e.target.value)} />
                                                                            <input className="text-xs text-slate-400 font-bold bg-transparent border-b border-slate-300 w-full mb-1" value={m.phase} onChange={(e) => updateM30('milestones', i, 'phase', e.target.value)} />
                                                                        </div>
                                                                        <input className="font-bold text-slate-700 bg-transparent border-b border-slate-300 w-full" value={m.event} onChange={(e) => updateM30('milestones', i, 'event', e.target.value)} />
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="text-xs text-slate-400 font-bold">{m.date} - {m.phase}</div>
                                                                        <div className="font-bold text-slate-700">{m.event}</div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-6 bg-slate-900 text-white rounded-3xl">
                                                    <h5 className="font-bold mb-4 text-xs text-slate-400">資金調達・財務サマリー</h5>
                                                    <div className="space-y-4">
                                                        {data.m30Data.fundingPlan.map((f, i) => (
                                                            <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                                {isEditing ? (
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <input className="bg-transparent border-b border-white/20 text-emerald-400 font-bold" value={f.method} onChange={(e) => updateM30('fundingPlan', i, 'method', e.target.value)} />
                                                                        <input className="bg-transparent border-b border-white/20 text-right" value={f.amount} onChange={(e) => updateM30('fundingPlan', i, 'amount', e.target.value)} />
                                                                        <input className="col-span-2 bg-transparent border-b border-white/20 text-xs opacity-60" value={f.institutionalSupport} onChange={(e) => updateM30('fundingPlan', i, 'institutionalSupport', e.target.value)} />
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex justify-between items-center mb-1">
                                                                            <span className="text-emerald-400 font-bold">{f.method}</span>
                                                                            <span className="font-mono">{f.amount}</span>
                                                                        </div>
                                                                        <div className="text-[10px] opacity-60 italic">{f.institutionalSupport}</div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <NextStepBox type="計画案" />
                                        </div>
                                    )}

                                    {/* M40: Operation (Data-Driven) */}
                                    {activeModule === "M40" && !data.m40Data && (
                                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-80 animate-in fade-in zoom-in duration-300">
                                            <Cpu size={56} className="text-amber-200 mb-4" />
                                            <h3 className="text-lg font-bold text-slate-800 mb-2">業務プロセス・体制の最適化</h3>
                                            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
                                                {data.theme ? `「${data.theme}」の` : ""}運営に必要な<br />
                                                業務フローの構築とボトルネックの解消、<br />
                                                効率的な体制図を提案します。
                                            </p>
                                            <button
                                                onClick={handleGenerateDetail}
                                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all flex items-center"
                                            >
                                                <Zap className="mr-2" size={18} fill="currentColor" />
                                                詳細データを生成する
                                            </button>
                                        </div>
                                    )}
                                    {activeModule === "M40" && data.m40Data && (
                                        <div className="space-y-6">
                                            <div className="flex items-center space-x-3 mb-2 text-amber-600">
                                                <Cpu />
                                                <span className="font-black text-[10px] uppercase tracking-widest">オペレーション最適化 (Operation)</span>
                                            </div>
                                            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                                <h5 className="font-bold mb-6 text-sm text-slate-500 uppercase">現状のボトルネック</h5>
                                                <div className="space-y-3">
                                                    {data.m40Data.currentBottlenecks.map((b, i) => (
                                                        <div key={i} className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-red-100">
                                                            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                                                            {isEditing ? (
                                                                <input className="font-medium text-slate-700 w-full bg-transparent border-b border-slate-200" value={b} onChange={(e) => updateM40('currentBottlenecks', i, null, e.target.value)} />
                                                            ) : (
                                                                <span className="font-medium text-slate-700">{b}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                                                <h5 className="font-bold mb-6 text-sm text-blue-500 uppercase">業務改善フロー</h5>
                                                <div className="space-y-4">
                                                    {data.m40Data.improvementFlow.map((f, i) => (
                                                        <div key={i} className="p-4 bg-white rounded-2xl border border-blue-50 shadow-sm">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-1">
                                                                    <div className="text-[10px] uppercase font-black text-slate-400">Before (課題)</div>
                                                                    {isEditing ? <input className="w-full border-b border-slate-200 text-sm" value={f.before} onChange={(e) => updateM40('improvementFlow', i, 'before', e.target.value)} /> : <div className="text-sm text-slate-600 italic">{f.before}</div>}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="text-[10px] uppercase font-black text-emerald-500">After (改善後)</div>
                                                                    {isEditing ? <input className="w-full border-b border-emerald-200 text-sm font-bold" value={f.after} onChange={(e) => updateM40('improvementFlow', i, 'after', e.target.value)} /> : <div className="text-sm font-bold text-slate-800">{f.after}</div>}
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 flex items-center space-x-2">
                                                                <div className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[9px] font-black uppercase tracking-tighter">Tool</div>
                                                                {isEditing ? <input className="bg-transparent text-xs font-bold w-full" value={f.tool} onChange={(e) => updateM40('improvementFlow', i, 'tool', e.target.value)} /> : <div className="text-xs font-bold text-blue-500">{f.tool}</div>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* M50: SNS/Content (Data-Driven) */}
                                    {activeModule === "M50" && !data.m50Data && (
                                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-80 animate-in fade-in zoom-in duration-300">
                                            <Smartphone size={56} className="text-pink-200 mb-4" />
                                            <h3 className="text-lg font-bold text-slate-800 mb-2">SNS・コンテンツ戦略の生成</h3>
                                            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
                                                {data.theme ? `「${data.theme}」の` : ""}認知拡大とファン獲得に向けた<br />
                                                具体的な発信テーマや目標KPI、<br />
                                                LINEマーケティング戦略を策定します。
                                            </p>
                                            <button
                                                onClick={handleGenerateDetail}
                                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all flex items-center"
                                            >
                                                <Zap className="mr-2" size={18} fill="currentColor" />
                                                詳細データを生成する
                                            </button>
                                        </div>
                                    )}
                                    {activeModule === "M50" && data.m50Data && (
                                        <div className="space-y-6">
                                            <div className="flex items-center space-x-3 mb-2 text-pink-600">
                                                <Smartphone />
                                                <span className="font-black text-[10px] uppercase tracking-widest">Contents & LINE Marketing Strategy</span>
                                            </div>

                                            {/* Brand Theme / Topics */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                                                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                                    <h5 className="font-bold mb-6 text-sm text-slate-400 uppercase tracking-widest flex items-center">
                                                        <MessageSquare size={16} className="mr-2" /> Brand Topics
                                                    </h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {data.m50Data.contentThemes.map((t, i) => (
                                                            <div key={i} className="px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-bold border border-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                                {isEditing ? <input className="bg-transparent border-none w-20" value={t} onChange={(e) => updateM50('contentThemes', i, null, e.target.value)} /> : `# ${t}`}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden">
                                                    <h5 className="font-bold mb-6 text-xs text-slate-400 uppercase tracking-widest">Keywords</h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {data.m50Data.headlines.map((h, i) => (
                                                            <span key={i} className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-white/5">{h}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* LINE Marketing Flow (NEW) */}
                                            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[3rem] space-y-8 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                                    <MessageCircle size={80} className="text-emerald-500" />
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center">
                                                        <Zap size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-emerald-900">公式LINEマーケティング・フロー</h4>
                                                        <p className="text-xs text-emerald-600/70 font-bold uppercase tracking-widest">Automation & Conversion Funnel</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                    {/* Step Messages */}
                                                    <div className="lg:col-span-2 space-y-4">
                                                        <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Step Messages (教育配信)</h5>
                                                        <div className="space-y-3">
                                                            {data.m50Data.lineMarketing?.stepMessages.map((m, i) => (
                                                                <div key={i} className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm relative">
                                                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-full" />
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <div className="text-[10px] font-black text-emerald-500 uppercase">Day {m.day}</div>
                                                                        <div className="text-xs font-black text-slate-800">{m.title}</div>
                                                                    </div>
                                                                    <p className="text-[11px] text-slate-500 leading-relaxed italic">{m.content}</p>
                                                                </div>
                                                            )) || <div className="text-[10px] text-emerald-300 italic font-medium p-4 border border-dashed border-emerald-200 rounded-2xl">教育配信(5日間)を未生成</div>}
                                                        </div>
                                                    </div>

                                                    {/* Tag Design */}
                                                    <div className="space-y-4">
                                                        <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Segmentation (タグ設計)</h5>
                                                        <div className="space-y-2">
                                                            {data.m50Data.lineMarketing?.tagDesign.map((tag, i) => (
                                                                <div key={i} className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-200">
                                                                    <div className="text-xs font-black text-emerald-700 flex items-center">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                                                                        {tag.name}
                                                                    </div>
                                                                    <div className="text-[9px] text-emerald-600 font-bold mt-1">{tag.meaning}</div>
                                                                </div>
                                                            )) || <div className="text-[10px] text-emerald-300 italic">タグ設計を未生成</div>}
                                                        </div>

                                                        {/* KPI & Conversion */}
                                                        <div className="mt-8 pt-8 border-t border-emerald-200">
                                                            <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Target KPIs</h5>
                                                            <div className="space-y-3">
                                                                {data.m50Data.lineMarketing?.kpiTargets.map((k, i) => (
                                                                    <div key={i} className="flex justify-between items-center text-xs">
                                                                        <span className="font-bold text-emerald-900/60">{k.metric}</span>
                                                                        <span className="font-mono font-black text-emerald-700">{k.target}</span>
                                                                    </div>
                                                                )) || <div className="text-[10px] text-emerald-300 italic">KPI指標を未生成</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <NextStepBox type="ブランド構成" />
                                        </div>
                                    )}

                                    {/* M92: History Management */}
                                    {activeModule === "M92" && (
                                        <div className="space-y-8">
                                            <div className="flex items-center space-x-3 mb-8 text-purple-600">
                                                <Library />
                                                <span className="font-black text-sm uppercase tracking-widest">履歴管理 (History)</span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                {savedReports.length === 0 ? (
                                                    <div className="text-center py-20 text-slate-400">保存された履歴はありません</div>
                                                ) : (
                                                    savedReports.map((report) => (
                                                        <div key={report.id} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-purple-200 transition-all">
                                                            <div>
                                                                <div className="text-xs font-bold text-slate-400 mb-1">{report.date}</div>
                                                                <div className="font-bold text-lg text-slate-800 mb-2">{report.title}</div>
                                                                <div className="flex space-x-2">
                                                                    {report.data.selectedModules.map(m => (
                                                                        <span key={m.id} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded font-bold">{m.id}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => loadHistoryItem(report)}
                                                                    className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-bold hover:bg-purple-100"
                                                                >
                                                                    読み込む
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteHistory(report.id)}
                                                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* M60/M61: App Development (Integrated) */}
                                    {(activeModule === "M60" || activeModule === "M61") && !data.m60Data && (
                                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-80 animate-in fade-in zoom-in duration-300">
                                            <Code size={64} className="text-indigo-200 mb-6" />
                                            <h3 className="text-xl font-bold text-slate-800 mb-3">システム開発要件の定義</h3>
                                            <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                                                {data.theme ? `「${data.theme}」の` : ""}実現に必要な<br />
                                                アプリ・システムの機能要件、技術選定、<br />
                                                開発ロードマップを策定します。
                                            </p>
                                            <button
                                                onClick={handleGenerateDetail}
                                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all flex items-center"
                                            >
                                                <Zap className="mr-2" size={18} fill="currentColor" />
                                                詳細データを生成する
                                            </button>
                                        </div>
                                    )}
                                    {(activeModule === "M60" || activeModule === "M61") && data.m60Data && (
                                        <div className="space-y-6">
                                            <div className="flex items-center space-x-3 mb-4 text-indigo-600">
                                                <Smartphone />
                                                <span className="font-black text-[10px] uppercase tracking-widest">System Specification & Architecture</span>
                                            </div>

                                            {/* System Definition */}
                                            {data.m60Data.systemDefinition && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-3xl">
                                                        <h5 className="font-bold mb-4 text-xs text-indigo-400 tracking-widest uppercase">System Definition</h5>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <div className="text-[10px] font-black text-indigo-300 uppercase">Project Name</div>
                                                                {isEditing ? <input className="w-full bg-transparent border-b border-indigo-200 text-lg font-black" value={data.m60Data.systemDefinition.name} onChange={(e) => updateM60('systemDefinition', -1, 'name', e.target.value)} /> : <div className="text-lg font-black text-indigo-900">{data.m60Data.systemDefinition.name}</div>}
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-black text-indigo-300 uppercase">Primary Goal</div>
                                                                {isEditing ? <textarea className="w-full bg-transparent border-b border-indigo-200 text-sm" value={data.m60Data.systemDefinition.purpose} onChange={(e) => updateM60('systemDefinition', -1, 'purpose', e.target.value)} /> : <div className="text-sm text-indigo-800 font-medium">{data.m60Data.systemDefinition.purpose}</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl">
                                                        <h5 className="font-bold mb-4 text-xs text-slate-400 tracking-widest uppercase">Target & Context</h5>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <div className="text-[10px] font-black text-slate-300 uppercase">Assumed User</div>
                                                                {isEditing ? <input className="w-full bg-transparent border-b border-slate-200 text-sm font-bold" value={data.m60Data.systemDefinition.targetUser} onChange={(e) => updateM60('systemDefinition', -1, 'targetUser', e.target.value)} /> : <div className="text-sm text-slate-700 font-black">{data.m60Data.systemDefinition.targetUser}</div>}
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-black text-slate-300 uppercase">Success Metric</div>
                                                                <div className="text-sm text-slate-700 font-bold">{data.m60Data.systemDefinition.successDefinition}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="p-6 border border-slate-100 rounded-3xl bg-white shadow-sm">
                                                    <h5 className="font-bold mb-6 text-sm text-slate-500 uppercase flex items-center">
                                                        <Layers size={16} className="mr-2" /> Key Features
                                                    </h5>
                                                    <div className="space-y-4">
                                                        {data.m60Data.features.map((f, i) => (
                                                            <div key={i} className="flex items-start space-x-3 group">
                                                                <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors mt-1">
                                                                    F{i + 1}
                                                                </div>
                                                                <div className="flex-1">
                                                                    {isEditing ? <input className="font-bold text-slate-700 bg-transparent border-b border-slate-200 w-full mb-1" value={f.name} onChange={(e) => updateM60('features', i, 'name', e.target.value)} /> : <div className="font-bold text-slate-700">{f.name}</div>}
                                                                    <div className="text-[10px] text-slate-400 font-medium">{f.description}</div>
                                                                </div>
                                                                <div className="px-2 py-0.5 bg-slate-100 text-[10px] font-black rounded uppercase text-slate-400">{f.priority}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="p-6 border border-slate-100 rounded-3xl bg-slate-900 text-white shadow-sm">
                                                    <h5 className="font-bold mb-6 text-sm text-slate-400 uppercase flex items-center">
                                                        <Code size={16} className="mr-2" /> Tech Stack Strategy
                                                    </h5>
                                                    <div className="space-y-3">
                                                        {data.m60Data.techStack.map((t, i) => (
                                                            <div key={i} className="py-2 border-b border-slate-800">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                                    <div className="text-[10px] font-black text-slate-500 uppercase">{t.category}</div>
                                                                </div>
                                                                {isEditing ? <input className="font-mono text-sm text-emerald-400 bg-transparent focus:outline-none w-full" value={t.selection} onChange={(e) => updateM60('techStack', i, 'selection', e.target.value)} /> : <div className="font-mono text-sm text-emerald-400">{t.selection}</div>}
                                                                <div className="text-[10px] text-slate-500 italic mt-1">{t.reason}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* DB & Security (M61 Focus) */}
                                            {activeModule === "M61" && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                                                        <h5 className="font-bold mb-6 text-xs text-slate-400 uppercase tracking-widest flex items-center">
                                                            <Database size={16} className="mr-2" /> Data Architecture
                                                        </h5>
                                                        <div className="space-y-4">
                                                            {data.m60Data.dbSchema?.map((table, i) => (
                                                                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200">
                                                                    <div className="text-sm font-black text-slate-800 mb-2 flex items-center">
                                                                        <Table size={14} className="mr-1 text-indigo-400" /> {table.table}
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {table.columns.map((col, ci) => (
                                                                            <span key={ci} className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 border border-slate-200">
                                                                                {col.name} <span className="opacity-40">({col.type})</span>
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="p-8 bg-slate-900 text-white rounded-3xl shadow-xl">
                                                        <h5 className="font-bold mb-6 text-xs text-slate-500 uppercase tracking-widest flex items-center">
                                                            <ShieldCheck size={16} className="mr-2" /> Security & Governance
                                                        </h5>
                                                        <div className="space-y-6">
                                                            <div>
                                                                <div className="text-[10px] font-black text-slate-500 uppercase mb-2">Access Roles</div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {data.m60Data.security?.roles.map((r, i) => (
                                                                        <span key={i} className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs font-bold text-indigo-300">{r}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-black text-slate-500 uppercase mb-2">Security Measures</div>
                                                                <div className="space-y-2">
                                                                    {data.m60Data.security?.measures.map((m, i) => (
                                                                        <div key={i} className="flex items-center space-x-2 text-xs font-medium text-slate-300">
                                                                            <CheckCircle2 size={12} className="text-emerald-500" />
                                                                            <span>{m}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <NextStepBox type="システム構成" />
                                        </div>
                                    )}

                                    {/* M91 Simulation View */}
                                    {activeModule === "M91" && !data.m91Data && (
                                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
                                            <Calculator size={64} className="text-slate-300 mb-4" />
                                            <h3 className="text-xl font-bold text-slate-700 mb-2">シミュレーション データなし</h3>
                                            <p className="text-slate-400 mb-6">「詳細データを生成」で試算を実行してください</p>
                                            <button onClick={handleGenerateDetail} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-bold text-sm">
                                                試算を実行
                                            </button>
                                        </div>
                                    )}
                                    {activeModule === "M91" && data.m91Data && (
                                        <div className="space-y-8">
                                            <div className="flex items-center space-x-3 text-slate-500 mb-4">
                                                <Calculator size={20} />
                                                <span className="font-bold text-sm uppercase">Business Simulation Engine</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {data.m91Data.scenarios.map((s, i) => (
                                                    <div key={i} className={`p-6 rounded-3xl border text-center transition-all hover:shadow-lg ${i === 1 ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-white border-slate-100 opacity-80 hover:opacity-100'}`}>
                                                        <h4 className="font-bold text-slate-600 mb-3 text-sm">{s.name}</h4>
                                                        <p className="text-2xl font-black text-slate-800 mb-2">{s.result}</p>
                                                        <span className="inline-block text-[10px] font-bold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-400">
                                                            Prob: {s.probability}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                                                <h4 className="font-bold mb-6 text-slate-700">Assumptions & Parameters</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                                    {data.m91Data.parameters.map((p, i) => (
                                                        <div key={i} className="flex justify-between items-center py-3 border-b border-slate-200/50">
                                                            <span className="text-sm font-medium text-slate-500">{p.name}</span>
                                                            <div className="flex items-center">
                                                                {isEditing ? (
                                                                    <input className="text-right font-mono font-bold text-slate-800 bg-white border border-slate-200 px-2 rounded w-32" value={p.value} onChange={(e) => updateM91('parameters', i, null, e.target.value)} />
                                                                ) : (
                                                                    <span className="font-mono font-bold text-slate-800">{p.value}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <NextStepBox type="試算結果" />
                                        </div>
                                    )}

                                    {/* M99 Empty State (Before Generation) */}
                                    {activeModule === "M99" && !data.m99Data && (
                                        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                                            <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm">
                                                <LightbulbIcon size={48} strokeWidth={1.5} />
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-800 mb-3">カスタム分析の準備完了</h3>
                                            <p className="text-slate-500 mb-8 max-w-md leading-relaxed">
                                                標準項目ではカバーできない独自の分析を行います。<br />
                                                <span className="font-bold text-blue-600">「詳細データを生成」</span>ボタンを押して、<br />
                                                AIによる特別リサーチを開始してください。
                                            </p>
                                            <button
                                                onClick={handleGenerateDetail}
                                                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all flex items-center"
                                            >
                                                <Zap className="mr-2" fill="currentColor" />
                                                今すぐ生成する
                                            </button>
                                        </div>
                                    )}

                                    {/* M99 Custom Module View */}
                                    {activeModule === "M99" && data.m99Data && (
                                        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                                            <div className="mb-10 border-b border-slate-100 pb-8">
                                                <div className="flex items-center space-x-4 mb-4">
                                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                                        <Edit3 size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-xl text-slate-900">カスタム分析ワークスペース</h3>
                                                        <p className="text-sm text-slate-500">標準項目外の独自の課題を定義し、AIと共に解決策を練り上げます。</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Theme Input */}
                                            <div className="mb-8">
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Analysis Theme (分析テーマ)</label>
                                                {isEditing ? (
                                                    <input
                                                        className="w-full p-5 bg-slate-50 border border-indigo-200 rounded-2xl font-bold text-lg text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                                                        placeholder="例：競合他社の採用戦略、特定地域の法規制リスクなど"
                                                        value={data.m99Data.overview}
                                                        onChange={(e) => updateM99('overview', -1, e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-lg text-slate-800">
                                                        {data.m99Data.overview}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Editable List */}
                                            <div className="space-y-6">
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Key Findings & Action Plan</label>
                                                {data.m99Data.details.map((d: string, i: number) => (
                                                    <div key={i} className="flex items-start group">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 group-focus-within:bg-indigo-600 group-focus-within:text-white flex items-center justify-center mr-4 flex-shrink-0 font-bold transition-colors mt-4">
                                                            {i + 1}
                                                        </div>
                                                        {isEditing ? (
                                                            <textarea
                                                                className="w-full p-5 bg-slate-50 border border-indigo-200 rounded-2xl text-slate-700 min-h-[120px] focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none transition-all leading-relaxed"
                                                                value={d}
                                                                onChange={(e) => updateM99('details', i, e.target.value)}
                                                                placeholder={`考察・分析結果・アクションプラン ${i + 1}`}
                                                            />
                                                        ) : (
                                                            <div className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 min-h-[120px] leading-relaxed">
                                                                <MarkdownText text={d} />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-10 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                                <div className="text-sm text-indigo-800 font-medium">
                                                    <span className="block font-bold mb-1 from-indigo-600">AI活用ヒント:</span>
                                                    「このテーマについて、リスクと対策を3つ挙げて」と最下部のチャットで指示してください。<br />
                                                    得られた回答をここにコピー＆ペーストして保存できます。
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const el = document.getElementById('ai-advisor-section');
                                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                    className="flex-shrink-0 flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all whitespace-nowrap"
                                                >
                                                    <MessageSquare className="mr-2" size={18} />
                                                    AIに相談・壁打ちする
                                                </button>
                                            </div>
                                            <NextStepBox type="カスタム分析" />
                                        </div>
                                    )}

                                    {/* M21: Individual Session & Seminar Design */}
                                    {activeModule === "M21" && !data.m21Data && (
                                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-80 animate-in fade-in zoom-in duration-300">
                                            <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                                                <Users size={40} />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-3">個別相談・セミナー設計の生成</h3>
                                            <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                                                成約率を最大化するためのセミナー構成と、<br />
                                                個別相談でのクロージングまでの流れを具体化します。
                                            </p>
                                            <button
                                                onClick={handleGenerateDetail}
                                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center"
                                            >
                                                <Zap className="mr-2" size={18} fill="currentColor" />
                                                詳細設計を生成する
                                            </button>
                                        </div>
                                    )}
                                    {activeModule === "M21" && data.m21Data && (
                                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                            <div>
                                                <h3 className="text-xl font-black mb-6 flex items-center text-slate-800">
                                                    <Users className="mr-3 text-indigo-600" size={24} />
                                                    セミナー構成設計 (Seminar Structure)
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {data.m21Data.seminarStructure.map((s, i) => (
                                                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                                            <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full flex items-center justify-center text-slate-200 font-black text-2xl group-hover:text-indigo-100 transition-colors">
                                                                {i + 1}
                                                            </div>
                                                            <div className="text-[10px] font-black tracking-widest text-indigo-500 uppercase mb-2">
                                                                {isEditing ? <input className="bg-transparent border-b border-indigo-200 w-full" value={s.section} onChange={(e) => updateM21('seminarStructure', i, 'section', e.target.value)} /> : s.section}
                                                            </div>
                                                            <div className="font-bold text-slate-800 mb-3">
                                                                {isEditing ? <input className="bg-transparent border-b border-indigo-200 w-full" value={s.content} onChange={(e) => updateM21('seminarStructure', i, 'content', e.target.value)} /> : s.content}
                                                            </div>
                                                            <div className="p-4 bg-slate-50 rounded-2xl text-[13px] text-slate-600 border border-slate-100 italic leading-relaxed">
                                                                {isEditing ? (
                                                                    <textarea className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-600 italic resize-none" rows={2} value={s.keyTalk} onChange={(e) => updateM21('seminarStructure', i, 'keyTalk', e.target.value)} />
                                                                ) : `「${s.keyTalk}」`}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-black mb-6 flex items-center text-slate-800">
                                                    <MessageCircle className="mr-3 text-emerald-600" size={24} />
                                                    個別相談 6セクションの流れ (Session Flow)
                                                </h3>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                                                    {data.m21Data.sessionFlow.map((f, i) => (
                                                        <div key={i} className="flex gap-4 group">
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                                    {i + 1}
                                                                </div>
                                                                {i < data.m21Data!.sessionFlow.length - 1 && <div className="w-0.5 flex-1 bg-emerald-50 group-hover:bg-emerald-100 mt-1" />}
                                                            </div>
                                                            <div className="flex-1 pb-4">
                                                                <div className="font-bold text-slate-800 flex items-center">
                                                                    {isEditing ? <input className="bg-transparent border-b border-emerald-200 w-1/3" value={f.phase} onChange={(e) => updateM21('sessionFlow', i, 'phase', e.target.value)} /> : f.phase}
                                                                    <span className="ml-3 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-tighter">
                                                                        {isEditing ? <input className="bg-transparent border-none w-24 text-center focus:ring-0" value={f.purpose} onChange={(e) => updateM21('sessionFlow', i, 'purpose', e.target.value)} /> : f.purpose}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-2 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 text-xs text-slate-600">
                                                                    {isEditing ? (
                                                                        <textarea className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-600 resize-none h-auto" rows={3} value={f.script} onChange={(e) => updateM21('sessionFlow', i, 'script', e.target.value)} />
                                                                    ) : <MarkdownText text={f.script} />}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl overflow-hidden relative">
                                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none rotate-12">
                                                    <CheckCircle2 size={120} />
                                                </div>
                                                <h3 className="text-lg font-black mb-4 flex items-center">
                                                    <Zap className="mr-3 text-yellow-400" size={20} />
                                                    クロージング戦略 (Closing Strategy)
                                                </h3>
                                                <p className="text-slate-300 leading-relaxed font-medium italic">
                                                    {isEditing ? (
                                                        <textarea className="w-full bg-transparent border-b border-slate-700 focus:outline-none text-slate-100 p-2 resize-none" rows={2} value={data.m21Data.closingStrategy} onChange={(e) => updateM21('closingStrategy', -1, null, e.target.value)} />
                                                    ) : `「${data.m21Data.closingStrategy}」`}
                                                </p>
                                            </div>
                                            <NextStepBox type="設計案" />
                                        </div>
                                    )}

                                    {/* M51: Copywriting Mastery */}
                                    {activeModule === "M51" && !data.m51Data && (
                                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-80 animate-in fade-in zoom-in duration-300">
                                            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                                                <FileText size={40} />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-3">コピーライティング案の生成</h3>
                                            <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                                                ターゲットに刺さる「売れる」見出し案と、<br />
                                                AIを活用した執筆用プロンプトを生成します。
                                            </p>
                                            <button
                                                onClick={handleGenerateDetail}
                                                className="px-8 py-3 bg-amber-600 text-white rounded-xl font-bold shadow-xl shadow-amber-100 hover:bg-amber-700 hover:scale-105 transition-all flex items-center"
                                            >
                                                <Zap className="mr-2" size={18} fill="currentColor" />
                                                コピー案を生成する
                                            </button>
                                        </div>
                                    )}
                                    {activeModule === "M51" && data.m51Data && (
                                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                <div className="lg:col-span-1">
                                                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm lg:sticky lg:top-8">
                                                        <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase mb-6 flex items-center">
                                                            <FileText className="mr-2" size={16} />
                                                            Copy Brief
                                                        </h3>
                                                        <div className="space-y-6">
                                                            <div>
                                                                <div className="text-[10px] font-black text-indigo-500 mb-1">TARGET ペルソナ</div>
                                                                <div className="font-bold text-slate-800 leading-snug">
                                                                    {isEditing ? <input className="w-full bg-transparent border-b border-indigo-200" value={data.m51Data.brief.target} onChange={(e) => updateM51('brief', -1, 'target', e.target.value)} /> : data.m51Data.brief.target}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-black text-indigo-500 mb-1">USP 独自の強み</div>
                                                                <div className="font-bold text-slate-800 leading-snug">
                                                                    {isEditing ? <input className="w-full bg-transparent border-b border-indigo-200" value={data.m51Data.brief.usp} onChange={(e) => updateM51('brief', -1, 'usp', e.target.value)} /> : data.m51Data.brief.usp}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-black text-indigo-500 mb-1">BENEFIT 約束する価値</div>
                                                                <div className="font-bold text-slate-800 leading-snug">
                                                                    {isEditing ? <input className="w-full bg-transparent border-b border-indigo-200" value={data.m51Data.brief.benefit} onChange={(e) => updateM51('brief', -1, 'benefit', e.target.value)} /> : data.m51Data.brief.benefit}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="lg:col-span-2 space-y-8">
                                                    <div>
                                                        <h3 className="text-xl font-black mb-6 flex items-center text-slate-800">
                                                            <Zap className="mr-3 text-amber-500" size={24} />
                                                            『売れる』見出し案 (Headlines)
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {data.m51Data.headlines.map((h, i) => (
                                                                <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all group flex items-start">
                                                                    <div className="w-6 h-6 rounded-full bg-slate-50 text-slate-400 text-[10px] flex items-center justify-center mr-4 mt-1 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors flex-shrink-0">
                                                                        {i + 1}
                                                                    </div>
                                                                    <div className="flex-1 font-bold text-slate-800 group-hover:text-indigo-900 transition-colors leading-relaxed">
                                                                        {isEditing ? (
                                                                            <input className="w-full bg-transparent border-b border-amber-200 focus:outline-none" value={h} onChange={(e) => updateM51('headlines', i, null, e.target.value)} />
                                                                        ) : h}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h3 className="text-xl font-black mb-6 flex items-center text-slate-800">
                                                            <Code className="mr-3 text-slate-400" size={24} />
                                                            AIプロンプト案 (Prompts)
                                                        </h3>
                                                        {data.m51Data.prompts.map((p, i) => (
                                                            <div key={i} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                                                                <div className="px-5 py-3 bg-slate-100/50 border-b border-slate-200 flex items-center justify-between">
                                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                                        {isEditing ? <input className="bg-transparent border-b border-slate-300 w-1/3" value={p.title} onChange={(e) => updateM51('prompts', i, 'title', e.target.value)} /> : p.title}
                                                                    </span>
                                                                    <button className="text-[10px] font-bold text-indigo-600 hover:underline">Copy Prompt</button>
                                                                </div>
                                                                <div className="p-5 font-mono text-[10px] text-slate-400 leading-relaxed max-h-32 overflow-y-auto">
                                                                    {isEditing ? (
                                                                        <textarea className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-600 resize-none h-auto" rows={4} value={p.body} onChange={(e) => updateM51('prompts', i, 'body', e.target.value)} />
                                                                    ) : p.body}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <NextStepBox type="コピー案" />
                                        </div>
                                    )}

                                    {/* M52: SNS & Educational Funnel */}
                                    {activeModule === "M52" && !data.m52Data && (
                                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-80 animate-in fade-in zoom-in duration-300">
                                            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                                                <Share2 size={40} />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-3">SNS・ファンネル設計の生成</h3>
                                            <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                                                X等のSNSでの教育発信プランと、<br />
                                                成約までの集客導線（ファンネル）を設計します。
                                            </p>
                                            <button
                                                onClick={handleGenerateDetail}
                                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-105 transition-all flex items-center"
                                            >
                                                <Zap className="mr-2" size={18} fill="currentColor" />
                                                ファンネル設計を生成
                                            </button>
                                        </div>
                                    )}
                                    {activeModule === "M52" && data.m52Data && (
                                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                            <div>
                                                <h3 className="text-xl font-black mb-6 flex items-center text-slate-800">
                                                    <Share2 className="mr-3 text-blue-500" size={24} />
                                                    X (Twitter) 戦略投稿 (SNS Posts)
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {data.m52Data.xPosts.map((p, i) => (
                                                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
                                                            <Twitter className="absolute top-6 right-6 text-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                                                            <div className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">
                                                                {isEditing ? <input className="bg-transparent border-b border-blue-200 w-16" value={p.type} onChange={(e) => updateM52('xPosts', i, 'type', e.target.value)} /> : p.type} POST
                                                            </div>
                                                            <div className="text-sm text-slate-700 font-medium leading-relaxed">
                                                                {isEditing ? (
                                                                    <textarea className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-800 resize-none h-auto font-sans" rows={6} value={p.draft} onChange={(e) => updateM52('xPosts', i, 'draft', e.target.value)} />
                                                                ) : <MarkdownText text={p.draft} />}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-12 opacity-5 blur-xl pointer-events-none">
                                                    <TrendingUp size={180} />
                                                </div>
                                                <h3 className="text-xl font-black mb-8 flex items-center">
                                                    <ArrowRightCircle className="mr-3 text-indigo-400" size={24} />
                                                    集客ファンネル設計 (Funnel Design)
                                                </h3>
                                                <div className="max-w-xl mx-auto space-y-4">
                                                    <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center font-bold text-lg">
                                                        {isEditing ? (
                                                            <textarea className="w-full bg-transparent border-none focus:ring-0 p-0 text-white text-center resize-none" rows={3} value={data.m52Data.funnelDesign} onChange={(e) => updateM52('funnelDesign', -1, null, e.target.value)} />
                                                        ) : data.m52Data.funnelDesign}
                                                    </div>
                                                    <div className="text-center text-[10px] text-indigo-300 font-black uppercase tracking-[0.3em]">
                                                        educational marketing path
                                                    </div>
                                                </div>
                                            </div>
                                            <NextStepBox type="ファンネル設計" />
                                        </div>
                                    )}

                                    {/* Generic Fallback for others */}
                                    {!["M00", "M10", "M11", "M12", "M20", "M21", "M30", "M31", "M40", "M50", "M51", "M52", "M60", "M61", "M92", "M99"].includes(activeModule) && (
                                        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6 opacity-80">
                                            <div className="w-20 h-20 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center animate-pulse">
                                                {activeModule === "M40" && <Cpu size={32} />}
                                                {activeModule === "M50" && <Smartphone size={32} />}
                                                {(activeModule === "M60" || activeModule === "M61") && <Library size={32} />}
                                                {activeModule === "M91" && <Calculator size={32} />}
                                            </div>
                                            <div className="text-center">
                                                <h3 className="font-black text-xl mb-2">モジュール：{data.selectedModules.find(m => m.id === activeModule)?.name}</h3>
                                                <p className="text-slate-500 max-w-sm mx-auto text-sm">
                                                    AIが現在詳細な構成案を作成中です。プレビューを表示するには、「詳細データを生成」をクリックしてください。
                                                </p>
                                            </div>
                                            <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: "30%" }} animate={{ width: "80%" }} transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                                                    className="h-full bg-blue-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* AI Advisor Section (Integrated / Horizontal) - Moved Outside for Visibility */}
                            <div id="ai-advisor-section" className="mt-8 bg-slate-900 text-white rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                    <Zap size={140} />
                                </div>

                                <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
                                    <div className="flex items-center space-x-5">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <LightbulbIcon className="text-white" size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tight flex items-center">
                                                AIアドバイザー (Strategic Consulting)
                                                <span className="ml-3 text-[10px] bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full font-black uppercase tracking-widest">Active</span>
                                            </h3>
                                            <p className="text-sm text-slate-400 mt-1">分析結果に基づき、戦略のブラッシュアップや具体施策についてAIと相談しましょう。</p>
                                        </div>
                                    </div>
                                    <div className="hidden lg:flex items-center space-x-3 text-xs font-bold text-slate-500">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="tracking-widest uppercase text-emerald-400">Analysis Context Connected</span>
                                    </div>
                                </div>

                                <div className="p-8 md:p-12 space-y-10 bg-slate-950/40">
                                    {/* AI Initial Note / Latest Advice */}
                                    <div className="flex items-start">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center text-xs font-black mr-6 text-blue-400 mt-1 shadow-inner">AI</div>
                                        <div className="flex-1 bg-slate-800/60 backdrop-blur-sm p-8 rounded-[2.5rem] rounded-tl-none border border-slate-700 text-base text-slate-200 shadow-xl">
                                            <MarkdownText text={analysis.aiNote || "これまでの分析に基づき、最適な戦略を提案できます。気になる点があればお聞きください。"} />
                                        </div>
                                    </div>

                                    {chatHistory.map((msg, i) => (
                                        <div key={i} className={cn("flex items-start animate-in fade-in slide-in-from-bottom-4 duration-500", msg.role === "user" ? "flex-row-reverse" : "max-w-5xl")}>
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-xs font-black shadow-xl mt-1",
                                                msg.role === "user" ? "bg-white text-slate-900 ml-6 border border-slate-200" : "bg-blue-600 text-white mr-6 border border-blue-400"
                                            )}>
                                                {msg.role === "user" ? "YOU" : "AI"}
                                            </div>
                                            <div className={cn(
                                                "p-8 rounded-[2.5rem] text-base leading-relaxed border relative shadow-xl overflow-hidden",
                                                msg.role === "user"
                                                    ? "bg-white text-slate-800 rounded-tr-none border-slate-100"
                                                    : "bg-slate-800 text-slate-200 rounded-tl-none border-slate-700 backdrop-blur-sm"
                                            )}>
                                                <MarkdownText text={msg.parts} />
                                            </div>
                                        </div>
                                    ))}

                                    {isChatLoading && (
                                        <div className="flex items-center space-x-4 text-slate-500 text-sm ml-18 bg-slate-900/50 p-4 rounded-full w-fit">
                                            <Loader2 size={20} className="animate-spin text-blue-500" />
                                            <span className="font-bold animate-pulse">AI思考中... 戦略を練っています</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 lg:p-12 bg-slate-900 border-t border-slate-800">
                                    <div className="max-w-4xl mx-auto">
                                        <div className="relative group">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200"></div>
                                            <div className="relative flex items-center bg-slate-950 rounded-[2rem] px-8 py-5 border border-slate-700 transition-all">
                                                <input
                                                    className="flex-1 bg-transparent text-white text-xl focus:outline-none placeholder:text-slate-600 font-medium"
                                                    placeholder="「集客を加速させるには？」「収益化のロードマップは？」など..."
                                                    value={chatInput}
                                                    onChange={(e) => setChatInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleSendMessage()}
                                                />
                                                <button
                                                    onClick={handleSendMessage}
                                                    disabled={!chatInput.trim() || isChatLoading}
                                                    className="ml-6 w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 active:scale-95 group-hover:rotate-12"
                                                >
                                                    <Send size={24} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex flex-wrap gap-3 justify-center">
                                            {[
                                                { t: "リスクと対策は？", i: <AlertCircle size={14} /> },
                                                { t: "集客の具体案は？", i: <Users size={14} /> },
                                                { t: "売上のシミュレーション", i: <TrendingUp size={14} /> },
                                                { t: "競合に勝つ差別化は？", i: <Zap size={14} /> }
                                            ].map((hint) => (
                                                <button
                                                    key={hint.t}
                                                    onClick={() => { setChatInput(hint.t) }}
                                                    className="flex items-center space-x-2 text-xs font-black text-slate-400 bg-slate-800/40 hover:bg-blue-600 hover:text-white hover:border-blue-400 px-5 py-2.5 rounded-full border border-slate-700 transition-all active:scale-95 shadow-sm"
                                                >
                                                    {hint.i}
                                                    <span>{hint.t}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                onClick={handleAddCustomModule}
                                className="mt-8 p-12 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4 group hover:border-blue-400 hover:bg-white transition-all cursor-pointer active:scale-95 shadow-sm"
                            >
                                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shadow-inner">
                                    <Plus size={32} />
                                </div>
                                <div className="text-sm font-black text-slate-500 group-hover:text-blue-600 transition-colors">
                                    カスタムモジュールを追加（標準以外の分析が必要な場合）
                                </div>
                                <div className="text-xs text-slate-300 group-hover:text-blue-400 font-medium">
                                    例：「特定の法規制調査」「社内稟議向けの対策」「ニッチ市場の深掘り」など
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Help Modal */}
                {showHelp && (
                    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                        <HelpCircle className="mr-3 text-blue-600" />
                                        使い方のクイックガイド
                                    </h2>
                                    <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">1</div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">視点を選ぶ</h3>
                                                <p className="text-sm text-slate-500">左側のメニューから、分析したいテーマ（市場、戦略など）を選びます。</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">2</div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">詳細を生成</h3>
                                                <p className="text-sm text-slate-500">概要を見てさらに深掘りしたい場合、「詳細データを生成」をクリック。</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">3</div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">自由に編集</h3>
                                                <p className="text-sm text-slate-500">記述内容はすべて編集可能。「編集モード」または直接クリックで修正できます。</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <h4 className="font-bold text-slate-600 mb-4 flex items-center"><Zap size={16} className="mr-2" /> Pro Tips</h4>
                                        <ul className="space-y-3 text-sm text-slate-600">
                                            <li className="flex items-start"><CheckCircle2 size={16} className="mr-2 text-green-500 mt-0.5" /> <span>右下のチャットボタンで、AIにいつでも相談や壁打ちができます。</span></li>
                                            <li className="flex items-start"><CheckCircle2 size={16} className="mr-2 text-green-500 mt-0.5" /> <span>左下「モジュールを追加」で、オリジナルの分析視点を追加できます。<span className="text-xs bg-slate-200 px-1 rounded ml-1">New</span></span></li>
                                            <li className="flex items-start"><CheckCircle2 size={16} className="mr-2 text-green-500 mt-0.5" /> <span>右上の「出力を生成」からPDF保存が可能。</span></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => setShowHelp(false)}
                                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                >
                                    始める
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Scroll Hint Popup */}
                {showScrollHint && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
                    >
                        <div className="bg-white/80 backdrop-blur-md text-slate-800 px-5 py-2.5 rounded-full shadow-xl flex items-center space-x-2 border border-blue-200/50 animate-bounce">
                            <ChevronDown size={18} className="text-blue-600" />
                            <span className="text-xs font-black tracking-tighter">スクロールして続きを表示</span>
                        </div>
                    </motion.div>
                )}
                {/* Generating Feedback Overlay */}
                {isGenerating && <GeneratingOverlay />}
        </div>
        </main >
    </div >
    );
};

export default Dashboard;

