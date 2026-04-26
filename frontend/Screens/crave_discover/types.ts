export type RecommendResponse = {
  recommendations: Array<{
    restaurant_id: string;
    name: string;
    cuisine: string;
    rating: number | null;
    estimated_cost: number | null;
    explanation: string;
  }>;
  summary: string | null;
  warnings: string[];
  meta: Record<string, unknown>;
};

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
