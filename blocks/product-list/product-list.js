import { initCarousel } from '../../scripts/carousel.js';

// Function to initialize the component and make the HTTP request
async function initProductListComponents() {
  // Select all div elements with the class 'product-list-container'
  const divs = document.querySelectorAll('.product-list-container');

  // Iterate over each div and perform the necessary operations
  divs.forEach((div) => {
    function initializeCarousel(container) {
      // Hard-coded test configuration
      const carouselOptions = {
        itemsPerView: {
          mobile: 1,
          desktop: 3,
        },
        navigation: true,
        indicators: 'count',
        itemSelector: ':scope > .product-list > .product-item',
      };

      // Find the product list container within the block
      const productListContainer = container.querySelector('.product-list');
      if (productListContainer && productListContainer.children.length > 0) {
        initCarousel(productListContainer, carouselOptions);
      }
    }

    function createProductList(products) {
      let productListHTML = '';
      products.forEach((product) => {
        productListHTML += `
                          <div class="product-item">
                             <a href="${`plp?product=${product.name}`}" aria-label="View details for ${product.name}">
                              <img src="${'https://placehold.jp/400x400.png'}" alt="${product.altText}">
                               <h2>${product.name}</h2>
                              <div class="product-description">${product.description}</div>
                              </a>
                          </div>
                      `;
      });
      div.querySelector('.product-list').innerHTML += productListHTML;

      // Initialize carousel after products are rendered
      initializeCarousel(div);
    }
    const { apivalue } = div.dataset;
    // Extract data attributes from the div
    const fetchAndDisplayProducts = async () => {
      const resp = await fetch(apivalue);
      const jsono = await resp.json();
      createProductList(jsono.data);
    };
    fetchAndDisplayProducts();
  });
}
initProductListComponents();
