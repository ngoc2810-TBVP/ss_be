// Đổi một trong các hàm thành named export
export function priceNewProducts(products) {
  const newProducts = products.map((item) => {
    item.priceNew = (
      (item.price * (100 - item.discountPercentage)) /
      100
    ).toFixed(0);
    console.log(item.priceNew);
    return item;
  });

  return newProducts;
}

// Sử dụng default export cho một hàm
export default function priceNewProduct(price, discountPercentage) {
  const newPrice = ((price * (100 - discountPercentage)) / 100).toFixed(0);

  return newPrice;
}
