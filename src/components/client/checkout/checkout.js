import React, { useEffect, useState } from "react";
import { Radio, Input, Button, message, Card } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const CheckoutClient = () => {
    const [cartItems, setCartItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [qrData, setQrData] = useState(null);
    const API = process.env.REACT_APP_API_URL_CLIENT;
    const [isModalVisible, setIsModalVisible] = useState(false);

    const navigate = useNavigate();

    // Lấy danh sách giỏ hàng
    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        const token = Cookies.get("token");

        if (!token) return message.error("Vui lòng đăng nhập!");

        try {
            const res = await axios.get(`${API}/cart`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.data.status === "success") {
                setCartItems(res.data.cart.items);
            } else {
                message.error("Không thể tải giỏ hàng!");
            }

        } catch (err) {
            console.error(err);
            message.error("Không thể tải giỏ hàng");
        }
    };

    // Tổng tiền
    const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.product_id.price * item.quantity,
        0
    );

    // Gửi yêu cầu thanh toán
    const handleCheckout = async () => {
        if (paymentMethod === "COD") {
            if (!fullName || !phone || !address) {
                return message.warning("Vui lòng nhập đầy đủ thông tin!");
            }
        }

        try {
            const token = Cookies.get("token");
            const formattedItems = cartItems.map(item => ({
                product_id: item.product_id._id || item.product_id,
                quantity: item.quantity
            }));

            const res = await axios.post(
                `${API}/order/checkout`,
                {
                    items: formattedItems,
                    payment_method: paymentMethod,
                    shipping_address: address,
                    note: ""
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("PAYMENT RESPONSE:", res.data);

            if (paymentMethod === "ONLINE") {
                setQrData(res.data.payment); // Lưu dữ liệu QR
                setIsModalVisible(true); // hiển thị popup
            } else {
                message.success("Đặt hàng thành công!");

                // Xóa toàn bộ giỏ hàng sau khi COD
                await axios.delete(`${API}/cart/clear`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCartItems([]);
                navigate("/orders");
            }
        } catch (err) {
            console.log("CHECKOUT ERROR:", err.response?.data || err);
            message.error("Thanh toán thất bại!");
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h2>Thanh toán</h2>

            {/* Danh sách sản phẩm */}
            <Card title="Sản phẩm trong giỏ" style={{ marginBottom: "20px" }}>
                {cartItems.map((item) => (
                    <div
                        key={item._id}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "10px",
                        }}
                    >
                        <span>
                            {item.product_id.name} × {item.quantity}
                        </span>
                        <strong>{item.product_id.price.toLocaleString()}đ</strong>
                    </div>
                ))}

                <hr />
                <h3 style={{ marginTop: "10px" }}>
                    Tổng tiền: {totalPrice.toLocaleString()}đ
                </h3>
            </Card>

            {/* Phương thức thanh toán */}
            <Card title="Phương thức thanh toán" style={{ marginBottom: "20px" }}>
                <Radio.Group
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                >
                    <Radio value="COD">Thanh toán khi nhận hàng (COD)</Radio>
                    <br />
                    <Radio value="ONLINE">Chuyển khoản online (VietQR)</Radio>
                </Radio.Group>
            </Card>

            {/* Form COD */}
            {paymentMethod === "COD" && (
                <Card title="Thông tin nhận hàng" style={{ marginBottom: "20px" }}>
                    <Input
                        placeholder="Họ và tên"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        style={{ marginBottom: "10px" }}
                    />
                    <Input
                        placeholder="Số điện thoại"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ marginBottom: "10px" }}
                    />
                    <Input.TextArea
                        placeholder="Địa chỉ nhận hàng"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </Card>
            )}

            {/* QR thanh toán */}
            {qrData && paymentMethod === "ONLINE" && (
                <Card title="Quét mã để thanh toán" style={{ marginBottom: "20px" }}>
                    <img src={qrData.qr_base64} alt="QR Thanh toán" width={250} />
                    <p>Số tiền: {qrData.amount.toLocaleString()}đ</p>
                    <p>Nội dung: {qrData.content}</p>
                </Card>
            )}

            <Button
                type="primary"
                style={{
                    width: "100%",
                    background: "#ff7b00",
                    borderColor: "#ff7b00",
                    fontSize: "16px",
                }}
                onClick={handleCheckout}
            >
                Xác nhận thanh toán
            </Button>
        </div>
    );
};

export default CheckoutClient;
