import { IProduct } from "../../types";
import { IEvents } from '../base/Events';
export class Bucket {
  protected products: IProduct[] = [];
  protected events: IEvents;

  constructor(events: IEvents) {
    this.events = events;
  }
  //Получение всех товаров в корзине
  getProducts(): IProduct[] {
    return [...this.products];
  }

  //Добавление товара в корзину
  addProduct(product: IProduct): void {
    this.products.push({ ...product });
    this.events.emit('basket:changed', {
      products: this.getProducts(),
      total: this.getTotalPrice()
    });
  }

  //Удаление товара из корзины
  removeProduct(id: string): void {
    this.products = this.products.filter((product) => product.id !== id);
    this.events.emit('basket:changed', {
      products: this.getProducts(),
      total: this.getTotalPrice()
    });
  }

  //Очистка корзины
  clear(): void {
    this.products = [];
    this.events.emit('basket:changed', { products: [], total: 0 });
  }

  //Получение общей стоимости товаров в корзине
  getTotalPrice(): number {
    return this.products.reduce((total, product) => {
      return total + (product.price || 0);
    }, 0);
  }

  //Получение количества товаров в корзине
  getCount(): number {
    return this.products.length;
  }

  //Проверка наличия товаров по id
  hasProduct(id: string): boolean {
    return this.products.some((product) => product.id === id);
  }
}