import React, {useState, useEffect} from "react";
import {Table, Button, Modal, Form, Input, Upload, Select, message, Tag} from "antd";
import {PlusOutlined, UploadOutlined} from "@ant-design/icons";
import {TasksApi, ImagesApi, ConsultationTypesApi, DoctorsApi} from "../api-client";
import type {Task, ConsultationType, Doctor} from "../api-client/models";

const {Option} = Select;

const TasksPage: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [fileList, setFileList] = useState<any[]>([]);
    const [form] = Form.useForm();
    const principal = JSON.parse(localStorage.getItem("token") || "{}");
    const patientId = principal?.sub;

    const tasksApi = new TasksApi();
    const imagesApi = new ImagesApi();
    const consultationTypesApi = new ConsultationTypesApi();
    const doctorsApi = new DoctorsApi();

    const fetchTasks = async () => {
        try {
            setLoading(true);
            if (!patientId) {
                message.error("Patient ID not found.");
                return;
            }
            const tasks = await tasksApi.getPatientTasks({patientId});
            setTasks(tasks);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            message.error("Failed to fetch tasks.");
        } finally {
            setLoading(false);
        }
    };

    const fetchConsultationTypes = async () => {
        try {
            const types = await consultationTypesApi.getConsultationTypes();
            setConsultationTypes(types);
        } catch (error) {
            console.error("Error fetching consultation types:", error);
            message.error("Failed to fetch consultation types.");
        }
    };

    const fetchDoctors = async (consultationTypeId: string) => {
        try {
            const doctors = await doctorsApi.listDoctorsByConsultationType({consultationTypeId});
            setDoctors(doctors);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            message.error("Failed to fetch doctors.");
        }
    };

    const handleCreateTask = async (values: { type: string; notes: string }) => {
        try {
            setLoading(true);
            if (!patientId || !selectedType || !selectedDoctor) {
                message.error("Patient ID, Consultation Type, or Doctor not selected.");
                return;
            }
            const newTask = await tasksApi.postTasks({
                createTaskRequest: {
                    type: selectedType,
                    notes: values.notes,
                    patientId,
                    doctorId: selectedDoctor,
                    status: "Open",
                    price: consultationTypes?.find((type) => type.id === selectedType)?.price,
                },
            });

            // Upload images if any
            if (fileList.length > 0) {
                for (const file of fileList) {
                    const base64Data = await getBase64(file.originFileObj);
                    console.log("Base64 data:", base64Data);
                    await imagesApi.postTaskImages({
                        taskId: newTask.id as string,
                        postImageRequest: {
                            ...base64Data,
                            patientId
                        },
                    });
                }
            }

            message.success("Task created successfully.");
            fetchTasks();
            setIsModalVisible(false);
            form.resetFields();
            setFileList([]);
        } catch (error) {
            console.error("Error creating task:", error);
            message.error("Failed to create task.");
        } finally {
            setLoading(false);
        }
    };
    const getBase64 = (file: File): Promise<{ type: string; base64Data: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const base64Data = result.split(",")[1]; // Extract only the base64 part
                resolve({
                    type: file.type, // Get the MIME type of the file
                    base64Data,
                });
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleNextStep = async () => {
        if (!selectedType) {
            message.error("Please select a consultation type.");
            return;
        }
        await fetchDoctors(selectedType);
        setCurrentStep(2);
    };

    const handleBackStep = () => {
        setCurrentStep(1);
        form.resetFields();
        setFileList([]);
        setDoctors([]);
        setSelectedDoctor(null);
    };

    useEffect(() => {
        fetchTasks();
        fetchConsultationTypes();
    }, []);

    const columns = [
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (type: string) => (
                <Tag color="geekblue" key={type}>
                    {consultationTypes.find((t) => t.id === type)?.type}
                </Tag>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
               <Tag color={status === "Open" ? "blue" : "green"}>{status}</Tag>
            ),
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
        },
        {
            title: "Images",
            key: "images",
            render: (_: any, record: Task) => (
                <Button type="link">
                    View Images {/* Replace with logic for viewing images */}
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Button
                type="primary"
                icon={<PlusOutlined/>}
                onClick={() => setIsModalVisible(true)}
                style={{marginBottom: "16px"}}
            >
                Create Task
            </Button>
            <Table
                columns={columns}
                dataSource={tasks}
                rowKey="id"
                loading={loading}
            />
            <Modal
                title="Create Task"
                visible={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setCurrentStep(1);
                }}
                footer={null}
            >
                {currentStep === 1 ? (
                    <>
                        <Form>
                            <Form.Item label="Select Consultation Type">
                                <Select
                                    placeholder="Select a consultation type"
                                    onChange={(value) => setSelectedType(value)}
                                >
                                    {consultationTypes.map((type) => (
                                        <Option key={type.id} value={type.id}>
                                            {type.type}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Button type="primary" onClick={handleNextStep} block>
                                Next
                            </Button>
                        </Form>
                    </>
                ) : (
                    <>
                        <Form form={form} layout="vertical" onFinish={handleCreateTask}>
                            <div
                                style={{marginBottom: '10px'}}>{`Consultation Charges for Selected Report Type: ${consultationTypes.find(t => t.id === selectedType)?.price}`}</div>
                            <Form.Item
                                label="Select Doctor"
                                name="doctorId"
                                rules={[{required: true, message: "Please select a doctor."}]}
                            >
                                <Select
                                    placeholder="Select a doctor"
                                    onChange={(value) => setSelectedDoctor(value)}
                                >
                                    {doctors.map((doctor) => (
                                        <Option key={doctor.id} value={doctor.id}>
                                            {doctor.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item label="Notes" name="notes">
                                <Input.TextArea placeholder="Enter task notes"/>
                            </Form.Item>
                            <Form.Item label="Images">
                                <Upload
                                    beforeUpload={() => false}
                                    fileList={fileList}
                                    onChange={({fileList}) => setFileList(fileList.slice(0, 2))}
                                    multiple
                                >
                                    <Button icon={<UploadOutlined/>}>Upload (Max: 2 Images)</Button>
                                </Upload>
                            </Form.Item>
                            <Button type="default" onClick={handleBackStep} style={{marginRight: "8px"}}>
                                Back
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Submit
                            </Button>
                        </Form>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default TasksPage;
