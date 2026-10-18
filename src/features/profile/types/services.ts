export type Service = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string | null;
  amount: number;
  currency: string;
  payment_link: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
