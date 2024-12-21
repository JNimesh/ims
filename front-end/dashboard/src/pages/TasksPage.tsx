import React, {useState, useEffect} from "react";
import {Table, Button, Modal, Form, Input, Upload, Select, message, Tag, Spin} from "antd";
import {PlusOutlined, UploadOutlined} from "@ant-design/icons";
import {TasksApi, ImagesApi, ConsultationTypesApi, DoctorsApi} from "../api-client";
import type {Task, ConsultationType, Doctor, Image} from "../api-client/models";

const {Option} = Select;

const TasksPage: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [taskImages, setTaskImages] = useState<Image[]>([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [fileList, setFileList] = useState<any[]>([]);
    const [form] = Form.useForm();
    const principal = JSON.parse(localStorage.getItem("token") || "{}");
    const isPatient = localStorage.getItem("roles")?.includes("PATIENT");
    const userId = principal?.sub;

    const tasksApi = new TasksApi();
    const imagesApi = new ImagesApi();
    const consultationTypesApi = new ConsultationTypesApi();
    const doctorsApi = new DoctorsApi();

    const fetchTasks = async () => {
        setLoading(true);
        try {
            if (!userId) {
                message.error("User ID not found.");
                return;
            }
            const tasks = isPatient ? await tasksApi.getPatientTasks({patientId: userId}) : await tasksApi.getDoctorTasks({doctorId: userId});
            tasks.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
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

    const fetchTaskImages = async (taskId: string) => {
        setDetailsLoading(true);
        try {
            const images = await imagesApi.getTaskImages({taskId});
            setTaskImages(images);
        } catch (error) {
            console.error("Error fetching task images:", error);
            message.error("Failed to fetch task images.");
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleCreateTask = async (values: { type: string; notes: string }) => {
        setFormLoading(true);
        try {
            if (!userId || !selectedType || !selectedDoctor) {
                message.error("Patient ID, Consultation Type, or Doctor not selected.");
                return;
            }
            const newTask = await tasksApi.postTasks({
                createTaskRequest: {
                    type: selectedType,
                    notes: values.notes,
                    patientId: userId,
                    doctorId: selectedDoctor,
                    status: "Open",
                    price: consultationTypes?.find((type) => type.id === selectedType)?.price,
                },
            });

            // Upload images if any
            if (fileList.length > 0) {
                for (const file of fileList) {
                    const base64Data = await getBase64(file.originFileObj);
                    await imagesApi.postTaskImages({
                        taskId: newTask.id as string,
                        postImageRequest: {
                            ...base64Data,
                            patientId: userId,
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
            setFormLoading(false);
        }
    };

    const handleViewDetails = async (task: Task) => {
        setCurrentTask(task);
        setTaskImages([]);
        setIsDetailsModalVisible(true);
        await fetchTaskImages(task.id as string);
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
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => new Date(date).toLocaleString(),
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
            title: "Details",
            key: "images",
            render: (_: any, record: Task) => (
                <Button type="link" onClick={() => handleViewDetails(record)}>
                    {isPatient || record.status === 'Closed' ? "View Details" : "Diagnose Report"}
                </Button>
            ),
        },
    ];

    return (
        <div>
            {
                isPatient && <Button
                    type="primary"
                    icon={<PlusOutlined/>}
                    onClick={() => setIsModalVisible(true)}
                    style={{marginBottom: "16px"}}
                >
                    Create Task
                </Button>
            }
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
                            {/*<Form.Item label="Notes" name="notes">*/}
                            {/*    <Input.TextArea placeholder="Enter task notes"/>*/}
                            {/*</Form.Item>*/}
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
            <Modal
                title="Task Details"
                visible={isDetailsModalVisible}
                onCancel={() => setIsDetailsModalVisible(false)}
                footer={null}
            >
                <Spin spinning={detailsLoading}>
                    {currentTask && (
                        <>
                            <p>
                                <strong>Type:</strong>{" "}
                                {consultationTypes.find((t) => t.id === currentTask.type)?.type}
                            </p>
                            <p>
                                <strong>Status:</strong>{" "}
                                <Tag color={currentTask.status === "Open" ? "blue" : "green"}>
                                    {currentTask.status}
                                </Tag>
                            </p>
                            <p>
                                <strong>Price:</strong> ${currentTask.price}
                            </p>
                            {
                                currentTask.status === "Closed" && <p>
                                    <strong>Notes:</strong> {currentTask.notes}
                                </p>
                            }
                            <div>
                                <strong>Images:</strong>
                                {taskImages.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image.signedUrl}
                                        alt={`Task Image ${index + 1}`}
                                        style={{width: "100%", marginBottom: 10}}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </Spin>
            </Modal>
        </div>
    );
};

export default TasksPage;
