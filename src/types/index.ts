export interface ColorSwatch {
  hex: string;
  name: string;
  role: string;
}

export interface FurnitureItem {
  name: string;
  category: string;
  description: string;
  estimatedPrice: number;
  priceRange: {
    low: number;
    high: number;
  };
  priority: "essential" | "recommended" | "optional";
}

export interface BudgetBreakdown {
  furniture: number;
  labor: number;
  decorAndAccessories: number;
  contingency: number;
  total: number;
}

export type ProposalTier = "basic" | "premium" | "smart";

export interface DesignProposal {
  id: string;
  tier: ProposalTier;
  styleName: string;
  tagline: string;
  description: string;
  keyChanges: string[];
  colorPalette: ColorSwatch[];
  furnitureItems: FurnitureItem[];
  budgetBreakdown: BudgetBreakdown;
  moodKeywords: string[];
  renderImageUrl?: string;
}

export interface AnalyzeResponse {
  proposals: [DesignProposal, DesignProposal, DesignProposal];
  roomDescription: string;
  analysisId: string;
}

export type BudgetRange =
  | "under_5k"
  | "5k_to_15k"
  | "15k_to_30k"
  | "over_30k";

export type StyleTag =
  | "modern"
  | "scandinavian"
  | "industrial"
  | "bohemian"
  | "traditional"
  | "minimalist"
  | "maximalist"
  | "coastal"
  | "mid_century";

export interface AnalyzeRequest {
  budgetRange?: BudgetRange;
  stylePreferences?: StyleTag[];
  additionalNotes?: string;
}

export interface RoomAISession {
  analysisResult: AnalyzeResponse;
  originalImageDataUrl: string;
  preferences: {
    budgetRange?: BudgetRange;
    stylePreferences?: StyleTag[];
    additionalNotes?: string;
  };
  timestamp: number;
}

export interface APIError {
  error: string;
  code:
    | "MISSING_IMAGE"
    | "IMAGE_TOO_LARGE"
    | "INVALID_IMAGE_TYPE"
    | "INVALID_INPUT"
    | "OPENAI_ERROR"
    | "PARSE_ERROR"
    | "RATE_LIMITED"
    | "UNKNOWN";
  details?: string;
}
