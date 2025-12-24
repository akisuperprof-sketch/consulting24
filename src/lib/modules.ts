export type ModuleId =
    | "M00" | "M10" | "M11" | "M12" | "M20" | "M21" | "M30" | "M31" | "M40" | "M50" | "M51" | "M52" | "M60" | "M61"
    | "M91" | "M90" | "M92" | "M99";

export interface ModuleDefinition {
    id: ModuleId;
    name: string;
    description: string;
    category: "structure" | "analysis" | "strategy" | "execution" | "dev" | "utility" | "proposal";
}

export const MODULES: Record<ModuleId, ModuleDefinition> = {
    M00: { id: "M00", name: "構造化整理", description: "課題/ゴール/前提/制約の整理", category: "structure" },
    M10: { id: "M10", name: "市場環境・競合インテリジェンス", description: "3C/PEST分析、競合ベンチ、トレンド根拠", category: "analysis" },
    M11: { id: "M11", name: "市場・詳細調査", description: "より深い市場・競合分析", category: "analysis" },
    M12: { id: "M12", name: "検索エンジン・キーワード戦略", description: "SEO・検索トレンド・プラットフォーム戦略", category: "analysis" },
    M20: { id: "M20", name: "販売戦略・成約導線設計", description: "ペルソナ、バリュープロップ、セールスフロー", category: "strategy" },
    M21: { id: "M21", name: "セミナー・商談設計", description: "台本、プレゼン構成、クロージング戦略", category: "strategy" },
    M30: { id: "M30", name: "事業収支・資金調達計画", description: "PLシミュレーション、マイルストーン、補助金・融資案", category: "strategy" },
    M31: { id: "M31", name: "詳細財務シミュレーション", description: "細かい変数を用いた収支試算", category: "strategy" },
    M40: { id: "M40", name: "業務改善・オペレーション", description: "業務棚卸し、効率化フロー、体制構築", category: "execution" },
    M50: { id: "M50", name: "コンテンツ・SNS広報戦略", description: "運用KPI、投稿案、コピーライティング、ファンネル設計", category: "execution" },
    M51: { id: "M51", name: "コピーライティング・訴求設計", description: "見出し案、LP構成、AIプロンプト", category: "execution" },
    M52: { id: "M52", name: "SNS運用・拡散戦略", description: "プラットフォーム別の投稿・拡散設計", category: "execution" },
    M60: { id: "M60", name: "プロダクト要件・技術仕様", description: "システムアーキテクチャ、データモデル、API、UXフロー", category: "dev" },
    M61: { id: "M61", name: "詳細技術仕様・設計図", description: "実装レベルの設計・フロー図", category: "dev" },
    M90: { id: "M90", name: "最終戦略提案書", description: "全モジュールを集約した1枚のコンサルティングシート", category: "proposal" },
    M91: { id: "M91", name: "シミュレーション生成", description: "計算式入り細密試算データの生成", category: "utility" },
    M92: { id: "M92", name: "履歴・バージョン管理", description: "分析ログの保存と再編集", category: "utility" },
    M99: { id: "M99", name: "カスタム・プロンプト", description: "自由形式の高度なAIコンサルティング", category: "utility" },
};
