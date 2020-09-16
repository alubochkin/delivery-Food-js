'use strict'

const cartButton = document.querySelector("#cart-button");
const modalCart = document.querySelector('.modal-cart');
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");


// Авторизация

const modalAuth = document.querySelector('.modal-auth');
const buttonAuth = document.querySelector('.button-auth');
const closeAuth = document.querySelector(".close-auth");
const logInForm = document.querySelector('#logInForm');
const logInInput = document.querySelector('#login');
const passInput = document.querySelector('#password');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');

let loginName = localStorage.getItem('webEat');
let passName = null;



function overlay(e) {
    if(this == e.target) {
        this.classList.toggle("is-open");  
        setTimeout( () => {
            this.classList.toggle('anim');  
    
        },1)
   }  
}
function toggleModalAuth(e) {
    modalAuth.classList.toggle("is-open");  
    document.body.classList.toggle("scroll");
        setTimeout( () => {
            modalAuth.classList.toggle("anim");  
  
        },1)   
}
function openCart() {
    modalCart.classList.toggle("is-open");
    document.body.classList.toggle("scroll");
    
    setTimeout( () => {
        modalCart.classList.toggle('anim');  

    },1)
}

function authorized() { 

    console.log('Авторизован'); 

    function logOut() {
        buttonAuth.style.display = 'flex'
        userName.style.display = '';
        buttonOut.style.display = '';
        logInForm.reset();
        loginName = null;
        cartButton.style.display = '';

        restaurants.classList.remove('hide')
        containerPromo.classList.remove('hide')
        menu.classList.add('hide')

        buttonOut.removeEventListener('click', logOut);
        close.removeEventListener('click', openCart);

        cartButton.removeEventListener('click', openCart );
        cartButton.removeEventListener('click',  renderCart ); 
        localStorage.removeItem('webEat');
        checkAuth();
    }

    buttonAuth.style.display = 'none'
    userName.style.display = 'flex'
    userName.innerText = loginName;
    buttonOut.style.display = 'flex';
    cartButton.style.display = 'flex';

    close.addEventListener('click', openCart);
    modalCart.addEventListener('click', overlay);
    buttonOut.addEventListener('click', logOut);

    cartButton.addEventListener('click',  openCart);
    cartButton.addEventListener('click',  renderCart );   
}


function notAuthorized() {

    console.log('Не авторизован');
    
    function login(event) {

        event.preventDefault();
        modalAuth.classList.toggle("is-open");
        loginName = logInInput.value;
        passName = passInput.value;
        localStorage.setItem('webEat', loginName);

        logInForm.reset();
        buttonAuth.removeEventListener('click', toggleModalAuth)
        closeAuth.removeEventListener('click', toggleModalAuth);
        logInForm.removeEventListener('submit', login);
        modalAuth.removeEventListener('click', overlay);
        modalCart.classList.remove("is-open"); 

        checkAuth();
    } 

    buttonAuth.addEventListener('click', toggleModalAuth);
    closeAuth.addEventListener('click', toggleModalAuth);
    logInForm.addEventListener('submit', login);
    modalAuth.addEventListener('click', overlay);

    
}

function checkAuth() {
  if(loginName) { authorized(); } 
  else { notAuthorized(); }
}
checkAuth();



// Карточки товаров

const cardsRestaurants = document.querySelector('.cards-restaurants');
const restaurants = document.querySelector('.restaurants');
const containerPromo = document.querySelector('.container-promo');
const cardsMenu = document.querySelector('.cards-menu');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const home = document.querySelector('.home');

const restaurantTitle = document.querySelector('.restaurant-title');
const rating = document.querySelector('.rating');
const category = document.querySelector('.category');
const price = document.querySelector('.price');


