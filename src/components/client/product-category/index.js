import React, { useEffect, useState } from "react";
import { Badge } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import "../home/index.css";
import priceNewProducts from "../helper/product";

function ClientProductsInCategory({ permissions, permission }) {
  const API = process.env.REACT_APP_API_URL_CLIENT;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API}/products-category/${slug}`);
        const json = await res.json();

        console.log("json: ", json);

        document.title = json.pageTitle || "Danh mục sản phẩm";

        // ✅ FIX: xử lý giá trước khi setState
        setProducts(priceNewProducts(json.data));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API, slug]);

  if (loading) return <div className="products__main">Loading...</div>;
  if (error) return <div className="products__main">Error: {error}</div>;

  const handleProductName = (item) => {
    navigate(`/${item.slug}`);
  };

  // ✅ FIX: formatCurrency an toàn
  function formatCurrency(number) {
    if (number === undefined || number === null) return "";
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
  }

  return (
    <>
      <div className="category">
        <div className="products__main-feature top200">
          {products && products.length > 0 ? (
            products.map((item) => {
              if (!item || !item.title) return null;

              return (
                <div
                  key={item._id}
                  className="products__main--item"
                  onClick={() => handleProductName(item)}
                >
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
                      <span className="title-badge">{item.title}</span>
                      <div className="price-badge">
                        <span className="priceDiscount-badge">
                          <strong>{formatCurrency(item.priceNew)}</strong>
                        </span>
                        <span className="priceOriginal-badge">
                          <strong>{formatCurrency(item.price)}</strong>
                        </span>
                      </div>
                    </div>
                  </Badge.Ribbon>
                </div>
              );
            })
          ) : (
            <div className="products__main">
              <div className="container"></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ClientProductsInCategory;
