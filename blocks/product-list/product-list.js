// Function to initialize the component and make the HTTP request
async function initProductListComponents() {
  // Select all div elements with the class 'product-list-container'
  const divs = document.querySelectorAll('.product-list-container');

  // Iterate over each div and perform the necessary operations
  divs.forEach((div) => {
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
