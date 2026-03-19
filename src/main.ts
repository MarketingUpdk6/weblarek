import { Api } from "./components/base/Api";
import { EventEmitter } from "./components/base/Events";
import { Bucket as BucketModel } from "./components/Models/bucket";
import { Catalog } from "./components/Models/catalog";
import { Buyer } from "./components/Models/buyer";
import { LarekAPI } from "./components/LarekApi";
import { Bucket as BucketView } from "./components/View/Bucket";
import { CardCatalog } from "./components/View/CardCatalog";
import { CardPreview } from "./components/View/CardPreview";
import { CardBasket } from "./components/View/CardBucket";
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
const previewView = new CardPreview(cloneTemplate("#card-preview"), events);

const bucketView = new BucketView(cloneTemplate("#basket"), events);
const orderForm = new OrderForm(cloneTemplate("#order"), events);
const contactsForm = new ContactsForm(cloneTemplate("#contacts"), events);
const successView = new Success(cloneTemplate("#success"), events);

header.render({ count: bucketModel.getCount() });

const renderBasketItems = (products: IProduct[]): HTMLElement[] => {
  return products.map((product, index) => {
    const cardElement = cloneTemplate<HTMLLIElement>("#card-basket");
    const card = new CardBasket(cardElement, events);
    return card.render({ ...product, index: index + 1 });
  });
};
// ОБРАБОТЧИКИ СОБЫТИЙ

// 1. Выбор товара из каталога
events.on("card:select", (data: { id: string }) => {
  const product = catalogModel.getProductsById(data.id);
  if (!product) return;
  const inBasket = bucketModel.hasProduct(product.id);
  modal.setContent(previewView.render({ ...product, inBasket }));
  modal.open();
});

// 2. Добавление/удаление товара из превью (модалка)
events.on("card:toggle", (data: { product: IProduct }) => {
  if (bucketModel.hasProduct(data.product.id)) {
    bucketModel.removeProduct(data.product.id);
  } else {
    bucketModel.addProduct(data.product);
  }
  modal.close();
});

// 3. Удаление из корзины
events.on("card:remove", (data: { product: IProduct }) => {
  bucketModel.removeProduct(data.product.id);
  modal.close();
});

// 4. Обновление интерфейса при изменении корзины
events.on("basket:changed", (data: { products: IProduct[]; total: number }) => {
  header.render({ count: data.products.length });

  if (modal.containsBasket()) {
    const basketElement = renderBasketItems(data.products);
    modal.setContent(
      bucketView.render({ items: basketElement, total: data.total }),
    );
  }
});

// 5. Открытие корзины
events.on("header:basket", () => {
  const items = bucketModel.getProducts(); //------------------------------------
  const total = bucketModel.getTotalPrice();
  const basketElement = renderBasketItems(items);
  modal.setContent(bucketView.render({ items: basketElement, total }));
  modal.open();
});

// 6. Оформление заказа
events.on("basket:order", () => {
  modal.setContent(orderForm.render(buyerModel.getData()));
  modal.open();
});

// 7. Изменение формы заказа
events.on("buyer:changed", () => {
  const data = buyerModel.getData();
  const { errors } = buyerModel.validate();

  // OrderForm: только оплата и адрес
  const orderErrors = [errors.payment, errors.address].filter(
    (e): e is string => !!e,
  );
  orderForm.render(data);
  orderForm.setErrors(orderErrors);
  orderForm.setSubmitButtonDisabled(orderErrors.length > 0);

  // ContactsForm: только email и телефон
  const contactErrors = [errors.email, errors.phone].filter(
    (e): e is string => !!e,
  );
  contactsForm.render(data);
  contactsForm.setErrors(contactErrors);
  contactsForm.setSubmitButtonDisabled(
    contactErrors.length > 0 || !data.email || !data.phone,
  );
});

// 8. Изменение формы заказа
events.on("order:change", (data: Partial<IBuyer>) => {
  buyerModel.updateData(data);
});

// 9. Переход к форме контактов
events.on("order:submit", () => {
  modal.setContent(contactsForm.render(buyerModel.getData()));
  modal.open();
});

// 10. Изменение формы контактов
events.on("contacts:change", (data: Partial<IBuyer>) => {
  buyerModel.updateData(data);
});

// 11. Отправка формы заказа
events.on("contacts:submit", async () => {
  const buyerData = buyerModel.getData();
  const basketItems = bucketModel.getProducts();

  const orderData: IOrderRequest = {
    payment: buyerData.payment,
    email: buyerData.email,
    phone: buyerData.phone,
    address: buyerData.address,
    items: basketItems.map((item) => item.id),
    total: bucketModel.getTotalPrice(),
  };

  try {
    const response = await larekApi.sendOrder(orderData);

    bucketModel.clear();
    buyerModel.clear();
    orderForm.reset();
    contactsForm.reset();

    modal.setContent(successView.render({ total: response.total }));
    modal.open();
  } catch (error) {
    console.error("Ошибка при отправке заказа:", error);
  }
});

// 12. Закрытие модального окна успеха
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
