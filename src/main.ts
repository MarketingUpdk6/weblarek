import { Api } from "./components/base/Api";
import { EventEmitter } from "./components/base/Events";
import { Bucket as BucketModel } from "./components/Models/bucket";
import { Catalog } from "./components/Models/catalog";
import { Buyer } from "./components/Models/buyer";
import { LarekAPI } from "./components/LarekApi";
import { Bucket as BucketView } from "./components/View/Bucket";
import { CardCatalog } from "./components/View/CardCatalog";
import { CardPreview } from "./components/View/CardPreview";
import { ContactsForm } from "./components/View/ContactsForm";
import { Header } from "./components/View/Header";
import { Modal } from "./components/View/Modal";
import { OrderForm } from "./components/View/OrderForm";
import { Page } from "./components/View/Page";
import { Success } from "./components/View/Success";
import "./scss/styles.scss";
import { IBuyer, IOrderRequest, IProduct } from "./types";
import { API_URL } from "./utils/constants";
import { cloneTemplate } from "./utils/utils";

// ИНИЦИАЛИЗАЦИЯ

const events = new EventEmitter();

const bucketModel = new BucketModel(events);
const buyerModel = new Buyer(events);
const catalogModel = new Catalog(events);

const api = new Api(API_URL);
const larekApi = new LarekAPI(api);

const page = new Page(document.body);
const modal = new Modal(
  document.querySelector("#modal-container") as HTMLElement,
);
const header = new Header(
  document.querySelector(".header") as HTMLElement,
  events,
);

const bucketView = new BucketView(cloneTemplate("#basket"), events);
const orderForm = new OrderForm(cloneTemplate("#order"), events);
const contactsForm = new ContactsForm(cloneTemplate("#contacts"), events);
const successView = new Success(cloneTemplate("#success"), events);

header.render({ count: bucketModel.getCount() });

// ОБРАБОТЧИКИ СОБЫТИЙ

// 1. Выбор товара из каталога
events.on("card:select", (data: { product: IProduct }) => {
  const previewElement = cloneTemplate<HTMLDivElement>("#card-preview");
  const preview = new CardPreview(previewElement, events);
  const inBasket = bucketModel.hasProduct(data.product.id);
  const renderedPreview = preview.render({ ...data.product, inBasket });
  modal.setContent(renderedPreview);
  modal.open();
});

// 2. Обновление счетчика корзины
function updateBasketCounter() {
  const count = bucketModel.getCount();
  header.render({ count });
}

// 3. Добавление в корзину
events.on("card:add", (data: { product: IProduct }) => {
  bucketModel.addProduct(data.product);
  updateBasketCounter();
  modal.close();
});

// 4. Удаление из корзины
events.on("card:remove", (data: { product: IProduct }) => {
  bucketModel.removeProduct(data.product.id);
  updateBasketCounter();
  if (modal.containsBasket()) {
    const items = bucketModel.getProducts();
    const total = bucketModel.getTotalPrice();
    const basketElement = bucketView.render({ items, total });
    modal.setContent(basketElement);
  } else {
    modal.close();
  }
});

// 5. Открытие корзины
events.on("header:basket", () => {
  const items = bucketModel.getProducts();
  const total = bucketModel.getTotalPrice();
  const basketElement = bucketView.render({ items, total });
  modal.setContent(basketElement);
  modal.open();
});

// 6. Оформление заказа
events.on("basket:order", () => {
  const buyerData = buyerModel.getData();
  const orderFormElement = orderForm.render(buyerData);
  modal.setContent(orderFormElement);
  modal.open();
  const { errors } = buyerModel.validate();
  const formErrors: string[] = [];
  if (errors.payment) formErrors.push(errors.payment);
  if (errors.address) formErrors.push(errors.address);
  orderForm.setErrors(formErrors);
  orderForm.setSubmitButtonDisabled(
    formErrors.length > 0 ||
      !buyerModel.getData().payment ||
      !buyerModel.getData().address,
  );
});