async function getData(url) {

    const response = await fetch(url);

    if( !response.ok ) {
        throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}`);
    }
     return await response.json()   
}



function creatCardsRestaurants({ name, time_of_delivery, stars, price, kitchen, image, products }) {
    
    const card = `<a  class="card card-restaurant" data-name="${name}" data-rating="${stars}"
                        data-price="${price}" data-products="${products}" data-kitchen="${kitchen}">
                    <img src="${image}" class="card-image"/>
                    <div class="card-text">
                        <div class="card-heading">
                            <h3 class="card-title">${name}</h3>
                            <span class="card-tag tag">${time_of_delivery}</span>
                        </div>
                        <div class="card-info">
                            <div class="rating">
                                ${stars}
                            </div>
                            <div class="price">От ${price} ₽</div>
                            <div class="category">${kitchen}</div>
                        </div>
                    </div>
                </a>`;

    cardsRestaurants.insertAdjacentHTML('beforeend', card)
}

function openGoods(event) {

    const target = event.target;
    const restaurant = target.closest('.card-restaurant');

    if(loginName) {
        if(restaurant && loginName !== null) {
        
            cardsMenu.textContent = null;
            restaurants.classList.add('hide');
            containerPromo.classList.add('hide');
            menu.classList.remove('hide');

            getData(`./db/${restaurant.dataset.products}`).then( (data) => {
                data.forEach( creatCardGood )
            });
            restaurantTitle.innerText = restaurant.dataset.name;
            price.innerText = `От ${restaurant.dataset.price} р`;
            rating.innerText = restaurant.dataset.rating;
            category.innerText = restaurant.dataset.kitchen;           

            window.scrollTo(0, 0);
        }                
    } else { toggleModalAuth() }  
}

function creatCardGood({ id, name, description, price, image }) {


    const  card = `
        <div class="card">
            <img src="${image}" alt="image" class="card-image">
            <div class="card-text">
                <div class="card-heading">
                    <h3 class="card-title card-title-reg">${name}</h3>
                </div>
            <div class="card-info">
                <div class="ingredients">${description}</div>
            </div>
            <div class="card-buttons">
                <button id="${id}" class="button button-primary button-add-cart">
                    <span class="button-card-text">В корзину</span>
                    <span class="button-cart-svg"></span>
                </button>
                <strong class="card-price-bold card-price">${price} ₽</strong>
            </div>
        </div>
    </div>    
    `;
    cardsMenu.insertAdjacentHTML('beforeend', card);
}

// Корзина
const cartBody = document.querySelector('.cart-body');
const totalPrice = document.querySelector('.total');
const clearCart = document.querySelector('.clear-cart');
let cart = [];

function addToCart(event) {

    const target = event.target;
    const btnCart = target.closest('.button-add-cart');
    if(btnCart) {
        const card = target.closest('.card');
        const title = card.querySelector('.card-title').textContent;
        const cost = card.querySelector('.card-price').textContent;
        const image = card.querySelector('.card-image').src;
        const id = btnCart.id;

        console.log(image)

        const food = cart.find((item) => {
           return item.id === id;
        });

        if(food) {
            food.count += 1;
        } else {
            cart.push({ id, title, cost, image, count: 1 });
        }        
    }

    localStorage.setItem(localStorage.getItem('webEat'), JSON.stringify(cart));

}


function renderCart() {
    cartBody.textContent = ' ';

    var cartStorage = localStorage.getItem(loginName);

    if(localStorage.getItem(loginName)!= null) { 
        cart = JSON.parse(cartStorage)
    } else {
        cart.length = 0;
    }
   
    cart.forEach(( {id, title, cost, image, count} ) => {
        const cartList = `
            <div class="food-row">
            <img src="${image}" class="image-cart" />
            <span class="food-name">${title}</span>
            <strong class="food-price">${cost}</strong>
                <div class="food-counter">
                    <button class="counter-button btn-minus" data-id="${id}">-</button>
                    <span class="counter">${count}</span>
                    <button class="counter-button btn-plus" data-id="${id}">+</button>
                </div>
            </div>
        `;
        cartBody.insertAdjacentHTML('beforeend', cartList);
    });
    console.log(cart)
    const total = cart.reduce((result, item) => {
        return result + (parseFloat(item.cost) * item.count)
    }, 0)   
    totalPrice.innerText = total + ' р';
}

function changeCount(event) {
    const target = event.target;

    if(target.classList.contains('counter-button')) {
        const food = cart.find((item) => {
            return item.id === target.dataset.id
        });
        if(target.classList.contains('btn-minus')) {
            food.count--
            if(food.count === 0) {
                cart.splice(cart.indexOf(food), 1);
            }
        }
        if(target.classList.contains('btn-plus')) food.count++ ;
        localStorage.setItem(localStorage.getItem('webEat'), JSON.stringify(cart))
        renderCart();
    }


}

function init() {

    getData('./db/partners.json').then( (data) => {
        data.forEach( creatCardsRestaurants)
    });

    [logo, home].forEach((item) => item.addEventListener('click', () => {
        restaurants.classList.remove('hide')
        containerPromo.classList.remove('hide')
        menu.classList.add('hide')
    }));
    cartBody.addEventListener('click', changeCount);
    cardsMenu.addEventListener('click', addToCart);
    clearCart.addEventListener('click', () => {
        cart.length = 0;
        console.dir(delete localStorage[loginName])
        openCart();
    });
    cardsRestaurants.addEventListener('click', openGoods);


}


init();
