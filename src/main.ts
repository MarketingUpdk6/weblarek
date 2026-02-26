import { Api } from './components/base/Api';
import { Catalog } from './components/Models/catalog';
import { Bucket } from './components/Models/bucket';
import { Buyer } from './components/Models/buyer';
import { LarekAPI } from './components/LarekApi';
import './scss/styles.scss';
import { API_URL } from './utils/constants';
import { apiProducts } from './utils/data';

// --- Проверка Catalog ---
console.log('=== Тестирование класса Catalog ===');
const catalog = new Catalog();
catalog.setProducts(apiProducts.items);

const allProducts = catalog.getProducts();
console.log('📦 Все товары в каталоге:', allProducts);
console.log('🔢 Количество товаров:', allProducts.length);

// Проверим получение по ID
const firstProductId = apiProducts.items[0]?.id;
if (firstProductId) {
  const foundProduct = catalog.getProductsById(firstProductId);
  console.log('🔎 Товар по ID:', foundProduct?.title || 'не найден');
}

// Проверим выбранный товар
catalog.setSelectedProduct(apiProducts.items[3]);
console.log('🎯 Выбранный товар:', catalog.getSelectedProducts()?.title || 'нет');

// --- Проверка Bucket ---
console.log('\n=== Тестирование класса Bucket ===\n1.Начальное состояние');
const bucket = new Bucket();
const products = apiProducts.items;
console.log('🛒 НАЧАЛЬНОЕ состояние корзины:', bucket.getProducts());
console.log('🔢 Количество:', bucket.getCount());
console.log('💰 Сумма:', bucket.getTotalPrice());

console.log('\n2.Добавим 2 товара в корзину');
bucket.addProduct(products[0]);
bucket.addProduct(products[1]);
console.log('🛒 Текущее состояние корзины:', bucket.getProducts());
console.log('🔢 Количество:', bucket.getCount());
console.log('💰 Сумма:', bucket.getTotalPrice());

console.log('\n3.Проверим наличие первого и несуществующего товара');
console.log('✅ Содержит первый товар:', bucket.hasProduct(products[0].id));
console.log('❌ Содержит несуществующий товар:', bucket.hasProduct(products[2]?.id));

console.log('\n4.Удалим товар из корзины');
bucket.removeProduct(products[0].id);
console.log('🛒 Текущее состояние корзины:', bucket.getProducts());
console.log('🔢 Количество:', bucket.getCount());

console.log('\n5.Очистим корзину');
bucket.clear();
console.log('🛒 Текущее состояние корзины:', bucket.getProducts());
console.log('🔢 Количество:', bucket.getCount());
console.log('💰 Сумма:', bucket.getTotalPrice());

// --- Проверка Buyer ---
console.log('\n=== Тестирование класса Buyer ===');
const buyer = new Buyer();

// 1. Начальное состояние
console.log('👤 Начальные данные покупателя:', buyer.getData());
console.log('✅ Валидация (пустой объект):', buyer.validate());

// 2. Установим данные по одному полю
buyer.updateData({ email: 'test@example.com' });
console.log('\n📧 Установили email:', buyer.getData().email);
console.log('✅ Валидация:', buyer.validate());

// 3. Установим несколько полей сразу
buyer.updateData({
  address: 'г. Москва, ул. Волкодава, д. 12',
  payment: 'cash',
  phone: '+79999999999'
});
console.log('\n💳 Устанавливаем недостающие данные:', {
  address: buyer.getData().address,
  payment: buyer.getData().payment,
  phone: buyer.getData().phone
});

// 4. Проверим валидацию
console.log('✅ Валидация (полностью заполненный объект):', buyer.validate());

// 4. Проверим полные данные
console.log('\n📋 Полные данные покупателя:', buyer.getData());

// 6. Очистим одно поле и проверим валидацию
buyer.updateData({ email: '' });
console.log('\n🧹 Очистили email →', buyer.getData().email);
const validationAfterClear = buyer.validate();
console.log('✅ Валидация после очистки email:', {
  isValid: validationAfterClear.isValid,
  errors: validationAfterClear.errors
});

// 7. Полная очистка
buyer.clear();
console.log('\n🗑️ Полная очистка данных:', buyer.getData());
console.log('✅ Валидация после очистки:', buyer.validate());

console.log('\n=== Тестирование работы с сервиром ===');
const apiService = new Api(API_URL);
console.log('🔧 API_URL:', API_URL);
const larekApi = new LarekAPI(apiService);
const catalogModel = new Catalog();
try {
  const products = await larekApi.getProducts();
  catalogModel.setProducts(products);
  console.log('✅ Товары загружены с сервера:', catalogModel.getProducts());
  console.log('🔢 Количество:', catalogModel.getProducts().length);
} catch (error) {
  console.error('❌ Ошибка загрузки товаров:', error);
}