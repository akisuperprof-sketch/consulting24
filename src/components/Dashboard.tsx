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
    RotateCcw,
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
    Library,
    Printer,
    FileDown,
    X,
    Edit3,
    Code,
    Menu,
    Maximize,
    Activity,
    Loader2,
    ArrowUpRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { AnalysisResult, chatWithAI } from "@/app/actions";

import { ModuleId, MODULES } from "@/lib/modules";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DashboardProps {
    analysis: AnalysisResult;
    onRestart: () => void;
}

export default function Dashboard({ analysis, onRestart }: DashboardProps) {
    const [activeModule, setActiveModule] = useState<ModuleId>(analysis.selectedModules[0].id);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isPresentationMode, setIsPresentationMode] = useState(false);

    // Data State (for editing)
    const [data, setData] = useState<AnalysisResult>(analysis);
    const [isEditing, setIsEditing] = useState(false);

    // History State
    const [savedReports, setSavedReports] = useState<{ id: string, date: string, title: string, data: AnalysisResult }[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("consulting_history");
        if (saved) {
            setSavedReports(JSON.parse(saved));
        }
    }, []);

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
    const [isChatOpen, setIsChatOpen] = useState(false);

    const handleGenerateDetail = () => {
        setIsGenerating(true);
        // Simulate AI thinking time
        setTimeout(() => {
            const newData = { ...data };
            let updated = false;

            if ((activeModule === "M10" || activeModule === "M11") && !newData.m10Data) {
                newData.m10Data = {
                    growthRate: "125%",
                    marketSize: "1.2兆円",
                    trends: ["AIによる個別最適化", "EdTechの普及", "リカレント教育の需要増"],
                    competitors: [
                        { name: "A社 (大手)", share: 45, strength: "ブランド力" },
                        { name: "B社 (新興)", share: 15, strength: "AI技術" },
                        { name: "C社", share: 8, strength: "価格" },
                    ]
                };
                updated = true;
            } else if (activeModule === "M20" && !newData.m20Data) {
                newData.m20Data = {
                    targetPersona: "30-40代のキャリアアップ志向層",
                    coreValue: "短期間で実務レベルのAIスキル習得",
                    channels: ["LinkedIn", "Tech系メディア", "ウェビナー"],
                    actionPlans: [
                        { task: "オンライン広告の出稿開始", priority: "High" },
                        { task: "無料ウェビナーの開催", priority: "High" },
                        { task: "パートナーシップの締結", priority: "Mid" }
                    ]
                };
                updated = true;
            } else if (activeModule === "M30" && !newData.m30Data) {
                newData.m30Data = {
                    fundingNeeds: "初期開発費として2000万円、運転資金として1000万円が必要。初年度は赤字想定だが、2年目以降の急成長で回収予定。",
                    milestones: [
                        { date: "2025-04", event: "プロトタイプ完成", phase: "Seed" },
                        { date: "2025-10", event: "β版リリース", phase: "Early" },
                        { date: "2026-04", event: "正式サービス開始", phase: "Growth" }
                    ],
                    plSimulation: [
                        { year: 1, revenue: 3000, profit: -1000 },
                        { year: 2, revenue: 8000, profit: 500 },
                        { year: 3, revenue: 20000, profit: 5000 },
                        { year: 4, revenue: 45000, profit: 12000 },
                        { year: 5, revenue: 80000, profit: 25000 }
                    ]
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
            }

            if (updated) {
                setData(newData);
            } else {
                alert("データは既にあるか、対象外のモジュールです");
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

    // Helper to update deeply nested M00/M20 data safely
    const updateM00 = (field: 'problems' | 'goals', index: number, value: string) => {
        if (!data.m00Data) return;
        const newData = { ...data };
        if (newData.m00Data) {
            const list = [...newData.m00Data[field]];
            list[index] = value;
            newData.m00Data[field] = list;
            setData(newData);
        }
    };

    const updateM20 = (field: 'targetPersona' | 'coreValue', value: string) => {
        if (!data.m20Data) return;
        const newData = { ...data };
        if (newData.m20Data) {
            newData.m20Data[field] = value;
            setData(newData);
        }
    };

    const updateM10 = (field: keyof NonNullable<AnalysisResult['m10Data']>, index: number = -1, subField: 'name' | 'share' | null = null, value: string | number) => {
        if (!data.m10Data) return;
        const newData = { ...data };
        if (newData.m10Data) { // Ensure m10Data exists before proceeding
            if (field === 'trends' && index >= 0) {
                const list = [...newData.m10Data.trends];
                list[index] = value as string; // trends are strings
                newData.m10Data.trends = list;
            } else if (field === 'competitors' && index >= 0 && subField) {
                const list = [...newData.m10Data.competitors];
                list[index] = { ...list[index], [subField]: subField === 'share' ? Number(value) : value };
                newData.m10Data.competitors = list;
            } else if (field !== 'trends' && field !== 'competitors') {
                // For 'marketSize' and 'growthRate'
                (newData.m10Data as any)[field] = value;
            }
            setData(newData);
        }
    };

    // Helper for M60 (App Dev)
    const updateM60 = (field: 'concept' | 'features' | 'techStack', index: number = -1, value: string) => {
        if (!data.m60Data) return;
        const newData = { ...data };
        if (newData.m60Data) {
            if (field === 'features' && index >= 0) {
                const list = [...newData.m60Data.features];
                list[index] = value;
                newData.m60Data.features = list;
            } else if (field === 'techStack' && index >= 0) {
                const list = [...newData.m60Data.techStack];
                list[index] = value;
                newData.m60Data.techStack = list;
            } else if (field === 'concept') {
                newData.m60Data.concept = value;
            }
            setData(newData);
        }
    };

    // M30 Update Helper with Simulation Logic
    const updateM30 = (field: 'milestones' | 'fundingNeeds', index: number = -1, subField: 'event' | 'date' | 'phase' | null = null, value: string) => {
        if (!data.m30Data) return;
        const newData = { ...data };
        if (newData.m30Data) {
            if (field === 'milestones' && index >= 0 && subField) {
                const list = [...newData.m30Data.milestones];
                list[index] = { ...list[index], [subField]: value };
                newData.m30Data.milestones = list;
            } else if (field === 'fundingNeeds') {
                newData.m30Data.fundingNeeds = value;
            }
            setData(newData);
        }
    };

    // Dynamic Logic for Sliders (Temporary State)
    const [revenueMultiplier, setRevenueMultiplier] = useState(1.0);
    const [costMultiplier, setCostMultiplier] = useState(1.0);

    const simulatedPL = data.m30Data?.plSimulation.map(item => ({
        ...item,
        revenue: Math.round(item.revenue * revenueMultiplier),
        profit: Math.round(item.revenue * revenueMultiplier * 0.4 * (2 - costMultiplier)) // Simplified logic: Profit follows revenue but impacted by cost
    }));

    const updateM40 = (field: 'bottlenecks' | 'improvementPlan', index: number, value: string) => {
        if (!data.m40Data) return;
        const newData = { ...data };
        if (newData.m40Data) {
            const list = [...newData.m40Data[field]];
            list[index] = value;
            newData.m40Data[field] = list;
            setData(newData);
        }
    };

    const updateM50 = (field: 'themes' | 'kpis', index: number, subField: 'metric' | 'target' | null = null, value: string) => {
        if (!data.m50Data) return;
        const newData = { ...data };
        if (newData.m50Data) {
            if (field === 'themes') {
                const list = [...newData.m50Data.themes];
                list[index] = value;
                newData.m50Data.themes = list;
            } else if (field === 'kpis' && subField) {
                const list = [...newData.m50Data.kpis];
                list[index] = { ...list[index], [subField]: value };
                newData.m50Data.kpis = list;
            }
            setData(newData);
        }
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
                            {data.selectedModules.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => { setActiveModule(m.id); setIsMobileMenuOpen(false); }}
                                    className={cn(
                                        "w-full flex items-center px-3 py-2.5 rounded-xl transition-all whitespace-nowrap",
                                        activeModule === m.id
                                            ? "bg-blue-50 text-blue-600 font-bold shadow-sm"
                                            : "text-slate-600 hover:bg-slate-50",
                                        !isSidebarExpanded && "justify-center px-0"
                                    )}
                                >
                                    <Layers size={18} className={cn("opacity-70 flex-shrink-0", isSidebarExpanded ? "mr-3" : "mr-0")} />
                                    {isSidebarExpanded && <span className="text-sm">{m.name}</span>}
                                    {isSidebarExpanded && activeModule === m.id && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                                </button>
                            ))}

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
                                        onClick={() => { setActiveModule(m.id); setIsMobileMenuOpen(false); }}
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
                        {!isPresentationMode && <span className="text-slate-400 print:hidden hidden sm:inline">プロジェクト /</span>}
                        <span className={cn("font-bold text-slate-900 text-lg lg:text-xl print:text-3xl truncate transition-all max-w-[200px] lg:max-w-md", isPresentationMode && "text-2xl lg:text-3xl max-w-full")}>{data.refinedGoal}</span>
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
                <div className={cn(
                    "flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 bg-[#f8fafc] transition-all",
                    isPresentationMode && "bg-white p-12 lg:p-20"
                )}>
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
                        <div className="flex items-center space-x-4 w-full">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {activeModule === "M92" ? "履歴管理" : data.selectedModules.find(m => m.id === activeModule)?.name}
                            </h2>
                            {activeModule !== "M92" && (
                                <span className="hidden sm:inline-block px-3 py-1 bg-green-100 text-green-700 text-[10px] rounded-full uppercase tracking-widest font-black">
                                    Ready for Deep Analysis
                                </span>
                            )}
                        </div>
                        {activeModule !== "M92" && (
                            <div className="flex items-center space-x-2 w-full lg:w-auto mt-4 lg:mt-0">
                                <button
                                    onClick={() => {
                                        setIsChatOpen(true);
                                    }}
                                    className="flex-1 lg:flex-none px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold transition-all active:scale-95"
                                >
                                    AIに詳しく聞く
                                </button>
                                <button
                                    onClick={handleGenerateDetail}
                                    className="flex-1 lg:flex-none px-4 py-2 text-sm bg-blue-600 text-white border border-blue-600 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 whitespace-nowrap active:scale-95"
                                >
                                    詳細データを生成
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Analysis Workspace (Full Width now) */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 lg:p-10 min-h-[600px] relative overflow-hidden">
                                {/* Watermark for skeleton */}
                                <div className="absolute top-10 right-10 flex items-center space-x-2 text-slate-100 select-none">
                                    <BarChart3 size={120} className="rotate-12 opacity-50" />
                                </div>

                                <div className="relative z-10">
                                    {/* M00: Structure */}
                                    {activeModule === "M00" && data.m00Data && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            {/* Top Actions for Landing */}
                                            <div className="col-span-full flex justify-end space-x-4 mb-4">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm("新規に分析を開始しますか？（現在の未保存データはクリアされます）")) {
                                                            window.location.reload();
                                                        }
                                                    }}
                                                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                                                >
                                                    <RotateCcw size={14} className="inline mr-1" />
                                                    新規作成 (Reset)
                                                </button>
                                                <button
                                                    onClick={() => setActiveModule("M92")}
                                                    className="px-6 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-200 transition-colors flex items-center shadow-sm"
                                                >
                                                    <Library size={16} className="mr-2" />
                                                    履歴から続ける (Resume)
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center space-x-3 text-rose-600 font-black text-xs uppercase tracking-widest">
                                                    <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">!</div>
                                                    <span>課題 (Core Problems)</span>
                                                </div>
                                                <div className="space-y-4">
                                                    {data.m00Data.problems.map((p, i) => (
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                                            key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl text-slate-700 font-medium leading-relaxed"
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
                                                            key={i} className="p-6 bg-blue-50/30 border border-blue-100/50 rounded-3xl text-slate-700 font-medium leading-relaxed italic"
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
                                    )}

                                    {/* M20: Sales Strategy */}
                                    {activeModule === "M20" && data.m20Data && (
                                        <div className="space-y-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="p-10 bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-100 rounded-[3rem] group">
                                                    <Users size={32} className="text-indigo-600 mb-6 group-hover:scale-110 transition-transform" />
                                                    <h4 className="font-black text-xs text-indigo-700 uppercase tracking-widest mb-4">Target Persona</h4>
                                                    {isEditing ? (
                                                        <input
                                                            className="w-full text-xl font-bold text-slate-800 bg-white/50 border-b border-indigo-200 focus:outline-none focus:border-indigo-500 rounded px-2 py-1"
                                                            value={data.m20Data.targetPersona}
                                                            onChange={(e) => updateM20('targetPersona', e.target.value)}
                                                        />
                                                    ) : (
                                                        <p className="text-xl font-bold text-slate-800 leading-tight">{data.m20Data.targetPersona}</p>
                                                    )}
                                                </div>
                                                <div className="p-10 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-100 rounded-[3rem] group">
                                                    <ShieldCheck size={32} className="text-emerald-600 mb-6 group-hover:scale-110 transition-transform" />
                                                    <h4 className="font-black text-xs text-emerald-700 uppercase tracking-widest mb-4">Core Value</h4>
                                                    {isEditing ? (
                                                        <input
                                                            className="w-full text-xl font-bold text-slate-800 bg-white/50 border-b border-emerald-200 focus:outline-none focus:border-emerald-500 rounded px-2 py-1"
                                                            value={data.m20Data.coreValue}
                                                            onChange={(e) => updateM20('coreValue', e.target.value)}
                                                        />
                                                    ) : (
                                                        <p className="text-xl font-bold text-slate-800 leading-tight">{data.m20Data.coreValue}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <h4 className="font-black text-xs text-slate-400 uppercase tracking-widest px-4">アクションロードマップ</h4>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {data.m20Data.actionPlans.map((plan, i) => (
                                                        <div key={i} className="flex items-center p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
                                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-sm font-black text-slate-300 mr-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                                {String(i + 1).padStart(2, "0")}
                                                            </div>
                                                            <div className="flex-1 font-bold text-slate-700">{plan.task}</div>
                                                            <span className={cn(
                                                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                                                plan.priority === "High" ? "bg-rose-100 text-rose-600" :
                                                                    plan.priority === "Mid" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"
                                                            )}>
                                                                {plan.priority} Priority
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* M10/M11: Market Analysis (Data-Driven) */}
                                    {(activeModule === "M10" || activeModule === "M11") && data.m10Data && (
                                        <div className="space-y-10">
                                            <div className="flex items-center space-x-3 mb-8">
                                                <Globe className="text-blue-500" />
                                                <span className="font-black text-sm uppercase tracking-widest">市場環境・競合分析 (Market Analysis)</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                <div className="h-32 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-end p-6 relative">
                                                    <div className="absolute top-6 left-6 font-bold text-xs text-slate-400">市場成長率</div>
                                                    {isEditing ? (
                                                        <input className="font-black text-3xl text-slate-800 bg-transparent border-b border-slate-300 focus:outline-none w-full" value={data.m10Data.growthRate} onChange={(e) => updateM10('growthRate', -1, null, e.target.value)} />
                                                    ) : (
                                                        <div className="font-black text-3xl text-slate-800">{data.m10Data.growthRate}</div>
                                                    )}
                                                </div>
                                                <div className="h-32 bg-slate-50 border border-slate-100 rounded-3xl p-6 relative flex flex-col justify-end">
                                                    <div className="absolute top-6 left-6 font-bold text-xs text-slate-400">市場規模 (Est.)</div>
                                                    {isEditing ? (
                                                        <input className="font-black text-xl text-slate-800 leading-tight bg-transparent border-b border-slate-300 focus:outline-none w-full" value={data.m10Data.marketSize} onChange={(e) => updateM10('marketSize', -1, null, e.target.value)} />
                                                    ) : (
                                                        <div className="font-black text-xl text-slate-800 leading-tight">{data.m10Data.marketSize}</div>
                                                    )}
                                                </div>
                                                <div className="h-32 bg-slate-50 border border-slate-100 rounded-3xl p-6 relative flex flex-col justify-end">
                                                    <div className="absolute top-6 left-6 font-bold text-xs text-slate-400">Top Trend</div>
                                                    <div className="font-bold text-sm text-blue-600 line-clamp-2">{data.m10Data.trends[0]}</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="p-8 border border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                                                    <h5 className="font-bold mb-6 text-sm text-slate-500 uppercase">主要競合分析 (Editable)</h5>
                                                    <div className="space-y-4">
                                                        {data.m10Data.competitors.map((c, i) => (
                                                            <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                                                                {isEditing ? (
                                                                    <>
                                                                        <input className="font-bold text-slate-700 bg-transparent border-b border-slate-200 w-1/2" value={c.name} onChange={(e) => updateM10('competitors', i, 'name', e.target.value)} />
                                                                        <div className="flex items-center">
                                                                            <span className="text-xs font-bold text-slate-400 mr-1">Share:</span>
                                                                            <input className="text-xs font-bold text-slate-600 bg-transparent border-b border-slate-200 w-12" type="number" value={c.share} onChange={(e) => updateM10('competitors', i, 'share', e.target.value)} />
                                                                            <span className="text-xs font-bold text-slate-400 ml-1">%</span>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="font-bold text-slate-700">{c.name}</div>
                                                                        <div className="text-xs font-bold text-slate-400">Share: {c.share}%</div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-8 border border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                                                    <h5 className="font-bold mb-6 text-sm text-slate-500 uppercase">市場トレンド</h5>
                                                    <div className="space-y-3">
                                                        {data.m10Data.trends.map((t, i) => (
                                                            <div key={i} className="flex items-start text-sm font-medium text-slate-700">
                                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                                                                {isEditing ? (
                                                                    <input className="bg-transparent border-b border-slate-300 focus:outline-none w-full" value={t} onChange={(e) => updateM10('trends', i, null, e.target.value)} />
                                                                ) : t}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* M30/M31: Business & Finance (Data-Driven) */}
                                    {(activeModule === "M30" || activeModule === "M31") && data.m30Data && (
                                        <div className="space-y-10">
                                            <div className="flex items-center space-x-3 mb-8 text-emerald-600">
                                                <TrendingUp />
                                                <span className="font-black text-sm uppercase tracking-widest">Business Plan & Financial Structure</span>
                                            </div>
                                            {/* M30: Business Plan (Simulation) */}
                                            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden">
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
                                                                        <input className="text-xs text-slate-400 font-bold bg-transparent border-b border-slate-300 w-full mb-1" value={m.date} onChange={(e) => updateM30('milestones', i, 'date', e.target.value)} />
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
                                                <div className="p-8 bg-slate-900 text-white rounded-[2.5rem]">
                                                    <h5 className="font-bold mb-4 text-xs text-slate-400">資金調達ニーズ</h5>
                                                    {isEditing ? (
                                                        <textarea
                                                            className="w-full h-full bg-transparent text-sm font-medium leading-relaxed opacity-90 border border-slate-700 rounded p-2 focus:outline-none"
                                                            value={data.m30Data.fundingNeeds}
                                                            onChange={(e) => updateM30('fundingNeeds', -1, null, e.target.value)}
                                                        />
                                                    ) : (
                                                        <div className="text-sm font-medium leading-relaxed opacity-90">{data.m30Data.fundingNeeds}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* M40: Operation (Data-Driven) */}
                                    {activeModule === "M40" && data.m40Data && (
                                        <div className="space-y-8">
                                            <div className="flex items-center space-x-3 mb-8 text-amber-600">
                                                <Cpu />
                                                <span className="font-black text-sm uppercase tracking-widest">オペレーション最適化 (Operation)</span>
                                            </div>
                                            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                                <h5 className="font-bold mb-6 text-sm text-slate-500 uppercase">現状のボトルネック</h5>
                                                <div className="space-y-3">
                                                    {data.m40Data.bottlenecks.map((b, i) => (
                                                        <div key={i} className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-red-100">
                                                            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                                                            {isEditing ? (
                                                                <input className="font-medium text-slate-700 w-full bg-transparent border-b border-slate-200" value={b} onChange={(e) => updateM40('bottlenecks', i, e.target.value)} />
                                                            ) : (
                                                                <span className="font-medium text-slate-700">{b}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100">
                                                <h5 className="font-bold mb-6 text-sm text-blue-500 uppercase">改善プラン</h5>
                                                <div className="space-y-3">
                                                    {data.m40Data.improvementPlan.map((p, i) => (
                                                        <div key={i} className="flex items-center space-x-3">
                                                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">{i + 1}</div>
                                                            {isEditing ? (
                                                                <input className="font-bold text-slate-700 w-full bg-transparent border-b border-blue-200" value={p} onChange={(e) => updateM40('improvementPlan', i, e.target.value)} />
                                                            ) : (
                                                                <span className="font-bold text-slate-700">{p}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* M50: SNS/Content (Data-Driven) */}
                                    {activeModule === "M50" && data.m50Data && (
                                        <div className="space-y-8">
                                            <div className="flex items-center space-x-3 mb-8 text-pink-600">
                                                <Smartphone />
                                                <span className="font-black text-sm uppercase tracking-widest">コンテンツ・SNS戦略 (Marketing)</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-6">
                                                {data.m50Data.kpis.map((k, i) => (
                                                    <div key={i} className="p-6 bg-pink-50 rounded-3xl border border-pink-100 text-center">
                                                        {isEditing ? (
                                                            <>
                                                                <input className="text-xs font-bold text-pink-400 mb-2 bg-transparent border-b border-pink-200 w-full text-center" value={k.metric} onChange={(e) => updateM50('kpis', i, 'metric', e.target.value)} />
                                                                <input className="text-xl font-black text-pink-600 bg-transparent border-b border-pink-200 w-full text-center" value={k.target} onChange={(e) => updateM50('kpis', i, 'target', e.target.value)} />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="text-xs font-bold text-pink-400 mb-2">{k.metric}</div>
                                                                <div className="text-xl font-black text-pink-600">{k.target}</div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100">
                                                <h5 className="font-bold mb-6 text-sm text-slate-500 uppercase">推奨コンテンツテーマ</h5>
                                                <div className="flex flex-wrap gap-3">
                                                    {data.m50Data.themes.map((t, i) => (
                                                        <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200">
                                                            {isEditing ? (
                                                                <input className="bg-transparent border-b border-slate-300 w-24" value={t} onChange={(e) => updateM50('themes', i, null, e.target.value)} />
                                                            ) : `# ${t}`}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
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
                                    {(activeModule === "M60" || activeModule === "M61") && data.m60Data && (
                                        <div className="space-y-8">
                                            <div className="flex items-center space-x-3 mb-8 text-indigo-600">
                                                <Smartphone />
                                                <span className="font-black text-sm uppercase tracking-widest">App Development & Scale</span>
                                            </div>
                                            <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
                                                <h5 className="font-bold mb-4 text-xs text-indigo-400 tracking-widest uppercase">Concept Definition</h5>
                                                {isEditing ? (
                                                    <textarea
                                                        className="w-full h-24 bg-transparent text-2xl font-black text-indigo-900 leading-snug border-b border-indigo-200 focus:outline-none resize-none"
                                                        value={data.m60Data.concept}
                                                        onChange={(e) => updateM60('concept', -1, e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="text-2xl font-black text-indigo-900 leading-snug relative z-10">
                                                        {data.m60Data.concept}
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    )}

                                    {/* Floating Chat Button & Drawer */}
                                    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end print:hidden">
                                        {/* Chat Window */}
                                        {isChatOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                                className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden"
                                            >
                                                <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                                                    <h4 className="font-bold flex items-center text-sm">
                                                        <LightbulbIcon className="mr-2 text-yellow-400" size={16} />
                                                        AIアドバイザー (AI Advisor)
                                                    </h4>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded text-white font-bold">BETA</span>
                                                        <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
                                                    <div className="flex items-start">
                                                        <div className="w-6 h-6 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold mr-2">AI</div>
                                                        <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none text-xs text-slate-300 leading-relaxed">
                                                            {analysis.aiNote}
                                                        </div>
                                                    </div>
                                                    {chatHistory.map((msg, i) => (
                                                        <div key={i} className={cn("flex items-start", msg.role === "user" ? "flex-row-reverse" : "")}>
                                                            <div className={cn(
                                                                "w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold",
                                                                msg.role === "user" ? "bg-slate-200 text-slate-900 ml-2" : "bg-blue-600 mr-2"
                                                            )}>
                                                                {msg.role === "user" ? "You" : "AI"}
                                                            </div>
                                                            <div className={cn(
                                                                "p-2.5 rounded-2xl text-xs max-w-[85%] leading-relaxed",
                                                                msg.role === "user" ? "bg-white text-slate-900 rounded-tr-none" : "bg-slate-800 text-slate-300 rounded-tl-none"
                                                            )}>
                                                                {msg.parts}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {isChatLoading && (
                                                        <div className="flex items-center space-x-2 text-slate-400 text-xs ml-9">
                                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-3 bg-slate-800 border-t border-slate-700">
                                                    <div className="flex items-center bg-slate-900 rounded-xl px-3 py-2 border border-slate-700 focus-within:border-blue-500 transition-colors">
                                                        <input
                                                            className="flex-1 bg-transparent text-white text-xs focus:outline-none"
                                                            placeholder="質問を入力..."
                                                            value={chatInput}
                                                            onChange={(e) => setChatInput(e.target.value)}
                                                            onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleSendMessage()}
                                                        />
                                                        <button
                                                            onClick={handleSendMessage}
                                                            disabled={!chatInput.trim() || isChatLoading}
                                                            className="ml-2 text-blue-500 hover:text-blue-400 disabled:opacity-50 transition-colors"
                                                        >
                                                            <Send size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        <button
                                            onClick={() => setIsChatOpen(!isChatOpen)}
                                            className="w-14 h-14 bg-slate-900 hover:bg-black text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 relative group"
                                        >
                                            {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
                                            {!isChatOpen && (
                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                                            )}
                                            {/* Tooltip */}
                                            <span className="absolute right-full mr-4 bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                AI Advisor
                                            </span>
                                        </button>
                                    </div>

                                    {activeModule === "M60" && data.m60Data && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="p-8 border border-slate-100 rounded-[2.5rem] bg-white shadow-sm">
                                                <h5 className="font-bold mb-6 text-sm text-slate-500 uppercase flex items-center">
                                                    <Layers size={16} className="mr-2" /> Key Features
                                                </h5>
                                                <div className="space-y-4">
                                                    {data.m60Data.features.map((f, i) => (
                                                        <div key={i} className="flex items-center space-x-3 group">
                                                            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                                F{i + 1}
                                                            </div>
                                                            {isEditing ? (
                                                                <input
                                                                    className="font-bold text-slate-700 bg-transparent border-b border-slate-200 w-full"
                                                                    value={f}
                                                                    onChange={(e) => updateM60('features', i, e.target.value)}
                                                                />
                                                            ) : (
                                                                <div className="font-bold text-slate-700">{f}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-8 border border-slate-100 rounded-[2.5rem] bg-slate-900 text-white shadow-sm">
                                                <h5 className="font-bold mb-6 text-sm text-slate-400 uppercase flex items-center">
                                                    <Code size={16} className="mr-2" /> Tech Stack Strategy
                                                </h5>
                                                <div className="space-y-3">
                                                    {data.m60Data.techStack.map((t, i) => (
                                                        <div key={i} className="flex items-center space-x-3 py-2 border-b border-slate-800">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                            {isEditing ? (
                                                                <input
                                                                    className="font-mono text-sm text-emerald-400 bg-transparent focus:outline-none w-full"
                                                                    value={t}
                                                                    onChange={(e) => updateM60('techStack', i, e.target.value)}
                                                                />
                                                            ) : (
                                                                <div className="font-mono text-sm text-emerald-400">{t}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>


                                        </div>
                                    )}

                                    {/* Generic Fallback for others (M91 only now) */}
                                    {!["M00", "M10", "M11", "M20", "M30", "M31", "M40", "M50", "M60", "M61", "M92"].includes(activeModule) && (
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
                                                    AIが現在詳細な構成案を作成中です。プレビューを表示するには、上の「詳細データを生成」をクリックしてください。
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
                        </div>
                    </div>
                </div>
        </div>
                    </main >
                </div >
        </div >
    );
}
