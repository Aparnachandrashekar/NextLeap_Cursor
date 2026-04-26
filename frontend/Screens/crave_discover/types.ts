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
