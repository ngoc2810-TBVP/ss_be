import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Select,
  Tag,
  Typography,
  message,
  Row,
  Col,
} from "antd";
import axiosToken from "../../context/axiosToken";
import moment from "moment";
import "./AdminOrders.css";

const { Option } = Select;
const { Text } = Typography;

function AdminOrders() {
  const API = process.env.REACT_APP_API_URL_ADMIN;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axiosToken.get(`${API}/order`);
        setOrders(res.data.orders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [API]);

  const handleChangeStatus = (order) => {
    setSelectedOrder(order);

    console.log("order: ", selectedOrder);
    setNewStatus(order.status);
    setStatusModalVisible(true);
  };

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      await axiosToken.put(`${API}/order/${selectedOrder._id}/status`, {
        status: newStatus,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === selectedOrder._id ? { ...o, status: newStatus } : o
        )
      );
      setStatusModalVisible(false);
      message.success("Cập nhật trạng thái thành công!");
    } catch (err) {
      console.log("err: ", err);
      message.error("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Người đặt",
      key: "user",
      render: (_, record) => (
        <div>
          <Text strong>{record.user?.fullName || ""}</Text>
          <br />
          <Text type="secondary">{record.user?.email || "-"}</Text>
          <br />
          <Text type="secondary">{record.user?.phone || "-"}</Text>
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      key: "items",
      render: (_, record) => (
        <div>
          {record.items?.map((item, idx) => (
            <Tag key={idx}>
              {item.product?.title || ""} x {item.quantity}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_price",
      key: "total_price",
      render: (total) =>
        total?.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        }) || "0 VND",
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "payment_method",
      key: "payment_method",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "blue";
        let label = "Chưa xử lý";

        if (status === "pending") {
          color = "orange";
          label = "Chờ xử lý";
        } else if (status === "completed") {
          color = "green";
          label = "Hoàn thành";
        } else if (status === "canceled") {
          color = "red";
          label = "Hủy";
        }

        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Địa chỉ giao",
      dataIndex: "shipping_address",
      key: "shipping_address",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleChangeStatus(record)}>
          Cập nhật trạng thái
        </Button>
      ),
    },
  ];

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="admin-orders-container">
      <Row gutter={16}>
        <Col span={24}>
          <h1 className="admin-title">Quản lý đơn hàng</h1>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={orders.map((o) => ({ ...o, key: o._id }))}
        bordered
        loading={loading}
        pagination={{ pageSize: 10 }}
        rowKey={(record) => record._id}
        className="orders-table"
      />

      <Modal
        title="Cập nhật trạng thái đơn hàng"
        open={statusModalVisible}
        onOk={handleUpdateStatus}
        onCancel={() => setStatusModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
        className="status-modal"
      >
        <Select
          value={newStatus}
          style={{ width: "100%" }}
          onChange={(value) => setNewStatus(value)}
        >
          <Option value="pending">Chờ xử lý</Option>
          <Option value="completed">Hoàn thành</Option>
          <Option value="canceled">Hủy</Option>
        </Select>
      </Modal>
    </div>
  );
}

export default AdminOrders;
