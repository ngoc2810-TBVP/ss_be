import React, { useEffect, useState } from 'react';
import { Button, Input, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import "./detail.css";
import priceNewProduct from '../helper/priceNew';
import Cookies from "js-cookie"; // nhớ import thư viện

function DetailProductClient() {
  const API = process.env.REACT_APP_API_URL_CLIENT;
  const API_ADMIN = process.env.REACT_APP_API_URL_ADMIN;

  const { slug } = useParams();
  const [product, setProduct] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [socket, setSocket] = useState(null);
  const [quantity, setQuantity] = useState(1); // thêm state số lượng

  useEffect(() => {
    // Kết nối đến server qua cổng 8080
    const socketInstance = io("http://localhost:8080", {
      transports: ['websocket', 'polling'],
      path: '/socket.io',
    });

    socketInstance.on("connect", () => {
      console.log("Connected to server:", socketInstance._id);
    });

    setSocket(socketInstance);
  }, [API]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API}/products/${slug}`);
        const json = await res.json();

        if (json.data) {
          setProduct(json.data);
          document.title = json.pageTitle;
        }
      } catch (error) {
        message.error(error.message); // Hiển thị lỗi nếu có
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [API, slug]);

  const formatCurrency = (number) => {
    if (number) {
      return `${number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}₫`;
    }
    return "";
  };

  const handleOrderClick = async () => {
    if (!phoneNumber) {
      return;
    }

    const orderData = {
      product: product.title,
      phoneNumber: phoneNumber,
      type: "quickOrder",
    };

    socket.emit("order", orderData);

    try {
      const response = await fetch(`${API_ADMIN}/notifications/postQuickOrder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      console.log('result: ', result);

      if (result.code === 200) {
        message.success("Đặt hàng thành công!");
      } else {
        message.error(result.message || "Đặt hàng thất bại!");
      }
    } catch (error) {
      message.error("Lỗi khi gửi yêu cầu đặt hàng!");
      console.log("Error:", error);
    }
  };
  const handleAddToCart = async () => {
    if (quantity < 1) {
      message.warning("Vui lòng nhập số lượng hợp lệ!");
      return;
    }

    try {
      // Lấy token từ cookies
      const token = Cookies.get("token");
      if (!token) {
        message.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
        return;
      }

      console.log(product._id + "===" + quantity)
      const response = await fetch(`${API}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // gửi token để xác thực
        },
        body: JSON.stringify({
          product_id: product._id,
          quantity,
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        message.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
      } else {
        message.error(result.message || "Thêm vào giỏ hàng thất bại!");
      }
    } catch (error) {
      console.error(error);
      message.error("Có lỗi khi thêm sản phẩm vào giỏ hàng!");
    }
  };
  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className='product__content'>
          <div className='product__content--image'>
            <img src={product.thumbnail} alt={product.title} />
          </div>

          <div className='product__content--price'>
            <h2 className='product__content--name'>{product.title}</h2>
            <span>Giá ưu đãi: {formatCurrency(priceNewProduct(product))}</span>
            <div className='orderProduct'>
              <div className="order-form mt-4">
                <Input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="phone-input"
                  placeholder="Nhập số điện thoại"
                  required
                />
                <Button type="primary" className="order-button" onClick={handleOrderClick}>
                  Đặt hàng nhanh
                </Button>
              </div>
              {/* Thêm phần nhập số lượng và thêm vào giỏ hàng */}
              <div className="add-to-cart mt-3">
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="quantity-input"
                  placeholder="Số lượng"
                />
                <Button type="default" className="add-cart-button" onClick={handleAddToCart}>
                  Thêm vào giỏ hàng
                </Button>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default DetailProductClient;
