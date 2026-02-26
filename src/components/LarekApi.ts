import { IApi, IProduct, IProductList, IOrderRequest, IOrderResponse } from '../types';

export class LarekAPI {
  constructor(protected api: IApi) { }

  async getProducts(): Promise<IProduct[]> {
    const response = await this.api.get<IProductList>('/product/');
    return response.items;
  }

  async sendOrder(order: IOrderRequest): Promise<IOrderResponse> {
    return await this.api.post<IOrderResponse>('/order/', order);
  }
}