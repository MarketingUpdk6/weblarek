import { IBuyer } from "../../types";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";
import { Form } from "./Form";

export class ContactsForm extends Form<IBuyer> {
  protected _emailInput: HTMLInputElement;
  protected _phoneInput: HTMLInputElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this._emailInput = ensureElement<HTMLInputElement>(
      'input[name="email"]',
      container,
    );
    this._phoneInput = ensureElement<HTMLInputElement>(
      'input[name="phone"]',
      container,
    );

    this._emailInput.type = "email";
    this._emailInput.pattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$";
    this._emailInput.required = true;

    this._phoneInput.type = "tel";
    this._phoneInput.pattern = "[0-9+\\-()\\s]{10,20}";
    this._phoneInput.required = true;

    // Обработчик изменения email
    this._emailInput.addEventListener("input", () => {
      // Эмитим событие только если поле валидно
      if (this._emailInput.checkValidity()) {
        this.events.emit("contacts:change", {
          email: this._emailInput.value,
        } as Partial<IBuyer>);
      }
    });

    // Обработчик изменения телефона
    this._phoneInput.addEventListener("input", () => {
      // Разрешаем только цифры, +, -, (, ), пробелы
      this._phoneInput.value = this._phoneInput.value.replace(
        /[^0-9+\-()\s]/g,
        "",
      );

      // Эмитим событие только если поле валидно
      if (this._phoneInput.checkValidity()) {
        this.events.emit("contacts:change", {
          phone: this._phoneInput.value,
        } as Partial<IBuyer>);
      }
    });

    // Обработчик отправки формы
    container.addEventListener("submit", (e) => {
      e.preventDefault();
      if (
        this._emailInput.checkValidity() &&
        this._phoneInput.checkValidity()
      ) {
        this.events.emit("contacts:submit");
      } else {
        // Стандартные сообщения браузера
        this._emailInput.reportValidity();
        this._phoneInput.reportValidity();
      }
    });
  }

  reset(): void {
    super.reset();
    this._emailInput.value = "";
    this._phoneInput.value = "";
  }

  render(data?: Partial<IBuyer>): HTMLElement {
    if (data) {
      if (data.email) {
        this._emailInput.value = data.email;
      }
      if (data.phone) {
        this._phoneInput.value = data.phone;
      }
    }
    return this.container;
  }
}
