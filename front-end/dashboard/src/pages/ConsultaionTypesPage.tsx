import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message } from "antd";
import { ConsultationTypesApi } from "../api-client";
import type {
    ConsultationType,
    ConsultationTypeRequest,
} from "../api-client/models";

const ConsultationTypesPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentType, setCurrentType] = useState<ConsultationType | null>(null);
    const [form] = Form.useForm();

    const consultationTypesApi = new ConsultationTypesApi();

    const fetchConsultationTypes = async () => {
        try {
            setLoading(true);
            const types = await consultationTypesApi.getConsultationTypes();
            setConsultationTypes(types);
        } catch (error) {
            console.error("Error fetching consultation types:", error);
            message.error("Failed to fetch consultation types.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (values: ConsultationTypeRequest) => {
        try {
            setLoading(true);
            if (currentType) {
                await consultationTypesApi.putConsultationTypeById({
                    id: currentType.id as string,
                    putConsultationTypeByIdRequest: {
                        type: values.type as string,
                        description: values.description as string,
                        price: values.price as number,
                    },
                });
                message.success("Consultation type updated successfully.");
            } else {
                await consultationTypesApi.postConsultationTypes({ consultationTypeRequest: values });
                message.success("Consultation type created successfully.");
            }
            fetchConsultationTypes();
            closeModal();
        } catch (error) {
            console.error("Error creating/updating consultation type:", error);
            message.error("Failed to save consultation type.");
        } finally {
            setLoading(false);
        }
    };

    const showModal = (type?: ConsultationType) => {
        setCurrentType(type || null);
        setIsModalVisible(true);
        if (type) {
            form.setFieldsValue(type); // Populate the form with existing values
        } else {
            form.resetFields(); // Reset the form for new creation
        }
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setCurrentType(null);
        form.resetFields();
    };

    useEffect(() => {
        fetchConsultationTypes();
    }, []);

    const columns = [
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price: number) => `$${Number(price).toFixed(2)}`,
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: ConsultationType) => (
                <Button type="link" onClick={() => showModal(record)}>
                    Update
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Button
                type="primary"
                onClick={() => showModal()}
                style={{ marginBottom: "16px" }}
            >
                Create Consultation Type
            </Button>
            <Table
                columns={columns}
                dataSource={consultationTypes}
                rowKey="id"
                loading={loading}
            />
            <Modal
                title={currentType ? "Update Consultation Type" : "Create Consultation Type"}
                visible={isModalVisible}
                onCancel={closeModal}
                footer={null}
            >
                <Form
                    layout="vertical"
                    onFinish={handleCreateOrUpdate}
                    form={form}
                >
                    <Form.Item
                        label="Type"
                        name="type"
                        rules={[{ required: true, message: "Please enter the type." }]}
                    >
                        <Input placeholder="Enter type" />
                    </Form.Item>
                    <Form.Item label="Description" name="description">
                        <Input.TextArea placeholder="Enter description" />
                    </Form.Item>
                    <Form.Item
                        label="Price"
                        name="price"
                        rules={[{ required: true, message: "Please enter the price." }]}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            placeholder="Enter price"
                            min={0}
                            step={0.01}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Save
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ConsultationTypesPage;
