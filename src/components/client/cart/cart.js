import React, { useEffect, useState } from "react";
import { Table, InputNumber, Button, message, Popconfirm } from "antd";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
const API = process.env.REACT_APP_API_URL_CLIENT;

function CartClient() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const fetchCart = async () => {
        const token = Cookies.get("token");
        if (!token) return message.error("Vui lòng đăng nhập để xem giỏ hàng!");

        try {
            setLoading(true);
            const res = await fetch(`${API}/cart`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.status === "success") setCart(data.cart);
            else message.error(data.message || "Lấy giỏ hàng thất bại!");
        } catch (error) {
            console.error(error);
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
                message.success("Cập nhật số lượng thành công!");
                setCart(prev => ({
                    ...prev,
                    items: prev.items.map(item =>
                        item.product_id._id === productId
                            ? { ...item, quantity: value }
                            : item
                    ),
                }));
            } else {
                message.error(data.message || "Cập nhật thất bại!");
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi cập nhật số lượng!");
        }
    };

    const handleRemoveItem = async (productId) => {
        const token = Cookies.get("token");
        try {
            const res = await fetch(`${API}/cart/remove/${productId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.status === "success") {
                message.success("Xóa sản phẩm thành công!");
                setCart(data.cart);
            } else {
                message.error(data.message || "Xóa thất bại!");
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi xóa sản phẩm!");
        }
    };

    const handleClearCart = async () => {
        const token = Cookies.get("token");
        try {
            const res = await fetch(`${API}/cart/clear`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.status === "success") {
                message.success("Đã xóa toàn bộ giỏ hàng!");
                setCart(data.cart);
            } else {
                message.error(data.message || "Xóa thất bại!");
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi xóa giỏ hàng!");
        }
    };

    const columns = [
        {
            title: "Sản phẩm",
            dataIndex: ["product_id", "title"],
            key: "title",
        },
        {
            title: "Giá",
            dataIndex: ["product_id", "price"],
            key: "price",
            render: (price) => price?.toLocaleString("vi-VN") + "₫",
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            render: (quantity, record) => (
                <InputNumber
                    min={1}
                    value={quantity}
                    onChange={(value) => handleUpdateQuantity(record.product_id._id, value)}
                />
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Popconfirm
                    title="Bạn có chắc muốn xóa sản phẩm này?"
                    onConfirm={() => handleRemoveItem(record.product_id._id)}
                >
                    <Button danger>Xóa</Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div style={{ padding: "20px" }}>
            <h2>Giỏ Hàng</h2>
            {loading ? (
                <p>Loading...</p>
            ) : cart && cart.items.length > 0 ? (
                <>
                    <Table
                        dataSource={cart.items}
                        columns={columns}
                        rowKey={(record) => record.product_id._id}
                        pagination={false}
                    />
                    <Button
                        type="primary"
                        danger
                        style={{ marginTop: "20px" }}
                        onClick={handleClearCart}
                    >
                        Xóa toàn bộ giỏ hàng
                    </Button>
                    <Button
                        type="primary"
                        style={{ marginTop: "20px", background: "#ff7b00", borderColor: "#ff7b00" }}
                        onClick={() => { navigate('/checkout'); }}
                    >
                        Thanh toán
                    </Button>
                </>
            ) : (
                <p>Giỏ hàng của bạn đang trống!</p>
            )}
        </div>
    );
}

export default CartClient;
