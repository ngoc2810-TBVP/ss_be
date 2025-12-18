export default function priceNewProducts(products = []) {
  if (!Array.isArray(products) || products.length === 0) return [];

  return products.map((item) => {
    return {
      ...item,
      priceNew: ((item.price * (100 - item.discountPercentage)) / 100).toFixed(
        0
      ),
    };
  });
}
