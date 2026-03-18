export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}
export type TPayment = 'card' | 'cash' | '';

export interface IProduct {
    id: string;
    title: string;
    price: number | null;
    description: string;
    image: string;
    category: string;
}

export interface IBuyer {
    payment: TPayment;
    email: string;
    phone: string;
    address: string;
}

export interface IProductList {
    total: number;
    items: IProduct[];
}

export interface IOrderRequest {
    payment: TPayment;
    address: string;
    email: string;
    phone: string;
    items: string[];
    total: number;
}

export interface IOrderResponse {
  id: string;
  total: number;
}

export type FormError = Partial<Record<keyof IBuyer, string>>