import { IProduct } from "../../types";

export class Bucket {
  protected products: IProduct[] = [];

  //Получение всех товаров в корзине
  getProducts(): IProduct[] {
    return [...this.products];
  }

  //Добавление товара в корзину
  addProduct(product: IProduct): void {
    this.products.push({ ...product });
  }

  //Удаление товара из корзины
  removeProduct(id: string): void {
    this.products = this.products.filter((product) => product.id !== id);
  }

  //Очистка корзины
  clear(): void {
    this.products = [];
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