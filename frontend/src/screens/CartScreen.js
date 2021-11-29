/* eslint-disable no-use-before-define */
import { getProduct } from "../api";
import { getCartItems, setCartItems } from "../localStorage";
import { parseRequestUrl, rerender } from "../utils";


const addToCart = (item, forceUpdate = false) => {
    let cartItems = getCartItems();
    // x.product is the id of items inside cartitems === id of current product
    const existItem = cartItems.find(x => x.product === item.product);
    if(existItem){
        if (forceUpdate){
            // replace the product with same id, with the value that i entered as the parameter to the add to cart function(item)
            // if existitem update quantity(item)
            cartItems = cartItems.map((x) => x.product === existItem.product ? item : x);
        }
        
    } else {
        // else add item
        cartItems = [...cartItems, item]
    }
    // save
    setCartItems(cartItems);
    if (forceUpdate) {
        // eslint-disable-next-line no-use-before-define
        rerender(CartScreen);
    }  
};
const removeFromCart = (id) => {
    // if x.product does not equal that id, keep the product, else filter it out(remove it)
    setCartItems(getCartItems().filter(x => x.product !== id));
    if(id === parseRequestUrl().id) {
        document.location.hash = '/cart';
    } else {
        rerender(CartScreen);
    }
};

const CartScreen = {
    after_render: () => {
        const qtySelects = document.getElementsByClassName("qty-select");
        Array.from(qtySelects).forEach( qtyselect => {
            qtyselect.addEventListener('change', (e) => {
                const item = getCartItems().find((x) => x.product === qtyselect.id);
                addToCart({...item, qty: Number(e.target.value) }, true)
            });
        });
        const deleteButtons = document.getElementsByClassName("delete-button");
        Array.from(deleteButtons).forEach(deleteButton => {
            deleteButton.addEventListener('click', () => {
                removeFromCart(deleteButton.id);
            });
        });
        document.getElementById("checkout-button").addEventListener("click", () =>{
            document.location.hash = '/signin';
        })
    },
    render: async () => {
        const request = parseRequestUrl();
        if (request.id) {
            const product = await getProduct(request.id);
            addToCart({
                // eslint-disable-next-line no-underscore-dangle
                product: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                countInStock: product.countInStock,
                qty:1,
            });
        }
        const cartItems = getCartItems();
        return `
        <div class="content cart">
            <div class="cart-list">
                <ul class="cart-list-container">
                    <li>
                        <h3>Shopping cart</h3>
                        <div>Price</div>
                    </li>
                    ${
                        cartItems.length === 0?
                        '<div>cart is empty. <a href="/#/">Go shopping</a> </div>':
                        cartItems.map(item => `
                        <li>
                            <div class="cart-image">
                                <img src="${item.image}" alt="${item.name}" />
                            </div>
                            <div class="cart-name">
                                <div>
                                    <a href="/#/product/${item.product}">
                                        ${item.name}
                                    </a>
                                </div>
                                <div>
                                    Qty:
                                    <select class="qty-select" id="${item.product}">
                                    ${
                                        // an array of items in stock keys are mapped so that item.qty === keyindex +1
                                        [...Array(item.countInStock).keys()].map( x => item.qty === x + 1
                                            ? `<option selected value="${x + 1}">${x + 1}</option>`
                                            : `<option  value="${x + 1}">${x + 1}</option>`
                                        )    
                                    }    
                                    </select>
                                    <button type="button" class="delete-button" id="${item.product}">
                                        Delete
                                    </button> 
                                </div>
                            </div>
                            <div class="cart-price">
                                $${item.price}
                            </div>
                        </li>
                        `)
                    }
                </ul>
            </div>
            <div class="cart-action">
                <h3>
                    subtotal (${cartItems.reduce((a, c) => a + c.qty, 0)} items)
                    :
                    $${cartItems.reduce((a, c) => a + c.price * c.qty, 0)}
                </h3>
                <button id="checkout-button" class="primary">
                    Proceed to checkout
                </button>
            </div>
        </div>
        `;
    },
};
export default CartScreen;