import React, { useState } from "react";
import { Button, Card, Input, Form, message } from "antd";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import {AuthApi} from "../api-client";

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        const { email, password } = values;

        try {
            setLoading(true);
            const response = await (new AuthApi()).postAuthLogin({loginRequest: {email, password}});
            const token = response.accessToken as string;

            // Decode roles from token (JWT)
            const decodedToken: any = jwtDecode(token);
            const roles = decodedToken["cognito:groups"] || [];

            // Store token and roles in localStorage
            localStorage.setItem("token", JSON.stringify(decodedToken));
            localStorage.setItem("roles", roles.join(","));

            console.log("LoginPage token:", decodedToken);
            console.log("LoginPage token:", roles.join(","));

            message.success("LoginPage successful!");

            if (roles.includes("ADMIN")) {
                navigate("/patients");
            } else if (roles.includes("PATIENT") || roles.includes("DOCTOR")) {
                navigate("/tasks");
            }

        } catch (error: any) {
            console.error("LoginPage Error:", error);
            message.error(error.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="LoginPage" style={{ width: 400, margin: "100px auto" }}>
            <Form onFinish={onFinish} layout="vertical">
                <Form.Item label="Email" name="email" rules={[{ required: true, message: "Email is required" }]}>
                    <Input placeholder="Enter your email" />
                </Form.Item>
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "Password is required" }]}
                >
                    <Input.Password placeholder="Enter your password" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        LoginPage
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default LoginPage;
