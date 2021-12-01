/* eslint-disable no-use-before-define */
/* eslint-disable no-underscore-dangle */
/* eslint-disable quotes */
import { searchProducts } from '../api';
import Rating from '../components/Rating';
import { parseRequestUrl } from '../utils';


const HomeScreen = {
  render: async () => {
    const { value } = parseRequestUrl();
    const products = await searchProducts({ searchKeyword: value });
    if (products.error) {
      return `<div class="error">${products.error}</div>`;
    }
    return `
        <ul class="products">
            ${products
    .map(
      (product) => `
            <li>
                <div class="product">
                    <a href="/#/product/${product._id}">
                        <img src="${product.image}" alt="${product.name}">
                    </a>
                <div class="product-name">
                    <a href="/#/product/${product._id}">
                        ${product.name}
                    </a>
                </div>
                <div class="product-rating">
                    ${Rating.render({
                      value: product.rating, 
                      text: `${product.numReviews } reviews`
                    })}
                </div>
                <div class="product-brand">
                    ${product.brand}
                </div>
                <div class="product-price">
                    $${product.price}
                </div>
                </div>
            </li>
            `,
    )}
        `;
  },
};
export default HomeScreen;
