import React from "react";
import { Layout, Menu } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import { signOut, getCurrentUser } from "@aws-amplify/auth";

const { Header, Content, Sider } = Layout;

const AppLayout: React.FC = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate("/login");
    };

    const getMenuItems = () => {
        const roles = localStorage.getItem("roles")?.split(",") || [];
        const menuItems = [];

        if (roles.includes("ADMIN")) {
            menuItems.push({ key: "/patients", label: "Patients" });
            menuItems.push({ key: "/doctors", label: "Doctors" });
            menuItems.push({ key: "/consultation-types", label: "Consultation Types" });
        }

        return menuItems;
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider>
                <Menu
                    theme="dark"
                    mode="inline"
                    onClick={({ key }) => navigate(key)}
                    items={getMenuItems()}
                />
            </Sider>
            <Layout>
                <Header style={{ color: "white", textAlign: "right" }}>
          <span style={{ cursor: "pointer" }} onClick={handleSignOut}>
            Sign Out
          </span>
                </Header>
                <Content style={{ margin: "16px" }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
