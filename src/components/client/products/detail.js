import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  message,
  Card,
  Divider,
  Typography,
  Space,
  Tag,
  Row,
  Col,
} from "antd";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import {
  CheckCircleOutlined,
  PhoneOutlined,
  TruckOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import "./detail.css";
import priceNewProduct from "../helper/priceNew";
import Cookies from "js-cookie";

const { Title, Text } = Typography;

function DetailProductClient() {
  const API = process.env.REACT_APP_API_URL_CLIENT;
  const API_ADMIN = process.env.REACT_APP_API_URL_ADMIN;

  const { slug } = useParams();
  const [product, setProduct] = useState({});
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [socket, setSocket] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const socketInstance = io("http://localhost:8080", {
      transports: ["websocket", "polling"],
      path: "/socket.io",
    });
    setSocket(socketInstance);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API}/products/${slug}`);
        const json = await res.json();

        console.log("json: ", json);

        if (json.data) {
          setProduct(json.data.product);
          setCategory(json.data.category);
          document.title = json.pageTitle;
        }
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [API, slug]);

  const formatCurrency = (number) => {
    if (!number) return "";
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
  };

  const handleOrderClick = async () => {
    if (!phoneNumber) return message.error("Vui lòng nhập số điện thoại!");

    const orderData = {
      product: product.title,
      phoneNumber,
      type: "quickOrder",
    };

    socket.emit("order", orderData);

    try {
      const response = await fetch(
        `${API_ADMIN}/notifications/postQuickOrder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        }
      );

      const result = await response.json();
      if (result.code === 200) message.success("Đặt hàng thành công!");
      else message.error(result.message);
    } catch (error) {
      message.error("Lỗi khi gửi yêu cầu đặt hàng!");
    }
  };

  const handleAddToCart = async () => {
    if (quantity < 1) return message.error("Số lượng không hợp lệ!");

    const token = Cookies.get("token");
    if (!token) return message.error("Bạn phải đăng nhập!");

    console.log("product_id: ", product._id);

    try {
      const response = await fetch(`${API}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product._id,
          slug: product.slug,
          quantity,
        }),
      });

      const result = await response.json();
      if (result.status === "success")
        message.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
      else message.error(result.message);
    } catch (error) {
      message.error("Có lỗi khi thêm giỏ hàng!");
    }
  };

  return (
    <div className="detail-page">
      {/* 🔥 TITLE */}
      <div className="breadcrumb">
        <span className="abc" style={{ cursor: "pointer" }}>
          Trang chủ
        </span>
        <span> / </span>
        <span className="abc" style={{ cursor: "pointer" }}>
          {category}
        </span>
      </div>

      <Title level={2} className="product-main-title">
        {product.title}
      </Title>

      <Divider />

      <div className="detail-layout">
        {/* LEFT IMAGE */}
        <div className="image-card" hoverable>
          <img
            src={product.thumbnail}
            alt={product.title}
            className="product-image"
          />
        </div>

        {/* CENTER - PRICE & ORDER */}
        <Card className="center-card" bordered>
          <Title level={4}>Thông tin sản phẩm</Title>

          <div className="price-block">
            <Space direction="vertical" size={5} style={{ width: "100%" }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Text>Giá gốc:</Text>
                </Col>
                <Col span={16}>
                  <Text delete type="secondary" style={{ fontSize: 16 }}>
                    {formatCurrency(product.price)}
                  </Text>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Text style={{ fontSize: 14 }}>Giá khuyến mại:</Text>
                </Col>
                <Col span={16}>
                  <Text strong style={{ fontSize: 20, color: "red" }}>
                    {formatCurrency(priceNewProduct(product))}
                  </Text>
                </Col>
              </Row>
            </Space>

            <Tag color="green" style={{ marginTop: 10 }}>
              Còn {product.stock} sản phẩm
            </Tag>
          </div>

          <Divider />

          {/* ORDER FORM */}
          <Space direction="vertical" style={{ width: "100%" }} size={12}>
            <Space align="center">
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                style={{ width: 80 }}
              />
              <Button size="large" type="primary" onClick={handleAddToCart}>
                Thêm vào giỏ hàng
              </Button>
            </Space>
          </Space>

          <div>
            <div style={{ marginTop: "45px" }}>
              <b>Để lại số điện thoại, chúng tôi sẽ tư vấn cho Quý khách!</b>
              <Input
                size="large"
                placeholder="Nhập số điện thoại để đặt hàng nhanh"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />

              <Button
                style={{
                  marginTop: "20px",
                  width: "200px",
                  marginLeft: "80px",
                }}
                size="large"
                type="primary"
                danger
                block
                onClick={handleOrderClick}
              >
                ĐẶT HÀNG NGAY
              </Button>
            </div>
          </div>
        </Card>

        {/* RIGHT SHOP INFO */}
        <Card className="right-card" title="YÊN TÂM MUA HÀNG" bordered>
          <Space direction="vertical" size={10}>
            <Text>
              <CheckCircleOutlined style={{ color: "green" }} /> Hàng chính hãng
              100%
            </Text>
            <Text>
              <SafetyCertificateOutlined style={{ color: "#1677ff" }} /> Bảo
              hành tận nơi
            </Text>
            <Text>
              <CheckCircleOutlined style={{ color: "orange" }} /> 1 đổi 1 trong
              30 ngày
            </Text>
            <Text>
              <ShopOutlined style={{ color: "purple" }} /> Giá rẻ hơn cửa hàng
              khác
            </Text>
          </Space>

          <Divider />

          <Title level={5}>HOTLINE</Title>
          <Space direction="vertical">
            <Text>
              <PhoneOutlined /> Hà Nội: 0912.074.444
            </Text>
            <Text>
              <PhoneOutlined /> HCM: 0966.666.308
            </Text>
            <Text>
              <PhoneOutlined /> Bảo hành: 0888.129.444
            </Text>
          </Space>

          <Divider />

          <Title level={5}>GIAO HÀNG</Title>
          <Space direction="vertical">
            <Text>
              <TruckOutlined /> Giao nhanh Grab trong 2h
            </Text>
            <Text>
              <TruckOutlined /> Ship toàn quốc COD
            </Text>
          </Space>
        </Card>
      </div>
    </div>
  );
}

export default DetailProductClient;
