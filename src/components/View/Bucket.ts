import { IProduct } from "../../types";
import { cloneTemplate, ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";
import { CardBasket } from "./CardBucket";

export class Bucket extends Component<{ items: HTMLElement[]; total: number }> {
  protected _list: HTMLElement;
  protected _total: HTMLElement;
  protected _button: HTMLButtonElement;
  protected events: IEvents;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;

    this._list = ensureElement<HTMLElement>(".basket__list", container);
    this._total = ensureElement<HTMLElement>(".basket__price", container);
    this._button = ensureElement<HTMLButtonElement>(
      ".basket__button",
      container,
    );

    this._button.addEventListener("click", () => {
      this.events.emit("basket:order");
    });
  }

  render(data?: Partial<{ items: HTMLElement[]; total: number }>): HTMLElement {
    if (!data) return this.container;

    // Производим очистку списка
    this._list.innerHTML = "";
    if (data.items && data.items.length > 0) {
      this._list.replaceChildren(...data.items);
      this._button.disabled = false;
    } else {
      const emptyMessage = document.createElement("li");
      emptyMessage.textContent = "Корзина пуста";
      emptyMessage.className = "basket__empty";
      this._list.appendChild(emptyMessage);

      this._button.disabled = true;
    }

    // Обновляем общую стоимость
    if (data.total !== undefined) {
      this._total.textContent = `${data.total} синапсов`;
    }

    return this.container;
  }
}
