import React, {useEffect, useState} from "react";
import {Table, Button, Modal, Form, Input, Select, message, Tag} from "antd";
import {UsersAdminAccessOnlyApi, DoctorsApi, DoctorCompetenciesApi, ConsultationTypesApi} from "../api-client";

const DoctorsPage: React.FC = () => {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [competencies, setCompetencies] = useState<any[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchDoctors();
        fetchCompetencies();
    }, []);

    const fetchDoctors = async () => {
        try {
            const api = new DoctorsApi();
            const data = await api.listDoctorsByConsultationType();
            setDoctors(data);
        } catch (error) {
            message.error("Failed to load doctors");
        }
    };

    const fetchCompetencies = async () => {
        try {
            const api = new ConsultationTypesApi();
            const data = await api.getConsultationTypes();
            setCompetencies(data);
        } catch (error) {
            message.error("Failed to load competencies");
        }
    };

    const handleCreate = () => {
        setSelectedDoctor(null);
        setIsModalVisible(true);
        form.resetFields();
    };

    const handleUpdate = (record: any) => {
        setSelectedDoctor(record);
        setIsModalVisible(true);
        form.setFieldsValue({
            name: record.name,
            email: record.email,
            competencies: record.competencies?.map((comp: any) => comp.consultationTypeId),
        });
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();

            const userApi = new UsersAdminAccessOnlyApi();
            const competencyApi = new DoctorCompetenciesApi();

            if (selectedDoctor) {
                // Update existing doctor
                const updated = await userApi.putUserById({
                    userId: selectedDoctor.id,
                    updateUserRequest: {name: values.name, role: "DOCTOR"},
                });

                // Update competencies
                await competencyApi.createDoctorCompetencies({
                    createDoctorCompetenciesRequest: {
                        competencies: (values.competencies || []).map((id: string) => ({
                            doctorId: updated.id as string,
                            consultationTypeId: id
                        })),
                    },
                });

                message.success("Doctor updated successfully!");
            } else {
                // Create new doctor
                const newDoctor = await userApi.postUsers({
                    createUserRequest: {name: values.name, email: values.email, role: "DOCTOR"},
                });

                // Assign competencies
                await competencyApi.createDoctorCompetencies({
                    createDoctorCompetenciesRequest: {
                        competencies: (values.competencies || []).map((id: string) => ({
                            doctorId: newDoctor.id as string,
                            consultationTypeId: id
                        })),
                    },
                });

                message.success("Doctor created successfully!");
            }

            setIsModalVisible(false);
        } catch (error) {
            console.log("Error:", error);
            message.error("Failed to save doctor details");
        } finally {
            fetchDoctors();
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Competencies",
            key: "competencies",
            dataIndex: "competencies",
            render: (competencies: any[]) => (
                <>
                    {competencies.map((comp: any) => (
                        <Tag color="blue" key={comp.id}>
                            {comp.consultationType.type}
                        </Tag>
                    ))}
                </>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: any) => (
                <Button type="link" onClick={() => handleUpdate(record)}>
                    Update
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Button type="primary" style={{marginBottom: 16}} onClick={handleCreate}>
                Create Doctor
            </Button>
            <Table
                columns={columns}
                dataSource={doctors}
                rowKey="id"
                bordered
            />
            <Modal
                title={selectedDoctor ? "Update Doctor" : "Create Doctor"}
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{required: true, message: "Please enter the name"}]}
                    >
                        <Input placeholder="Doctor's Name"/>
                    </Form.Item>
                    {!selectedDoctor && (
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                {required: true, message: "Please enter the email"},
                                {type: "email", message: "Please enter a valid email"},
                            ]}
                        >
                            <Input placeholder="Doctor's Email"/>
                        </Form.Item>
                    )}
                    <Form.Item
                        label="Competencies"
                        name="competencies"
                        rules={[{required: true, message: "Please select competencies"}]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select competencies"
                            options={competencies.map((comp: any) => ({
                                value: comp.id,
                                label: comp.type,
                            }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DoctorsPage;
