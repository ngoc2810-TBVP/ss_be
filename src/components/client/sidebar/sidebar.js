import React, { useState, useEffect } from "react";
import { Button, Menu, Dropdown, Input, List, Avatar, theme } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCartOutlined,
  PhoneOutlined,
  DesktopOutlined,
} from "@ant-design/icons";
import Cookies from "js-cookie";
import "./header.css";

const API = process.env.REACT_APP_API_URL_CLIENT;

export default function HeaderComponent() {
  const [productsCategory, setProductsCategory] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [value, setValue] = useState("");
  const [avatar, setAvatar] = useState(Cookies.get("avatar"));
  const navigate = useNavigate();
  const location = useLocation();
  const token = Cookies.get("token");

  const defaultAvatars = [
    "https://randomuser.me/api/portraits/men/1.jpg",
    "https://randomuser.me/api/portraits/men/2.jpg",
    "https://randomuser.me/api/portraits/men/3.jpg",
    "https://randomuser.me/api/portraits/men/4.jpg",
    "https://randomuser.me/api/portraits/men/5.jpg",
    "https://randomuser.me/api/portraits/men/6.jpg",
  ];

  // Fetch default avatar if no avatar is set in cookies
  useEffect(() => {
    if (!avatar) {
      const randomAvatar =
        defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
      setAvatar(randomAvatar); // Set a random avatar from defaultAvatars if none is provided
    }
  }, [avatar]);

  // Handle search input and fetch corresponding products
  const handleSearch = async (value) => {
    if (!value.trim()) return setSearchResults([]); // Clear if query is empty
    setLoadingSearch(true);
    try {
      const res = await fetch(`${API}/products/search?query=${value}`);
      const data = await res.json();
      setSearchResults(data.products || []); // Fallback to empty array if no products found
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Handle click on a product from the search results
  const handleProductClick = (slug) => {
    navigate(`/product/${slug}`);
    setSearchResults([]); // Clear search results on product click
  };

  // Fetch categories for the product menu
  useEffect(() => {
    const fetchProductsCategory = async () => {
      try {
        const res = await fetch(`${API}/products-category`);
        const json = await res.json();
        setProductsCategory(json.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchProductsCategory();
  }, [API]);

  // Dropdown menu for user account actions
  const accountMenu = (
    <Menu>
      <Menu.Item key="1">
        <Link to="/profile">Trang cá nhân</Link>
      </Menu.Item>
      <Menu.Item key="2">
        <Link to="/cart">Đơn hàng của tôi</Link>
      </Menu.Item>
      <Menu.Item
        key="3"
        onClick={() => {
          Cookies.remove("token");
          window.location.reload(); // Clear cookies and reload on logout
        }}
        style={{ color: "red" }}
      >
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  // Generate menu items based on product categories
  const generateMenuItems = () => {
    return productsCategory.map((category) => ({
      key: `/category/${category.slug}`,
      label: <Link to={`/category/${category.slug}`}>{category.title}</Link>,
    }));
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <>
      <div className="header">
        {/* Banner Section */}
        {/* <div className="header-banner">
          <img
            // src="https://kccshop.vn/media/banner/14_Febaad60d88ebff872e2aaa146ff2831332.png"
            src="https://phutungotophamgia.vn/wp-content/uploads/2022/10/banner_phamgia.jpg"
            alt="Banner"
            className="header-banner-image"
          />
        </div> */}

        {/* Button Section */}
        <div className="header-top-buttons">
          <Button className="header-button">Hệ thống showroom</Button>
          <Button className="header-button">Bán hàng trực tuyến</Button>
          <Button className="header-button-text">Trang tin công nghệ</Button>
          <Button className="header-button-text">
            Dịch vụ bảo hành tại nhà
          </Button>
          <Button className="header-button-text">Giới thiệu</Button>
          <Button className="header-button-text">Liên hệ</Button>
          <Button className="header-button-text">Tuyển dụng</Button>
        </div>

        {/* Logo and Search Section */}
        <div className="header-logo-search">
          <div className="header-logo">
            <img
              className="logo"
              src="https://phutungducanh.com/wp-content/uploads/2025/07/logo-phu-tung-duc-anh-den.png"
              alt="Logo"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/")}
            />
          </div>

          <div className="header-search">
            <Input.Search
              placeholder="Nhập từ khóa cần tìm"
              onSearch={handleSearch}
              enterButton
              style={{ width: 300 }}
            />
          </div>

          {searchResults.length > 0 && (
            <Dropdown
              overlay={
                <List
                  dataSource={searchResults}
                  renderItem={(item) => (
                    <List.Item onClick={() => handleProductClick(item.slug)}>
                      <List.Item.Meta
                        avatar={<Avatar src={item.thumbnail} />}
                        title={item.title}
                        description={`Price: ${item.price.toLocaleString()}₫`}
                      />
                    </List.Item>
                  )}
                />
              }
              trigger={["click"]}
              open={searchResults.length > 0} // Replaced 'visible' with 'open'
            >
              <Button
                className="search-dropdown-trigger"
                style={{ display: "none" }}
              />
            </Dropdown>
          )}

          <div className="header-info">
            <div className="header-info-item">
              <PhoneOutlined style={{ fontSize: "24px", color: "#ff7b00" }} />
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "16px",
                  color: "#ff7b00",
                }}
              >
                Hotline mua hàng: <br />
                <b>0912.074.444</b>
              </span>
            </div>

            {/* <div className="header-info-item">
              <DesktopOutlined style={{ fontSize: "24px", color: "#ff7b00" }} />
              <span style={{ marginLeft: "8px", fontSize: "16px" }}>
                T <br />
                <b>Cấu hình PC</b>
              </span>
            </div> */}

            <div className="header-info-item" onClick={() => navigate("/cart")}>
              <ShoppingCartOutlined
                style={{ fontSize: "24px", color: "#ff7b00" }}
              />
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Giỏ hàng
              </span>
            </div>
          </div>
        </div>

        <div className="header-login">
          <div className="header-menu-1">
            <Menu
              theme={theme}
              mode="horizontal"
              className="menuClient"
              items={generateMenuItems()}
              defaultSelectedKeys={[location.pathname]}
            />
          </div>

          <div className="header-user">
            {!token ? (
              <Button
                className="btn-loginClient"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </Button>
            ) : (
              <div className="btn-avtuser">
                <Dropdown overlay={accountMenu} placement="bottomRight" arrow>
                  <img
                    src={avatar}
                    className="client-avatar"
                    alt=""
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      cursor: "pointer",
                    }}
                  />
                </Dropdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
