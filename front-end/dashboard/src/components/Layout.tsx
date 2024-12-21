import React, { useEffect } from "react";
import { Layout, Menu } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Header, Content, Sider } = Layout;

const AppLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const roles = localStorage.getItem("roles")?.split(",") || [];
        // Redirect to default menu item for Admin if logged in
        if (roles.includes("ADMIN") && location.pathname === "/") {
            navigate("/patients");
        }
        if ((roles.includes("PATIENT") || roles.includes("DOCTOR")) && location.pathname === "/") {
            navigate("/tasks");
        }
    }, [location.pathname, navigate]);

    const handleSignOut = async () => {
        localStorage.removeItem("token");
        localStorage.removeItem("roles");
        navigate("/login");
    };

    const getMenuItems = () => {
        const roles = localStorage.getItem("roles")?.split(",") || [];
        const menuItems: any[] = [];

        if (roles.includes("ADMIN")) {
            menuItems.push({
                key: "admin",
                label: "Admin",
                type: "group", // Use 'group' for unclickable menu title
                children: [
                    { key: "/patients", label: "Patients" },
                    { key: "/doctors", label: "Doctors" },
                    { key: "/consultation-types", label: "Consultation Types" },
                ],
            });
        }
        if (roles.includes("PATIENT")) {
            menuItems.push({
                key: "patient",
                label: "Patient",
                type: "group", // Use 'group' for unclickable menu title
                children: [
                    { key: "/tasks", label: "Reports" }
                ],
            });
        }
        if (roles.includes("DOCTOR")) {
            menuItems.push({
                key: "doctor",
                label: "Doctor",
                type: "group", // Use 'group' for unclickable menu title
                children: [
                    { key: "/tasks", label: "Tasks" }
                ],
            });
        }
        return menuItems;
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]} // Highlight the active menu based on URL
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
