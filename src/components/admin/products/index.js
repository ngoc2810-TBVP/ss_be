import React, { useEffect, useState } from "react";
import { Button, Row, Col, Input, Table, Modal, message } from "antd";
import { useNavigate } from "react-router-dom";
import "./index.css";
import axiosToken from "../../context/axiosToken";

const { confirm } = Modal;

function AdminProducts({ permissions }) {
  const API = process.env.REACT_APP_API_URL_ADMIN;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectionType, setSelectionType] = useState("checkbox");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosToken.get(`${API}/products`);
        
        if (res.data.products && res.data.products.length > 0) {
          setProducts(res.data.products);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API]);

  const handleProductName = (item) => {
    navigate(`/admin/products/detail/${item.slug}`);
  };

  const handleAddProduct = () => {
    navigate(`/admin/products/create`);
  };

  const handleDetail = (record) => {
    navigate(`/admin/products/detail/${record.slug}`);
  };

  const handleEdit = (record) => {
    navigate(`/admin/products/edit/${record.slug}`);
  };

  const handleDelete = async (record) => {
    try {
      setLoading(true);
      await axiosToken.patch(`${API}/products/delete/${record.slug}`);

      // Cập nhật lại danh sách sau khi xóa
      setProducts((prev) => prev.filter((p) => p.slug !== record.slug));
      message.success("Xóa sản phẩm thành công!");
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Xóa sản phẩm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (record) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      content: `Tên sản phẩm: ${record.title}`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      okButtonProps: {
        style: {
          background: "linear-gradient(135deg, #6253e1, #04befe)",
          color: "#fff",
        },
      },
      cancelButtonProps: {
        style: { color: "#000" },
      },
      onOk() {
        handleDelete(record);
      },
      onCancel() {
        console.log("Hủy thao tác xóa");
      },
    });
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <span
          onClick={() => handleProductName(record)}
          style={{ cursor: "pointer" }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price}đ`,
    },
    {
      title: "Giảm",
      dataIndex: "discountPercentage",
      key: "discountPercentage",
      render: (discount) => `${discount}%`,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "10px" }}>
          {permissions?.includes("products_view") && (
            <Button
              type="primary"
              onClick={() => handleDetail(record)}
              style={{
                background: "linear-gradient(135deg, #6253e1, #04befe)",
              }}
            >
              Chi tiết
            </Button>
          )}
          {permissions?.includes("products_edit") && (
            <Button
              type="primary"
              onClick={() => handleEdit(record)}
              style={{
                background: "gold",
                borderColor: "#d4af37",
                color: "#000",
              }}
            >
              Sửa
            </Button>
          )}
          {permissions?.includes("products_delete") && (
            <Button
              type="primary"
              danger
              onClick={() => showDeleteConfirm(record)}
            >
              Xóa
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="product">
        <h1>Danh sách sản phẩm</h1>
        {permissions?.includes("products_create") && (
          <Row>
            <Button type="primary" onClick={handleAddProduct}>
              Thêm sản phẩm
            </Button>
          </Row>
        )}
        <div className="mt-2">
          <Table
            rowSelection={{
              type: selectionType,
            }}
            columns={columns}
            dataSource={products.map((product) => ({
              ...product,
              key: product._id,
            }))}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;
