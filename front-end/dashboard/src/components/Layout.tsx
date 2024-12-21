import React, { useEffect } from "react";
import { Layout, Menu, Typography, Space } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const AppLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userRole = (localStorage.getItem("roles")?.split(",") || [])[0];

    useEffect(() => {
        const roles = localStorage.getItem("roles")?.split(",") || [];
        if (roles.includes("ADMIN") && location.pathname === "/") {
            navigate("/patients");
        } else if (roles.includes("PATIENT") && location.pathname === "/") {
            navigate("/tasks");
        } else if (roles.includes("DOCTOR") && location.pathname === "/") {
            navigate("/tasks");
        } else if (roles.includes("FINANCE") && location.pathname === "/") {
            navigate("/financial-records");
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
                label: <Text strong>Admin</Text>,
                type: "group",
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
                label: <Text strong>Patient</Text>,
                type: "group",
                children: [
                    { key: "/tasks", label: "Reports" }
                ],
            });
        }
        if (roles.includes("DOCTOR")) {
            menuItems.push({
                key: "doctor",
                label: <Text strong>Doctor</Text>,
                type: "group",
                children: [
                    { key: "/tasks", label: "Tasks" }
                ],
            });
        }

        if (roles.includes("FINANCE")) {
            menuItems.push({
                key: "finance",
                label: <Text strong>Finance</Text>,
                type: "group",
                children: [
                    { key: "/financial-records", label: "Financial Records" }
                ],
            });
        }
        return menuItems;
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider theme="dark" breakpoint="lg" collapsedWidth="0" style={{ backgroundColor: "#001529" }} width={240}>
                <div style={{ height: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography.Title level={4} style={{ color: "white", margin: 0 }}>{`${userRole} Dashboard`}
                    </Typography.Title>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    onClick={({ key }) => navigate(key)}
                    items={getMenuItems()}
                    style={{ marginTop: "16px" }}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        backgroundColor: "#001529",
                        padding: "0 24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxShadow: "0 2px 8px #f0f1f2",
                    }}
                >
                    <Space>
                        <Text strong style={{ color: "#fff" }}>
                            {`Welcome ${localStorage.getItem("email")}`}
                        </Text>
                    </Space>
                    <Text
                        style={{ cursor: "pointer", color: "#fff" }}
                        onClick={handleSignOut}
                        strong
                    >
                        Sign Out
                    </Text>
                </Header>
                <Content style={{ margin: "24px 16px", padding: 24, backgroundColor: "#fff", borderRadius: "8px" }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
