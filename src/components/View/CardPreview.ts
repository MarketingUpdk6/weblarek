import { IProduct } from "../../types";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";
import { CardImage } from "./CardImage";

export class CardPreview extends CardImage {
  protected _text: HTMLElement;
  protected _button: HTMLButtonElement;
  private _product: IProduct | null = null;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
    this._text = ensureElement<HTMLElement>(".card__text", container);
    this._button = ensureElement<HTMLButtonElement>(".card__button", container);

    this._button.addEventListener("click", () => {
      this.events.emit("card:toggle", { product: this._product });
    });
  }

  render(data?: Partial<IProduct & { inBasket: boolean }>): HTMLElement {
    if (!data) return this.container;
    this._product = data as IProduct;

    if (data.category) this.setCategory(data.category);
    if (data.title) this.setTitle(data.title);
    if (data.image) this.setProductImage(data.image, data.title);
    if (data.price !== undefined) this.setPrice(data.price);
    if (data.description) {
      this._text.textContent = data.description;
    }
    const inBasket = data.inBasket || false;
    if (data.price === null) {
      this._button.disabled = true;
      this._button.textContent = "Недоступно";
    } else {
      this._button.disabled = false;
      if (inBasket) {
        this._button.textContent = "Удалить из корзины";
      } else {
        this._button.textContent = "Купить";
      }
    }

    return this.container;
  }
}
