import { IProduct } from "../../types";
import { IEvents } from "../base/Events";
import { CardImage } from "./CardImage";

export class CardCatalog extends CardImage {
  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
    container.addEventListener("click", () => {
      console.log("Клик по карточке, id:", this.container.dataset.id);
      const id = this.container.dataset.id;
      if (id) {
        this.events.emit("card:select", { id });
      }
    });
  }

  render(data?: Partial<IProduct>): HTMLElement {
    if (!data) return this.container;
    const product = data as IProduct;

    if (data.category) this.setCategory(data.category);
    if (data.title) this.setTitle(data.title);
    if (data.image) this.setProductImage(data.image, data.title);
    if (data.price !== undefined) this.setPrice(data.price);

    if (product.id) {
      this.container.dataset.id = product.id;
    }

    return this.container;
  }
}
