import React, {useEffect, useState} from "react";
import {Button, Table, Modal, Form, Input, message} from "antd";
import {UsersAdminAccessOnlyApi} from "../api-client";
import {CreateUserRequest, UpdateUserRequest, User} from "../api-client/models";

const PatientsPage: React.FC = () => {
    const [patients, setPatients] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<User | null>(null);
    const [form] = Form.useForm();

    const api = new UsersAdminAccessOnlyApi();

    // Fetch patients
    const fetchPatients = async () => {
        try {
            setLoading(true);
            //const response = await api.({}); // Assuming `getPatients` exists in your API client
            setPatients([]);
        } catch (error) {
            message.error("Failed to load patients");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    // Handle create or update patient
    const handleFinish = async (values: CreateUserRequest | UpdateUserRequest) => {
        try {
            setLoading(true);
            if (editingPatient) {
                // Update patient
                await api.putUserById({
                    userId: editingPatient.id as string,
                    updateUserRequest: values as UpdateUserRequest,
                });
                message.success("Patient updated successfully");
            } else {
                // Create patient
                await api.postUsers({createUserRequest: {...(values as CreateUserRequest), role: "PATIENT"}});
                message.success("Patient created successfully");
            }
            setIsModalOpen(false);
            fetchPatients();
        } catch (error) {
            message.error("Failed to save patient");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPatient(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (patient: User) => {
        setEditingPatient(patient);
        form.setFieldsValue(patient);
        setIsModalOpen(true);
    };

    const columns = [
        {title: "Name", dataIndex: "name", key: "name"},
        {title: "Email", dataIndex: "email", key: "email"},
        {title: "Phone", dataIndex: "phone", key: "phone"},
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: User) => (
                <Button type="link" onClick={() => handleEdit(record)}>
                    Update
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Button type="primary" style={{marginBottom: "16px"}} onClick={handleCreate}>
                Create Patient
            </Button>
            <Table
                columns={columns}
                dataSource={patients}
                rowKey="id"
                loading={loading}
                bordered
            />
            <Modal
                title={editingPatient ? "Update Patient" : "Create Patient"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleFinish} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{required: true, type: "email"}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="phone" label="Phone">
                        <Input/>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {editingPatient ? "Update" : "Create"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PatientsPage;
