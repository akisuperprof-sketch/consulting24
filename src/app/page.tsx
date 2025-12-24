"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  FileText,
  Lightbulb,
  Share2,
  Settings,
  AppWindow,
  HelpCircle,
  Briefcase,
  Target,
  Rocket,
  Zap,
  ChevronDown,
  Beaker,
  Trash2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { analyzeProject, AnalysisResult } from "./actions";
import Dashboard from "@/components/Dashboard";

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [clientTypes, setClientTypes] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showDevTools, setShowDevTools] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem("consulting24_state");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSelectedGoals(data.selectedGoals || []);
        setClientTypes(data.clientTypes || []);
        setFreeText(data.freeText || "");
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("consulting24_state", JSON.stringify({ selectedGoals, clientTypes, freeText }));
  }, [selectedGoals, clientTypes, freeText]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const toggleClientType = (typeId: string) => {
    setClientTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleStartAnalysis = async (customGoals?: string[], customTypes?: string[], customText?: string) => {
    const finalGoals = customGoals || selectedGoals;
    const finalTypes = customTypes || clientTypes;
    const finalText = customText || freeText;

    if (!finalGoals.length && !finalText) return;

    setIsAnalyzing(true);
    setStep(4);

    try {
      const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
      const [result] = await Promise.all([
        analyzeProject(finalGoals.map(id => goals.find(g => g.id === id)?.label || id), finalTypes, finalText),
        minDelay
      ]);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const goals = [
    { id: "revenue", label: "売上を改善したい", icon: TrendingUp },
    { id: "strategy", label: "販売戦略／新しい方針を考えたい", icon: Target },
    { id: "bizplan", label: "事業計画を整理したい", icon: FileText },
    { id: "finance", label: "資金調達・融資を考えたい", icon: Briefcase },
    { id: "product", label: "商品・サービスの方向性を考えたい", icon: Lightbulb },
    { id: "sns", label: "SNS／記事／発信内容を作りたい", icon: Share2 },
    { id: "efficiency", label: "業務効率・経理を改善したい", icon: Settings },
    { id: "app", label: "アプリを作りたい", icon: AppWindow },
    { id: "spec", label: "仕様書を作りたい", icon: FileText },
    { id: "unknown", label: "まだ整理できていない", icon: HelpCircle },
  ];

  const simulationPatterns = [
    { name: "副業ライター (月5万)", goals: ["sns"], types: ["個人"], text: "副業でプログラミング記事を書いて月5万円稼ぎたい。具体的な運用設計とテーマ案がほしい。" },
    { name: "B2B製造業 (リード獲得)", goals: ["revenue", "strategy"], types: ["法人"], text: "自社開発SaaSのリード獲得に苦戦中。デジタルマーケティングへの切り替えと、ターゲット選定、訴求整理を行いたい。" },
    { name: "歯科医院 (HP/アプリ)", goals: ["app", "spec"], types: ["法人"], text: "医院のHPリニューアルと予約管理アプリ導入を検討中。LP構成案と機能仕様書が必要。" },
    { name: "コーチング独立 (LINE)", goals: ["unknown", "product"], types: ["その他"], text: "コーチングで独立予定。公式LINEを活用したマーケティング導線とステップ配信案を検討したい。" },
    { name: "副収入サラリーマン", goals: ["revenue"], types: ["個人"], text: "月10万円の副収入を得たい。スキルはないが時間は確保できる。再現性の高いモデルを診断してほしい。" },
    { name: "老舗卸売 (DX効率化)", goals: ["efficiency"], types: ["法人"], text: "紙・FAX中心の業務をデジタル化したい。ITリテラシー低めの社員でも扱えるツールとフロー案。" },
    { name: "Startup (融資1千万)", goals: ["bizplan", "finance"], types: ["スタートアップ"], text: "AI教育サービスで創業。公庫融資1,000万円のための事業計画書と3ヶ年の収支シミュレーション。" },
    { name: "地酒リブラディング", goals: ["product"], types: ["既存事業"], text: "若年層向けに地酒をリブランドしたい。20-30代女性をターゲットにしたブランドコンセプト案。" },
    { name: "個人カフェ (SNS集客)", goals: ["sns", "revenue"], types: ["個人"], text: "インスタフォロワー3,000人いるが来店に結びつかない。リピートを促す施策と限定メニュー案。" },
    { name: "知人紹介 (全般整理)", goals: ["unknown"], types: ["知人／紹介案件"], text: "新規事業を作りたいがアイデアが多く絞れない。PEST分析等を用いて勝率の高い案を3つ選定したい。" },
  ];

  if (step === 5 && analysisResult) {
    return <Dashboard analysis={analysisResult} onRestart={() => setStep(0)} />;
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#fdfdfd] text-[#1a1a1a]">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-50 pointer-events-none" />

      {/* Dev Toolbox */}
      <div className={cn(
        "fixed right-6 bottom-6 z-50 transition-all duration-300",
        showDevTools ? "w-80" : "w-14"
      )}>
        <button
          onClick={() => setShowDevTools(!showDevTools)}
          className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform mb-3 ml-auto relative"
        >
          {showDevTools ? <ChevronDown /> : <Beaker size={24} />}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        </button>

        <AnimatePresence>
          {showDevTools && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2rem] shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-bold text-sm text-slate-800 flex items-center">
                  <Zap size={14} className="mr-2 text-amber-500" />
                  爆速検証用パネル
                </span>
                <button
                  onClick={() => { localStorage.clear(); window.location.reload(); }}
                  className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                {simulationPatterns.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedGoals(p.goals);
                      setClientTypes(p.types);
                      setFreeText(p.text);
                      handleStartAnalysis(p.goals, p.types, p.text);
                      setShowDevTools(false);
                    }}
                    className="w-full text-left p-3 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-100"
                  >
                    {i + 1}. {p.name}
                  </button>
                ))}
              </div>
              <div className="pt-2 text-[10px] text-slate-400 text-center font-medium italic">
                ※ タップで入力を完了し解析を開始します
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-20 pb-20 relative z-10">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center space-y-8"
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-medium text-sm mb-4">
                <Rocket size={16} />
                <span>Next-Gen Consulting Intelligence</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
                AIビジネス戦略<br />
                <span className="text-blue-600">シュミレーター</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                あらゆるクライアントの多様な悩みに対して、<br />
                最短で“整理・判断・次の一手”を導き出す、<br />
                プロコンサルの思考回路を再現した統合支援アプリ。
              </p>
              <div className="pt-8">
                <button
                  onClick={() => setStep(1)}
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200"
                >
                  開始する
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">
                  今、何を解決したいですか？
                </h2>
                <p className="text-slate-500">
                  解決したい課題をすべて選択してください（複数選択可）
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = selectedGoals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={cn(
                        "flex items-center p-5 rounded-2xl border-2 transition-all duration-200 text-left group",
                        isSelected
                          ? "bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500"
                          : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-lg"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors",
                        isSelected ? "bg-blue-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500"
                      )}>
                        <Icon size={24} />
                      </div>
                      <span className={cn(
                        "font-semibold text-lg transition-colors",
                        isSelected ? "text-blue-900" : "text-slate-700"
                      )}>
                        {goal.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center pt-8">
                <button
                  disabled={selectedGoals.length === 0}
                  onClick={() => setStep(2)}
                  className={cn(
                    "px-10 py-4 rounded-xl font-bold transition-all duration-300 flex items-center",
                    selectedGoals.length > 0
                      ? "bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  )}
                >
                  次へ
                  <ArrowRight className="ml-2" size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">
                  対象の性質を教えてください
                </h2>
                <p className="text-slate-500">
                  分析のトーンと粒度を調整するために使用します（任意・スキップ可）
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {["個人", "法人", "スタートアップ", "既存事業", "知人／紹介案件", "その他"].map((type) => {
                  const isSelected = clientTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleClientType(type)}
                      className={cn(
                        "p-4 rounded-xl border transition-all text-center font-medium",
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                          : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                      )}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-slate-500 font-semibold hover:text-slate-800 transition-colors"
                >
                  戻る
                </button>
                <div className="space-x-4">
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-3 text-slate-400 font-medium hover:text-slate-600"
                  >
                    スキップ
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-10 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black shadow-lg"
                  >
                    次へ
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">
                  背景や悩みを自由に教えてください
                </h2>
                <p className="text-slate-500">
                  複雑な背景や、クライアントの生の声をそのまま入力してください。<br />
                  AIが内容を解析し、最適な分析モジュールを決定します。
                </p>
              </div>

              <div className="relative group">
                <textarea
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="例：商品は非常に良いが、3ヶ月前から売上が急減している。競合が参入してきた可能性があるが、具体的な対策が立てられていない。"
                  className="w-full h-64 p-6 bg-white border-2 border-slate-100 rounded-3xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-lg leading-relaxed shadow-sm group-hover:shadow-md"
                />
                <div className="absolute bottom-4 right-4 text-slate-300 text-sm">
                  AI解析に対応（長文・箇条書き可）
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 text-slate-500 font-semibold hover:text-slate-800"
                >
                  戻る
                </button>
                <button
                  onClick={() => handleStartAnalysis()}
                  className="relative group px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:scale-[1.02] transition-all overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    AIに解析させる
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">AI解析・判断</h2>
                <div className="inline-block px-4 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-semibold border border-amber-200">
                  {isAnalyzing ? "思考プロセス実行中..." : "解析完了"}
                </div>
              </div>

              {isAnalyzing || !analysisResult ? (
                <div className="max-w-md mx-auto space-y-8 py-10">
                  {[
                    "ゴールを再定義しています...",
                    "課題を構造化しています...",
                    "必要な分析レベルを判断しています...",
                    "最適なモジュールを選択しています..."
                  ].map((text, i) => (
                    <motion.div
                      key={text}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.8 }}
                      className="flex items-center space-x-4"
                    >
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-slate-600 font-medium">{text}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {/* Result Panel */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                      <h3 className="text-lg font-bold mb-4 flex items-center">
                        <Target className="mr-2 text-blue-600" size={20} />
                        検出されたゴール
                      </h3>
                      <p className="text-2xl font-bold text-slate-800 leading-tight">
                        「{analysisResult.refinedGoal}」
                      </p>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {analysisResult.tags.map(t => (
                          <span key={t} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm text-slate-600">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm">
                      <h3 className="text-lg font-bold mb-6">起動決定モジュール</h3>
                      <div className="space-y-4">
                        {analysisResult.selectedModules.map((m) => (
                          <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4">
                                {m.id}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800">{m.name}</div>
                                <div className="text-xs text-slate-500">{m.reason}</div>
                              </div>
                            </div>
                            <div className="text-blue-600 text-sm font-semibold">Ready</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-200">
                      <h3 className="font-bold mb-4">AIの判断メモ</h3>
                      <p className="text-sm leading-relaxed opacity-90">
                        {analysisResult.aiNote}
                      </p>
                    </div>

                    <button
                      onClick={() => setStep(5)}
                      className="w-full py-6 bg-slate-900 text-white rounded-3xl font-bold text-xl hover:bg-black transition-all shadow-lg flex items-center justify-center group"
                    >
                      ダッシュボード進む
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={() => setStep(3)}
                      className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-3xl font-bold hover:bg-slate-50 transition-all"
                    >
                      条件を修正する
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
