export type ModuleId =
    | "M00" | "M10" | "M11" | "M12" | "M20"
    | "M30" | "M31" | "M40" | "M50" | "M60"
    | "M61" | "M90" | "M91" | "M92" | "M99";

export interface ModuleDefinition {
    id: ModuleId;
    name: string;
    description: string;
    category: "structure" | "analysis" | "strategy" | "execution" | "dev" | "utility";
}

export const MODULES: Record<ModuleId, ModuleDefinition> = {
    M00: { id: "M00", name: "構造化整理", description: "課題/ゴール/前提/制約の整理", category: "structure" },
    M10: { id: "M10", name: "探索分析", description: "PEST/SWOT等を用いた広範な探索", category: "analysis" },
    M11: { id: "M11", name: "市場・競合・ターゲット", description: "3C/競合ベンチ/ペルソナ", category: "analysis" },
    M12: { id: "M12", name: "トレンド・キーワード", description: "SNS・記事向けトレンド解析", category: "analysis" },
    M20: { id: "M20", name: "販売戦略・方針転換", description: "売上不振の打開策提言", category: "strategy" },
    M30: { id: "M30", name: "事業計画書", description: "公的/金融向けテンプレ生成", category: "strategy" },
    M31: { id: "M31", name: "資金調達支援", description: "融資/補助金/制度整理", category: "strategy" },
    M40: { id: "M40", name: "業務改善・経理", description: "業務棚卸し/効率化", category: "execution" },
    M50: { id: "M50", name: "SNS・記事・発信", description: "コンテンツ企画/運用設計", category: "execution" },
    M60: { id: "M60", name: "アプリ開発支援", description: "要件/画面/機能定義", category: "dev" },
    M61: { id: "M61", name: "システム仕様書", description: "技術仕様/画面構成詳細", category: "dev" },
    M90: { id: "M90", name: "出力オーケストレーター", description: "PDF/Word/MD生成", category: "utility" },
    M91: { id: "M91", name: "シミュレーション生成", description: "計算式入りSpreadsheet生成", category: "utility" },
    M92: { id: "M92", name: "履歴管理", description: "保存/再編集", category: "utility" },
    M99: { id: "M99", name: "カスタムモジュール", description: "ユーザー定義の汎用モジュール", category: "utility" },
};
