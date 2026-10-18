export type Review = {
  id: string;
  content: string;
  rating: number;
  author: {
    name: string;
    title: string;
    avatar: string;
    verified?: boolean;
  };
};

