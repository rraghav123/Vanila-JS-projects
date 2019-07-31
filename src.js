// variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productDOM = document.querySelector('.products-center');

// cart
let cart = [];

//buttons
let buttonsDOM = [];

// getting the products
class Products {
    async getProducts() {
        try {
            let result = await fetch('products.json');
            let products = await result.json();
            products = products.items.map(item => {
                const {title,price} = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return {
                    title,
                    price,
                    id,
                    image
                }
            })
            return products;
        } catch (error){
            console.log(error);
        }
    }
}

// display products
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            result = result + `
                    <article class="product">
                        <div class="img-container">
                            <img src=${product.image} alt="product1" class="product-img">
                            <button class="bag-btn" data-id=${product.id}>Add to cart</button>
                                <i class="fa fa-shopping-cart"></i>
                                add to bag
                            </button>
                        </div>
                        <h3>${product.title}</h3>
                        <h4>$${product.price}</h4>
                    </article>
            `
        });
        productDOM.innerHTML = result;
    }
    getBagButtons() {
        buttonsDOM = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.filter(item => item.id === id);
            if(inCart.length) {
                button.innerHTML = "In Cart";
                button.disabled = true;
            } else {
                button.addEventListener('click', (event) => {
                    event.target.innerText = "In Cart";
                    event.target.disabled = true;
                    // get product from products
                    let cartItem = {...Storage.getProduct(id), amount: 1};
                    // add product to cart
                    cart = [...cart, cartItem];
                    // save cart in localstorage
                    Storage.saveCart(cart);
                    // set cart value
                    this.setCartValues(cart)
                    // display cart item
                    this.addCartItem(cartItem)
                    // show the cart
                    this.showCart()
                })
            }
        })
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseInt(tempTotal.toFixed(2), 10);
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
                        <img src="${item.image}" alt="product" />
                        <div>
                            <h4>${item.title}</h4>
                            <h5>$${item.price}</h5>
                            <span class="remove-item" data-id=${item.id}>remove</span>
                        </div>
                        <div>
                            <i class="fa fa-chevron-up" data-id=${item.id}></i>
                            <p class="item-amount">${item.amount}</p>
                            <i class="fa fa-chevron-down" data-id=${item.id}></i>
                        </div>`
    cartContent.appendChild(div);
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populate(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }
    populate(cart) {
        cart.forEach(cartItem => {
            this.addCartItem(cartItem);
        })
    }

    cartLogic() {
        //clear cart button
        clearCartBtn.addEventListener('click', this.clearCart.bind(this));
        // cart functionality
        cartContent.addEventListener('click', (event) => {
            if(event.target.classList.contains('remove-item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItem(id);
            } else if(event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                console.log(tempItem);
                tempItem.amount += 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } else if(event.target.classList.contains('fa-chevron-down')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                var tempItem = cart.find(item => item.id === id);
                if(tempItem.amount > 0) {
                    tempItem.amount = tempItem.amount - 1;
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    addAmount.nextElementSibling.innerText = tempItem.amount;
                }
            }
        });

    }
    clearCart() {
        let cartItem = cart.map(item => item.id);
        while(cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        cartItem.forEach(id => this.removeItem(id));
    }
    removeItem(id) {
        cart = cart.filter(item => item.id!==id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerText = "add to cart";
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}

//local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products))
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')): [];
    }
}

//event listeners
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    // setup Application
    ui.setupAPP();

    //get all products
    products.getProducts()
        .then(products =>  {
            ui.displayProducts(products);
            Storage.saveProducts(products);
        }).then(() => {
            ui.getBagButtons();
            ui.cartLogic();
        });

})



