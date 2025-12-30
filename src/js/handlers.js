import {
  FORM,
  MODAL,
  BASKET_BTN,
  CLOSE_MODAL,
  BASKET_LIST,
  BASKET_LIST_CONTAINER,
  counterEl,
  totalEl,
} from './constants'
import { createProduct, loadJSON } from './api'

/**
 * Генерация шаблона товара
 * @param {Object} product - объект товара
 * @param {boolean} vertical - флаг для вертикальной (true) или горизонтальной (false) ориентации
 * @returns {string} HTML шаблон товара
 */
export const generateProductTemplate = (product, vertical = true) => {
  const orientation = vertical ? 'vertical' : 'horizontal'
  const ratingSvg = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 6.12414H9.89333L8 0L6.10667 6.12414H0L4.93333 9.90345L3.06667 16L8 12.2207L12.9333 16L11.04 9.87586L16 6.12414Z"
        fill="#FFCE31" />
    </svg>
  `
  const wishlistHeart = vertical
    ? `
          <svg class="whishlist-heart" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path
              d="m16 28c7-4.733 14-10 14-17 0-1.792-.683-3.583-2.05-4.95-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05l-2.051 2.051-2.05-2.051c-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05-1.367 1.367-2.051 3.158-2.051 4.95 0 7 7 12.267 14 17z">
            </path>
          </svg>
          `
    : ''
  const addToCartBtn = vertical ? '<button class="btn btn-primary add-to-cart">Add to cart</button>' : ''
  const removeBtn = !vertical
    ? `
      <button class="close-button item-remove" aria-label="Удалить товар">
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; fill: none; height: 16px; width: 16px; stroke: currentcolor; stroke-width: 3; overflow: visible;">
          <path d="m6 6 20 20"></path>
          <path d="m26 6-20 20"></path>
        </svg>
      </button>
      `
    : ''

  return `
    <div class="product-card" data-orientation="${orientation}" id="${product?.id}">
      <div class="product-image">
        <img src="${product?.imgSrc}" alt="${product?.name}">
        <div class="product-wishlist">
          <div class="product-rating">
            <div class="rating-img">${ratingSvg}</div>
            <span class="rating-amount">${product?.rating}</span>
          </div>
          ${wishlistHeart}
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-name">${product?.name}</h3>
        <p class="product-category">${product?.category}</p>
        <p class="product-price">${product?.price}</p>
        ${addToCartBtn}
      </div>
      ${removeBtn}
    </div>
  `
}

// Обработчик создания товара
export const handleSubmit = () => {
  FORM.addEventListener('submit', (event) => {
    event.preventDefault()
    createProduct(event.target)
    loadJSON()
  })
}

// Обработчик открытия модалки
export const handleOpenModal = () => {
  BASKET_BTN.addEventListener('click', () => {
    MODAL.show()
    renderBasketItems()
  })
}

// Обработчик закрытия модалки
export const handleCloseModal = () => {
  CLOSE_MODAL.addEventListener('click', () => {
    MODAL.close()
  })
}

// Функция отрисовки товаров в корзине
export const renderBasketItems = () => {
  let html = ''

  BASKET_LIST.forEach((product) => {
    html += generateProductTemplate(product, false)
  })
  BASKET_LIST_CONTAINER.innerHTML = html
  handleRemoveFromBasket()
  updateTotalPrice()
}

// Функция обновления счетчика
let basketCount = 0
export const updateBasketCounter = () => {
  if (counterEl) {
    counterEl.textContent = basketCount
  }
}

// Функция удаления товара с корзины
export const handleRemoveFromBasket = () => {
  const removeButtons = document.querySelectorAll('.item-remove')
  removeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const productId = btn?.closest('.product-card')?.id
      if (productId) {
        // Находим индекс товара по id
        const index = BASKET_LIST.findIndex((p) => p.id === productId)
        if (index !== -1) {
          BASKET_LIST.splice(index, 1) // удаляем товар

          // Обновляем счетчик
          basketCount--
          updateBasketCounter()

          // Перерисовываем корзину
          renderBasketItems()
        }
      }
    })
  })
}

// Функция нахождения общей суммы товаров
export const updateTotalPrice = () => {
  const totalPrice = BASKET_LIST.reduce((sum, product) => {
    const priceNumber =
      typeof product.price === 'string' ? parseFloat(product.price.replace(/[^0-9.-]+/g, '')) : product.price
    return sum + priceNumber
  }, 0)

  // Обновляем текст в элементе
  if (totalEl) {
    totalEl.textContent = `Total: $${totalPrice.toFixed(2)}`
  }
}

// Обработчик добавления товара в корзину
export const handleAddToBasket = (data) => {
  // получаем все кнопки добавить в корзину
  const addBtns = document.querySelectorAll('.add-to-cart')

  addBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const productId = btn?.parentElement?.parentElement?.id
      // идем в бд искать найденный элемент
      const findedProduct = data?.find(({ id }) => id === productId)
      // добавляем найденный элемент в массив корзины
      BASKET_LIST.push(findedProduct)
      // Обновляем счетчик
      basketCount++
      updateBasketCounter()
      // обновляем отрисовку корзины, если модалка открыта
      if (MODAL.open) {
        renderBasketItems()
      }
    })
  })
}
