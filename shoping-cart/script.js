const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productDOM = document.querySelector('.products-center')



let cart = []

let buttonsDOM = []

class Products {
    async getProducts() {
        try {
            let result = await fetch('products.json')
            let data = await result.json()
            let products = data.items;
            // console.log(products)
            products = products.map((item) => {
                const { price, title } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url
                return { price, title, id, image }
            })
            return products
        } catch (error) {
            console.log(error);
        }
    }
}

//  displaying the products

class UI {
    displayProducts(products) {
        // console.log(products)
        let result = '';
        products.forEach((product) => {
            result += `
            <article class="product">
                <div class="img-container">
                    <img src="${product.image}" class="product-img"/>
                    <button class="bag-btn" data-id=${product.id} >
                        <i class="fas fa-shopping-cart">add to bag</i>
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$:${product.price}</h4>
            </article>`
        })
        productDOM.innerHTML = result
    }
    getBagButtons() {
        const button = [...document.querySelectorAll('.bag-btn')]
        buttonsDOM = button
        button.forEach((button) => {
            let id = button.dataset.id;
            let inCart = cart.find((item) => item.id === id)
            if (inCart) {
                button.innerText = "In cart"
                button.disabled = true
            }
            button.addEventListener("click", (event) => {
                // console.log(event)
                event.target.innerText = "In Cart"
                event.target.disabled = true
                // get product from products
                let cartItem = { ...Storage.getProducts(id), amount: 1 }
                //  add products into the card
                cart = [...cart, cartItem]
                // console.log(cart)
                // save cart to the local storage
                Storage.saveCart(cart)
                // set cart  values
                this.setCartValues(cart)
                // display cart items
                this.addCartItem(cartItem)
                // show the cart
                this.showCart()
            })
        })
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map((item) => {
            tempTotal += item.price * item.amount
            itemsTotal += item.amount
        })
        cartTotal.innerText = tempTotal.toFixed(2)
        cartItems.innerText = itemsTotal
        // console.log(cartItems, cartTotal)
    }

    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item')
        div.innerHTML = `<img src=${item.image} alt="product"/>
            <div>
                <h4>${item.title}</h4>
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id= ${item.id} >remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>`
        cartContent.appendChild(div);
        // console.log(cardContent);
    }

    showCart() {
        cartOverlay.classList.add('transparentBcg')
        cartDOM.classList.add("showCart")
    }

    setUpCart() {
        cart = Storage.getCart()
        this.calculateMad(cart)
        this.calculateMad(cart)
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }

    calculateMad(cart){
        cart.forEach((item)=>{
            this.addCartItem(item)
        })
    }

    hideCart() {
        cartOverlay.classList.remove('transparentBcg')
        cartDOM.classList.remove("showCart")
    }

    cartLogic(){
        clearCartBtn.addEventListener('click', ()=>{
            this.clearCart()
        })


        cartContent.addEventListener('click', (event)=>{
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target
                cartContent.removeChild(removeItem.parentElement.parentElement)
                let id = removeItem.dataset.id
                this.removeItem(id)
            }
            else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target
                let id = addAmount.dataset.id
                let tempItem = cart.find((item)=>item.id===id)
                tempItem.amount = tempItem.amount + 1
                this.setCartValues(cart)
                Storage.saveCart(cart)
                addAmount.nextElementSibling.innerText = tempItem.amount
            }
            else if(event.target.classList.contains('fa-chevron-down')){
                let subAmount = event.target
                let id = subAmount.dataset.id
                let tempValue = cart.find((item)=>item.id===id)
                tempValue.amount = tempValue.amount - 1
                if(tempValue.amount > 0){
                    Storage.saveCart(cart)
                    this.setCartValues(cart)
                    subAmount.previousElementSibling.innerText = tempValue.amount
                }
                else{
                    cartContent.removeChild(subAmount.parentElement.parentElement)
                    this.removeItem(id)
                }

            }
        })

        // clear cart functionality









    }

    clearCart(){
        const cartItems = cart.map((item)=>item.id)
        cartItems.forEach((id)=>{
            this.removeItem(id)
        })
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart()
    }

    removeItem(id){
        // [1,2,3,4,5,5]
        cart =  cart.filter((item)=>item.id !== id)
        // [5,5]
        this.setCartValues(cart)
        Storage.saveCart(cart)
        let button = this.getSingleButton(id)
        button.disabled=false
        button.innerHTML = `<i class="fas fa-shopping-cart">add to bag</i>`;
    }

    getSingleButton(id){
        return buttonsDOM.find((button)=>button.dataset.id === id)
    }
}

//  local storage

class Storage {
    static saveProducts(products) {
        localStorage.setItem("Products", JSON.stringify(products))
    }

    static getProducts(id) {
        let products = JSON.parse(localStorage.getItem("Products"))
        let gettingP = products.find((product) => product.id === id)
        return gettingP
    }

    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart))
    }

    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    ui.setUpCart()

    products.getProducts()
        .then((products) => {
            ui.displayProducts(products)
            Storage.saveProducts(products)
            ui.getBagButtons(products)
            ui.cartLogic(products)
        })
})



