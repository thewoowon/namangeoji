import type { CategoryCode } from "./types";

export const CATEGORY_SLUG: Record<CategoryCode, string> = {
  ASSET: "asset",
  HOUSING: "housing",
  WORK_INCOME: "work",
  LIVING_COST: "living-cost",
  RETIREMENT: "retirement",
  TECHNOLOGY: "technology",
  SOCIAL_MOBILITY: "social-mobility",
};

export const SLUG_TO_CATEGORY: Record<string, CategoryCode> = Object.fromEntries(
  Object.entries(CATEGORY_SLUG).map(([code, slug]) => [slug, code as CategoryCode]),
) as Record<string, CategoryCode>;
