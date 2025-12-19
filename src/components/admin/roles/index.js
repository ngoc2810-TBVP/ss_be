import React, { useEffect, useState } from "react";
import { Button, Row, Col, Input, Table, Modal, message } from "antd";
import { useNavigate } from "react-router-dom";
import axiosToken from "../../context/axiosToken";

const { confirm } = Modal;

function AdminRoles() {
  const API = process.env.REACT_APP_API_URL_ADMIN;
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectionType, setSelectionType] = useState("checkbox");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axiosToken.get(`${API}/roles`);

        console.log("res: ", res);
        if (res.data.roles != []) {
          setRoles(res.data.roles);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [API]);

  const handleRoleName = (item) => {
    navigate(`/admin/`);
  };

  const handlePositionChange = (item) => {};

  const handleAddProduct = () => {
    navigate(`/admin/roles/create`);
  };

  const handleDetail = (record) => {
    console.log("View details:", record);
    navigate(`/admin/roles/detail/${record._id}`);
  };

  const handleEdit = (record) => {
    console.log("Edit product:", record);
    navigate(`/admin/roles/edit/${record._id}`);
  };

  const handleDelete = (record) => {
    console.log("De product:", record);
    confirm({
      title: "Bạn có chắc chắn muốn xóa nhóm quyền này?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      okButtonProps: {
        style: {
          background: "linear-gradient(135deg, #6253e1, #04befe)",
          color: "#fff",
        },
      },
      async onOk() {
        setLoading(true);
        try {
          await axiosToken.delete(`${API}/roles/${record._id}`);
          setRoles((prevRoles) =>
            prevRoles.filter((role) => role._id !== record._id)
          );
          message.success("Xóa nhóm quyền thành công!");
        } catch (err) {
          console.error("Delete role error:", err);
          message.error("Xóa nhóm quyền thất bại!");
        } finally {
          setLoading(false);
        }
      },
      onCancel() {
        console.log("Hủy thao tác xóa");
      },
    });
  };

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `Selected Row Keys: ${selectedRowKeys}`,
        "Selected Rows: ",
        selectedRows
      );
    },
  };

  const columns = [
    {
      title: "Nhóm quyền",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <span
          onClick={() => handleRoleName(record)}
          style={{ cursor: "pointer" }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (description) => <span>{description}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "deleted",
      key: "deleted",
      render: (deleted) => (
        <Button className="btn-warn" type="primary">
          {deleted === false ? "Hoạt động" : "Dừng hoạt động"}
        </Button>
      ),
    },
    {
      title: "Vị trí",
      dataIndex: "position",
      key: "position",
      render: (position) => (
        <Input
          defaultValue={position}
          onChange={(e) => handlePositionChange(e, position.key)}
        />
      ),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      render: (text, record) => (
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button
            className=""
            type="primary"
            onClick={() => handleDetail(record)}
            style={{ background: "linear-gradient(135deg, #6253e1, #04befe)" }}
          >
            <b>Chi tiết</b>
          </Button>
          <Button
            className="btn-warn"
            type="primary"
            onClick={() => handleEdit(record)}
          >
            <b>Sửa</b>
          </Button>
          <Button type="primary" danger onClick={() => handleDelete(record)}>
            <b>Xóa</b>
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {roles ? (
        <div className="product">
          <div>
            <h1>Danh sách nhóm quyền</h1>
          </div>
          <Row>
            <Col span={16}></Col>
            <Button type="primary" onClick={() => handleAddProduct()}>
              Thêm nhóm quyền
            </Button>
          </Row>
          <div className="mt-2">
            <Table
              rowSelection={{
                type: selectionType,
                ...rowSelection,
              }}
              columns={columns}
              dataSource={roles.map((product) => ({
                ...product,
                key: product._id,
              }))}
            />
          </div>
        </div>
      ) : (
        <div>Không có nhóm quyền nào để hiển thị</div>
      )}
    </div>
  );
}

export default AdminRoles;
