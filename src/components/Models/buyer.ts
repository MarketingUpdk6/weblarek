import { FormError, IBuyer } from "../../types";
import { IEvents } from '../base/Events';
export class Buyer {
  private data: IBuyer = {
    payment: '',
    address: '',
    phone: '',
    email: ''
  };
  protected events: IEvents;
  constructor(events: IEvents) {
    this.events = events;
  }
  // Сохранение данных — можно передать частичный объект
  updateData(partialData: Partial<IBuyer>): void {
    this.data = { ...this.data, ...partialData };
    this.events.emit('buyer:changed', partialData);
  }

  // Получение всех данных
  getData(): IBuyer {
    return { ...this.data };
  }

  // Очистка всех данных
  clear(): void {
    this.data = {
      payment: '',
      address: '',
      phone: '',
      email: ''
    };
    this.events.emit('buyer:changed', this.data);
  }

  // Валидация: проверяет каждое поле на "не пустое"
  validate(): { isValid: boolean; errors: FormError } {
    const errors: FormError = {};

    // Проверка payment.name
    if (!this.data.payment) {
      errors.payment = 'Способ оплаты не выбран';
    }

    // Проверка address
    if (!this.data.address?.trim()) {
      errors.address = 'Адрес не может быть пустым';
    }

    // Проверка phone
    if (!this.data.phone?.trim()) {
      errors.phone = 'Телефон не может быть пустым';
    }

    // Проверка email
    if (!this.data.email?.trim()) {
      errors.email = 'Email не может быть пустым';
    }

    const isValid = Object.keys(errors).length === 0;
    return { isValid, errors };
  }
}
