export interface Product {
  title: string;
  price: string;
  image: string;
  store: string;
  link: string;
}

export interface ApiResponse {
  success: boolean;
  data?: Product[];
  error?: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}
