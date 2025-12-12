import React, { useEffect, useState } from "react";
import { Button, InputNumber, message, Popconfirm, Table } from "antd";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "./CartClient.css";
import axios from "axios";

const API = process.env.REACT_APP_API_URL_CLIENT;

function CartClient() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    const token = Cookies.get("token");
    if (!token) return message.error("Vui lòng đăng nhập để xem giỏ hàng!");

    try {
      const res = await axios.get(`${API}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res;

      console.log("data: ", data);

      if (data.data.status === "success") {
        setCart(data.data.cart);

        console.log("cart: ", cart);
      } else message.error(data.message || "Lấy giỏ hàng thất bại!");
    } catch (err) {
      console.error("err: ", err);
      message.error("Có lỗi khi lấy giỏ hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (productId, value) => {
    if (value < 1) return message.warning("Số lượng phải lớn hơn 0");
    const token = Cookies.get("token");

    try {
      const res = await fetch(`${API}/cart/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity: value }),
      });
      const data = await res.json();

      if (data.status === "success") {
        message.success("Cập nhật thành công!");
        setCart((prev) => ({
          ...prev,
          items: prev.items.map((i) =>
            i.product_id?._id === productId ? { ...i, quantity: value } : i
          ),
        }));
      } else message.error(data.message || "Cập nhật thất bại!");
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi cập nhật!");
    }
  };

  const handleRemoveItem = async (productId) => {
    const token = Cookies.get("token");
    try {
      const res = await fetch(`${API}/cart/remove/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.status === "success") {
        message.success("Xóa thành công!");
        setCart(data.cart);
      } else message.error(data.message);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi xóa!");
    }
  };

  const handleClearCart = async () => {
    const token = Cookies.get("token");
    try {
      const res = await fetch(`${API}/cart/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.status === "success") {
        message.success("Đã xóa toàn bộ!");
        setCart(data.cart);
      }
    } catch {
      message.error("Lỗi khi xóa giỏ hàng!");
    }
  };

  const columns = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => (
        <div className="cart-product">
          <img
            src={record.product_id?.thumbnail}
            alt=""
            className="cart-product-img"
          />
          <div className="cart-product-info">
            <div className="cart-product-title">{record.product_id?.title}</div>
            <div className="cart-product-price">
              {record.product_id?.price?.toLocaleString("vi-VN")}₫
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 140,
      render: (quantity, record) => (
        <div className="cart-quantity-container">
          <InputNumber
            min={1}
            value={quantity}
            className="qty-input"
            onChange={(v) => handleUpdateQuantity(record.product_id?._id, v)}
          />
          <span className="cart-product-total">
            <b>
              {(record.product_id?.price * quantity)?.toLocaleString("vi-VN")}₫
            </b>
          </span>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Xóa sản phẩm này?"
          onConfirm={() => handleRemoveItem(record.product_id?._id)}
        >
          <Button danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + item.product_id?.price * item.quantity;
    }, 0);
  };

  return (
    <div className="cart-wrapper">
      <h2 className="cart-title">Giỏ Hàng</h2>

      {loading ? (
        <p>Đang tải...</p>
      ) : cart && cart.items.length > 0 ? (
        <>
          <Table
            dataSource={cart.items}
            columns={columns}
            rowKey={(r) => r.product_id?._id}
            pagination={false}
            className="cart-table"
          />

          <div className="cart-actions">
            <Button danger onClick={handleClearCart}>
              Xóa toàn bộ
            </Button>

            <Button
              type="primary"
              className="checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              Thanh toán
            </Button>
          </div>

          <div className="cart-total">
            <h3>Tổng tiền: {calculateTotal()?.toLocaleString("vi-VN")}₫</h3>
          </div>
        </>
      ) : (
        <p>Giỏ hàng của bạn đang trống!</p>
      )}
    </div>
  );
}

export default CartClient;
