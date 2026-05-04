export type CategoryType = "INCOME" | "EXPENSE";


export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon?: string | null;
  color?: string | null;
}

export interface CategoryCreatePayload {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
}

export interface CategoryUpdatePayload {
  name?: string;
  icon?: string;
  color?: string;
}