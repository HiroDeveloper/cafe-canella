export type Category = {
  id: string;
  slug: string;
  name: string;
  group?: string;
  description?: string | null;
  icon?: string | null;
  image_url?: string | null;
  sort_order: number;
  is_visible?: boolean;
};

export type ItemPrice = {
  id: string;
  label: string;
  price: number;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
  is_new: boolean;
  tags: string[];
  prices: ItemPrice[];
};

export type MenuData = {
  category: Category;
  items: MenuItem[];
};
