export interface Contributor {
  author: string
  commits?: number
  ownership_pct: number
}

export interface OriginalityResult {
  score: number
  assessment: string
  explanation: string
}

export interface PlagiarismResult {
  internal_duplication_pct: number
  high_duplication_pairs: { file1: string; file2: string; similarity: number }[]
  originality: OriginalityResult
}

export interface CodeQuality {
  bugs?: number
  code_smells?: number
  sqale_rating?: string
  [key: string]: unknown
}

export interface AnalysisDetails {
  stars: number
  open_issues: number
  bus_factor: number
  bus_factor_data?: {
    bus_factor: number
    total_contributors: number
    top_contributors: Contributor[]
  }
  is_stagnant: boolean
  commits_analyzed: number
  tech_debt_ratio: number
  file_metrics?: Record<string, unknown>
  plagiarism?: PlagiarismResult
  code_quality?: CodeQuality
}

export interface ChartData {
  activity_trend: Record<string, number>
  intent_breakdown: Record<string, number>
}

export interface AnalysisResult {
  status: string
  message: string
  details: AnalysisDetails
  chart_data: ChartData
  pdf_url?: string
  health_score: number
}

export interface HistoryItem {
  id: number
  repo_name: string
  status: string
  score: number
  summary: string
  analyzed_at: string
  pdf_url?: string
}

export type ProgressFn = (message: string, progress: number | null) => void
