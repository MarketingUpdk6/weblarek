import { IProduct } from "../../types";

export class Catalog {
  protected productList: IProduct[] = [];
  protected selectedProduct: IProduct | null = null;

  // Сохранение массива товаров
  setProducts(products: IProduct[]): void {
    this.productList = [...products];
  }
  // Получение массива товаров
  getProducts(): IProduct[] {
    return [...this.productList];
  }
  // Получение одного товара по id
  getProductsById(id: string): IProduct | null {
    return this.productList.find((product) => product.id === id) || null;
  }
  // Сохранение выбранного товара
  setSelectedProduct(product: IProduct | null): void {
    this.selectedProduct = product;
  }
  // Получение выбранного товара
  getSelectedProducts(): IProduct | null {
    return this.selectedProduct ? { ...this.selectedProduct } : null;
  }
}