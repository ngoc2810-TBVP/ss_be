import React, { useEffect, useState } from "react";
import { Button, Row, Col, Input, Badge, Carousel } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import "./index.css";
import priceNewProduct from "../helper/product";

function HomeClient({ permissions, permission }) {
  const API = process.env.REACT_APP_API_URL_CLIENT;
  const [categoriesWithProducts, setCategoriesWithProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { slug } = useParams();
  const navigate = useNavigate();

  document.title = "Website SamSung";

  // Lấy danh mục và sản phẩm từ API
  useEffect(() => {
    const fetchCategoriesWithProducts = async () => {
      try {
        const res = await fetch(`${API}/products-category/getProductCaterogy`);
        const json = await res.json();

        console.log("dataJson: ", json);
        if (json.code === 200) {
          setCategoriesWithProducts(json.data); // Lưu dữ liệu vào state
        }
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    };

    fetchCategoriesWithProducts();
  }, [API]);

  if (loading) return <div className="products__main">Loading...</div>;
  if (error) return <div className="products__main">Error: {error}</div>;

  // Chuyển sang trang chi tiết sản phẩm
  const handleProductName = (item) => {
    navigate(`/${item.slug}`);
  };

  // Hàm định dạng giá với kiểm tra số hợp lệ
  function formatCurrency(number) {
    // if (typeof number !== "number" || isNaN(number)) {
    //   return "";
    // }
    const formattedNumber = number
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return formattedNumber + "₫";
  }

  return (
    <>
      <div className="all-home">
        <div className="">
          {/* <Carousel
            className="samsung-slider-full"
            autoplay
            autoplaySpeed={3000}
            dots={true}
            arrows={true}
            draggable
          >
            <div className="samsung-slide-full">
              <img
                // src="https://images.samsung.com/is/image/samsung/assets/vn/offer/megasale/20250909-dday/Top-kv-fs-PC.png?imwidth=768"
                src="https://autowash.vn/wp-content/uploads/2019/04/175f57f3117cf322aa6d-1-e1587810575905.jpg"
                alt="Samsung Slide 1"
              />
            </div>

            <div className="samsung-slide-full">
              <img
                src="https://images.samsung.com/is/image/samsung/assets/vn/offer/megasale/202512/kv-banner/kv-voting-pc.jpg?imwidth=768"
                alt="Samsung Slide 2"
              />
            </div>

            <div className="samsung-slide-full">
              <img
                src="https://images.samsung.com/is/image/samsung/assets/vn/offer/megasale/202511/tech-sale/kv-A-series-MO.png?imwidth=768"
                alt="Samsung Slide 3"
              />
            </div>
          </Carousel> */}
        </div>

        {/* Hiển thị các danh mục và sản phẩm */}
        <div className="categories">
          <div className="categories_title">
            {categoriesWithProducts.length > 0 ? (
              categoriesWithProducts.map((categoryData, index) => {
                // Kiểm tra categoryData trước khi sử dụng
                if (!categoryData || !categoryData.categories) return null;

                return (
                  <div key={index} className="category">
                    {/* Kiểm tra xem danh mục cha có title không */}
                    <div>
                      <div className="subCategories">
                        {categoryData.categories &&
                        categoryData.categories.length > 0 ? (
                          categoryData.categories.map((subCategory) => (
                            <>
                              <div className="span-cate">
                                {subCategory?.title && (
                                  <span className="parent-all">
                                    {subCategory?.title || ""}
                                  </span>
                                )}
                                {subCategory?._doc?.title && (
                                  <span className="subcategory">
                                    {subCategory?._doc?.title}
                                  </span>
                                )}
                              </div>
                            </>
                          ))
                        ) : (
                          <div>No subcategories available</div>
                        )}
                      </div>
                    </div>
                    <div className="products__main-feature">
                      {categoryData.products &&
                      categoryData.products.length > 0 ? (
                        categoryData.products.map((item) => (
                          <div
                            key={item._id}
                            className="products__main--item"
                            onClick={() => handleProductName(item)}
                          >
                            <Badge.Ribbon
                              className="badge"
                              text={`Nổi bật`}
                              color="green"
                            />
                            <Badge.Ribbon
                              className="badge badge2"
                              text={`Giảm ${item.discountPercentage}%`}
                              color="red"
                            >
                              <img
                                className="image__product--main-badge"
                                src={item.thumbnail}
                                alt={item.title}
                              />
                              <div className="titleVPrice">
                                <span className="title-badge">
                                  {item.title}
                                </span>
                                <div className="price-badge">
                                  <span className="priceDiscount-badge">
                                    <strong>
                                      {formatCurrency(
                                        priceNewProduct(
                                          item.price,
                                          item.discountPercentage
                                        )
                                      )}
                                    </strong>
                                  </span>
                                  <span className="priceOriginal-badge">
                                    <strong>
                                      {formatCurrency(item.price)}
                                    </strong>
                                  </span>
                                </div>
                              </div>
                            </Badge.Ribbon>
                          </div>
                        ))
                      ) : (
                        <div></div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default HomeClient;
