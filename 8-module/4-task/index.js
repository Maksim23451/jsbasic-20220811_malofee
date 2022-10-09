import createElement from '../../assets/lib/create-element.js';
import escapeHtml from '../../assets/lib/escape-html.js';
import Modal from '../../7-module/2-task/index.js';

export default class Cart {
  cartItems = []; // [product: {...}, count: N]

  constructor(cartIcon) {
    this.cartIcon = cartIcon;
    this.url = `https://httpbin.org/post`
    this.addEventListeners();
  }

  addProduct(product) {
    if (!product) {
      return;
    }

    let cartItem = this.cartItems.find(
      item => item.product.id === product.id
    );

    if (!cartItem) {
      cartItem = {
        product,
        count: 1
      };
      this.cartItems.push(cartItem);
    } else {
      cartItem.count++;
    }

    this.onProductUpdate(cartItem);
  }

  updateProductCount(productId, amount) {
    let cartItem = this.cartItems.find(item => item.product.id == productId);
    cartItem.count += amount;

    if (cartItem.count === 0) {
      this.cartItems.splice(this.cartItems.indexOf(cartItem), 1);
    }

    this.onProductUpdate(cartItem);
  }

  isEmpty() {
    return this.cartItems.length === 0;
  }

  getTotalCount() {
    return this.cartItems.reduce((sum, item) => sum + item.count, 0);
  }

  getTotalPrice() {
    return this.cartItems.reduce(
      (sum, item) => sum + item.product.price * item.count,
      0
    )
  }

  renderProduct(product, count) {
    return createElement(`
    <div class="cart-product" data-product-id="${
      product.id
    }">
      <div class="cart-product__img">
        <img src="/assets/images/products/${product.image}" alt="product">
      </div>
      <div class="cart-product__info">
        <div class="cart-product__title">${escapeHtml(product.name)}</div>
        <div class="cart-product__price-wrap">
          <div class="cart-counter">
            <button type="button" class="cart-counter__button cart-counter__button_minus">
              <img src="/assets/images/icons/square-minus-icon.svg" alt="minus">
            </button>
            <span class="cart-counter__count">${count}</span>
            <button type="button" class="cart-counter__button cart-counter__button_plus">
              <img src="/assets/images/icons/square-plus-icon.svg" alt="plus">
            </button>
          </div>
          <div class="cart-product__price">€${product.price.toFixed(2)}</div>
        </div>
      </div>
    </div>`);
  }

  renderOrderForm() {
    return createElement(`<form class="cart-form">
      <h5 class="cart-form__title">Delivery</h5>
      <div class="cart-form__group cart-form__group_row">
        <input name="name" type="text" class="cart-form__input" placeholder="Name" required value="Santa Claus">
        <input name="email" type="email" class="cart-form__input" placeholder="Email" required value="john@gmail.com">
        <input name="tel" type="tel" class="cart-form__input" placeholder="Phone" required value="+1234567">
      </div>
      <div class="cart-form__group">
        <input name="address" type="text" class="cart-form__input" placeholder="Address" required value="North, Lapland, Snow Home">
      </div>
      <div class="cart-buttons">
        <div class="cart-buttons__buttons btn-group">
          <div class="cart-buttons__info">
            <span class="cart-buttons__info-text">total</span>
            <span class="cart-buttons__info-price">€${this.getTotalPrice().toFixed(
              2
            )}</span>
          </div>
          <button type="submit" class="cart-buttons__button btn-group__button button">order</button>
        </div>
      </div>
    </form>`);
  }

  renderModal() {
    let modal = new Modal();
    modal.setTitle('Your order');
    modal.open();
    let modal_body = document.querySelector(`.modal__body`)
    for (let elem of this.cartItems) {
      modal_body.append(this.renderProduct(elem.product,elem.count))
     }
     modal_body.append(this.renderOrderForm())
     this.addEventListeners_modal()
  }


  onProductUpdate(cartItem) {
    console.log (this.cartItems) 

    if (document.body.className=="is-modal-open") {
    let modalBody = document.querySelector(`.modal__body`)
    let productCount = modalBody.querySelector(`[data-product-id="${cartItem.product.id}"] .cart-counter__count`);
    let productPrice = modalBody.querySelector(`[data-product-id="${cartItem.product.id}"] .cart-product__price`);
    let infoPrice = modalBody.querySelector(`.cart-buttons__info-price`);
    let oldPrice  = +productPrice.innerHTML.slice(1)
    let newPrice = (cartItem.count*cartItem.product.price)
    let difference = newPrice - oldPrice
    let oldinfoPrice = +infoPrice.innerHTML.slice(1)
    productCount.innerHTML = cartItem.count
    productPrice.innerHTML=`€${newPrice.toFixed(2)}`
    infoPrice.innerHTML = `€${(oldinfoPrice + difference).toFixed(2)}`
    cartItem.count==0? document.body.querySelector(`[data-product-id="${cartItem.product.id}"]`).remove():false
    let basket_length =Array.from(modalBody.childNodes).length
    console.log (basket_length)
    basket_length==2? document.querySelector(`.modal`).remove() || document.body.classList.remove(`is-modal-open`) :false
    }

    this.cartIcon.update(this);
  }

  onSubmit(event) {
    if (document.body.className=="is-modal-open") {
      document.querySelector(`button[type="submit"]`).classList.add(`is-loading`)
      let body = document.querySelector(`.cart-form`)

      request(this.url,`POST`,body).then((data)=>{
      document.querySelector(`.modal__title`).innerHTML = `Success!`
      this.cartItems=[]
      let newModalBody = createElement(`<div class="modal__body-inner">
      <p>
        Order successful! Your order is being cooked :) <br>
        We’ll notify you about delivery time shortly.<br>
        <img src="/assets/images/delivery.gif">
      </p>
    </div>`)
       document.querySelector(`.modal__body`).remove()
       document.querySelector(`.modal__inner`).append(newModalBody)
       this.cartIcon.update(this);
      })

    }
    
  };

  addEventListeners() {
    this.cartIcon.elem.onclick = () => this.renderModal();
  }


  addEventListeners_modal() {
    document.querySelector(`.modal__body`).addEventListener(`click`,(event)=>{

       if (event.target.closest(`.cart-counter__button_plus`)) {
          let id = event.target.parentNode.parentNode.parentNode.parentNode.parentNode.dataset.productId
          let counter = event.target.parentNode.previousElementSibling
          let count = +counter.innerHTML
          count++
          counter.innerHTML = `${count}`
          this.updateProductCount(id,1)
          
       } else if (event.target.closest(`.cart-counter__button_minus`)) {
        let id = event.target.parentNode.parentNode.parentNode.parentNode.parentNode.dataset.productId
        let counter = event.target.parentNode.nextElementSibling
        let count = +counter.innerHTML
        count--
        counter.innerHTML = `${count}`
        this.updateProductCount(id,-1)
       } else if (event.target.closest(`button[type="submit"]`)) {
        event.preventDefault()
        this.onSubmit(event)
       }

    })

  }

}


function request (url,method,body) {                    
  return fetch(url, {
      method:method,
      body:new FormData(body)
  }).then(resp =>{             
    return resp.json()         
  })
}

