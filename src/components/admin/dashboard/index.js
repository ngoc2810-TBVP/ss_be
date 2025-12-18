import React, { useEffect, useState } from "react";
import { Row, Col, Card, message } from "antd";
import axiosToken from "../../context/axiosToken";

import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function DashboardAdmin() {
  const API = process.env.REACT_APP_API_URL_ADMIN + "/dashboard";

  const [orderStatus, setOrderStatus] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [usersGrowth, setUsersGrowth] = useState([]);
  const [topFavorites, setTopFavorites] = useState([]);
  const [stockStatus, setStockStatus] = useState([]);
  const [productCategory, setProductCategory] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [
        resOrderStatus,
        resTopProducts,
        resUsersGrowth,
        resTopFavorites,
        resStockStatus,
        resProdCategory,
      ] = await Promise.all([
        axiosToken.get(`${API}/orders-status`),
        axiosToken.get(`${API}/top-products`),
        // axiosToken.get(`${API}/users-growth`),
        axiosToken.get(`${API}/top-favorites`),
        axiosToken.get(`${API}/stock-status`),
        axiosToken.get(`${API}/products-category`),
      ]);

      setOrderStatus(resOrderStatus.data);
      setTopProducts(resTopProducts.data);
      setUsersGrowth(resUsersGrowth.data);
      setTopFavorites(resTopFavorites.data);
      setStockStatus(resStockStatus.data);
      //   setProductCategory(resProdCategory.data);
    } catch (err) {
      console.error("err: ", err);
      message.error("Lỗi tải dữ liệu Dashboard!");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải Dashboard...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Dashboard thống kê</h1>

      {/* BIỂU ĐỒ TRẠNG THÁI ĐƠN HÀNG */}
      <Row gutter={20} style={{ marginBottom: 30 }}>
        <Col span={12}>
          <Card title="Số lượng đơn theo trạng thái">
            <Pie
              data={{
                labels: orderStatus.map((o) => o._id),
                datasets: [
                  {
                    data: orderStatus.map((o) => o.count),
                    backgroundColor: [
                      "#52c41a",
                      "#faad14",
                      "#ff4d4f",
                      "#1677ff",
                      "#722ed1",
                    ],
                  },
                ],
              }}
            />
          </Card>
        </Col>

        {/* USER GROWTH */}
        {/* <Col span={12}>
          <Card title="Người dùng mới theo tháng">
            <Line
              data={{
                labels: usersGrowth.map((u) => u._id),
                datasets: [
                  {
                    label: "Users",
                    data: usersGrowth.map((u) => u.count),
                    borderColor: "#722ed1",
                  },
                ],
              }}
            />
          </Card>
        </Col> */}

        <Col span={12}>
          <Card title="Top 10 sản phẩm bán chạy">
            <Bar
              data={{
                labels: topProducts.map((p) => p.product?.[0]?.title),
                datasets: [
                  {
                    label: "Số lượng bán",
                    data: topProducts.map((p) => p.totalSold),
                    backgroundColor: "#13c2c2",
                  },
                ],
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* TOP SẢN PHẨM BÁN CHẠY + FAVORITES */}

      <Row gutter={20} style={{ marginBottom: 30 }}>
        <Col span={12}>
          <Card title="Top sản phẩm được yêu thích">
            <Bar
              data={{
                labels: topFavorites.map((f) => f.product?.[0]?.title),
                datasets: [
                  {
                    label: "Lượt thích",
                    data: topFavorites.map((f) => f.count),
                    backgroundColor: "#eb2f96",
                  },
                ],
              }}
            />
          </Card>
        </Col>

        {/* STOCK + CATEGORY */}
        <Col span={12}>
          <Card title="Tồn kho sản phẩm">
            <Bar
              data={{
                labels: stockStatus.map((s) => s.title),
                datasets: [
                  {
                    label: "Số lượng tồn",
                    data: stockStatus.map((s) => s.stock),
                    backgroundColor: "#fa8c16",
                  },
                ],
              }}
            />
          </Card>
        </Col>
      </Row>
      <Col span={12}>
        {/* <Card title="Số lượng sản phẩm theo danh mục">
            <Pie
              data={{
                labels: productCategory.map(
                  (c) => c.category?.[0]?.title || "Không tên"
                ),
                datasets: [
                  {
                    data: productCategory.map((c) => c.count),
                    backgroundColor: [
                      "#1677ff",
                      "#52c41a",
                      "#fa8c16",
                      "#ff4d4f",
                      "#722ed1",
                    ],
                  },
                ],
              }}
            />
          </Card> */}
      </Col>
    </div>
  );
}

export default DashboardAdmin;
