
export type Category = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  detailedImage?: string; // URL para imagem detalhada do produto
  categoryId: string;
};
