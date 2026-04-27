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
      // If slider, add carousel controls
      if (productList.classList.contains('slider')) {
        // Create Prev/Next buttons
        const prevBtn = document.createElement('button');
        prevBtn.className = 'carousel-btn prev-btn';
        prevBtn.setAttribute('aria-label', 'Scroll left');
        prevBtn.innerHTML = '←';

        const nextBtn = document.createElement('button');
        nextBtn.className = 'carousel-btn next-btn';
        nextBtn.setAttribute('aria-label', 'Scroll right');
        nextBtn.innerHTML = '→';

        // Insert buttons before and after the product list
        productList.parentNode.insertBefore(prevBtn, productList);
        productList.parentNode.insertBefore(nextBtn, productList.nextSibling);

        // Scroll logic
        const scrollAmount = 300;
        prevBtn.addEventListener('click', () => {
          productList.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
          productList.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
      }
    }
    // const { apivalue } = div.dataset;
    // Extract data attributes from the div
    const fetchAndDisplayProducts = async () => {
      const resp = await fetch('https://author-p34054-e124155.adobeaemcloud.com/content/aem-eds/product-sheet.hlx.json');
      const jsono = await resp.json();
      createProductList(jsono.data);
    };
    fetchAndDisplayProducts();
  });
}
initProductListComponents();