// 7. Изменение формы заказа
events.on("order:change", (data: Partial<IBuyer>) => {
  buyerModel.updateData(data);
  if (data.payment && (data.payment === "card" || data.payment === "cash")) {
    orderForm.setPayment(data.payment);
  }
  const { errors } = buyerModel.validate();
  const formErrors: string[] = [];
  if (errors.payment) formErrors.push(errors.payment);
  if (errors.address) formErrors.push(errors.address);
  orderForm.setErrors(formErrors);
  orderForm.setSubmitButtonDisabled(
    formErrors.length > 0 ||
      !buyerModel.getData().payment ||
      !buyerModel.getData().address,
  );
});

// 8. Отправка формы заказа
events.on("order:submit", () => {
  const { errors } = buyerModel.validate();
  const formErrors: string[] = [];
  if (errors.payment) formErrors.push(errors.payment);
  if (errors.address) formErrors.push(errors.address);
  if (formErrors.length === 0) {
    const buyerData = buyerModel.getData();
    const contactsFormElement = contactsForm.render(buyerData);
    modal.setContent(contactsFormElement);
    modal.open();
    const { errors: contactErrors } = buyerModel.validate();
    const contactFormErrors: string[] = [];
    if (contactErrors.email) contactFormErrors.push(contactErrors.email);
    if (contactErrors.phone) contactFormErrors.push(contactErrors.phone);
    contactsForm.setErrors(contactFormErrors);
    contactsForm.setSubmitButtonDisabled(
      contactFormErrors.length > 0 ||
        !buyerModel.getData().email ||
        !buyerModel.getData().phone,
    );
  } else {
    orderForm.setErrors(formErrors);
    orderForm.setSubmitButtonDisabled(true);
  }
});

// 9. Изменение контактов
events.on("contacts:change", (data: Partial<IBuyer>) => {
  buyerModel.updateData(data);
  const { errors } = buyerModel.validate();
  const formErrors: string[] = [];
  if (errors.email) formErrors.push(errors.email);
  if (errors.phone) formErrors.push(errors.phone);
  contactsForm.setErrors(formErrors);
  contactsForm.setSubmitButtonDisabled(
    formErrors.length > 0 ||
      !buyerModel.getData().email ||
      !buyerModel.getData().phone,
  );
});

// 10. Отправка заказа
events.on("contacts:submit", async () => {
  const { errors } = buyerModel.validate();
  const formErrors: string[] = [];
  if (errors.email) formErrors.push(errors.email);
  if (errors.phone) formErrors.push(errors.phone);
  if (formErrors.length > 0) {
    contactsForm.setErrors(formErrors);
    contactsForm.setSubmitButtonDisabled(true);
    return;
  }
  const buyerData = buyerModel.getData();
  const basketItems = bucketModel.getProducts();
  const total = bucketModel.getTotalPrice();
  const orderData: IOrderRequest = {
    payment: buyerData.payment,
    email: buyerData.email,
    phone: buyerData.phone,
    address: buyerData.address,
    items: basketItems.map((item) => item.id),
    total: total,
  };
  try {
    const response = await larekApi.sendOrder(orderData);
    bucketModel.clear();
    buyerModel.clear();
    updateBasketCounter();
    orderForm.reset();
    contactsForm.reset();
    const successElement = successView.render({ total: response.total });
    modal.setContent(successElement);
    modal.open();
  } catch (error) {
    console.error("Ошибка при получении товаров:", error);
  }
});

// 11. Закрытие модального окна успеха
events.on("success:close", () => {
  modal.close();
});

// 12. Обновление данных каталога
events.on("catalog:changed", (data: { products: IProduct[] }) => {
  const cards = data.products.map((product) => {
    const cardElement = cloneTemplate<HTMLDivElement>("#card-catalog");
    const card = new CardCatalog(cardElement, events);
    return card.render(product);
  });
  page.render(cards);
});

// ЗАГРУЗКА ДАННЫХ

larekApi
  .getProducts()
  .then((products) => {
    catalogModel.setProducts(products);
  })
  .catch((error) => {
    console.error("Ошибка при отправке заказа:", error);
  });
