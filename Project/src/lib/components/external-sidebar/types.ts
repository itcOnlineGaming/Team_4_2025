export type FilterGroup = {
  id: string;
  label: string;
  icon?: string;              
  type?: "checkbox" | "radio";
  options: { value: string; label: string }[];
};

export type SortOption = {
  id: string;
  label: string;
  icon?: string;               
};
