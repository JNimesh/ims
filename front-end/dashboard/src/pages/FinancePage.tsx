import React, {useState, useEffect} from "react";
import {Table, Select, DatePicker, Card, Statistic, message, Row, Col, Spin, Button} from "antd";
import {Bar, Pie} from "@ant-design/plots";
import {ConsultationType, ConsultationTypesApi, FinancialRecordsApi} from "../api-client";
import type {FinancialRecord} from "../api-client/models";
import dayjs from "dayjs";

const {Option} = Select;

const FinanceReportingPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"Monthly" | "Daily">("Monthly");
    const [duration, setDuration] = useState<string>("");
    const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const [totalTasks, setTotalTasks] = useState<number>(0);
    const [totalPatients, setTotalPatients] = useState<number>(0);
    const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([]);

    const financialRecordsApi = new FinancialRecordsApi();
    const consultationTypesApi = new ConsultationTypesApi();

    useEffect(() => {
        const fetchConsultationTypes = async () => {
            try {
                const consultationTypes = await consultationTypesApi.getConsultationTypes();
                setConsultationTypes(consultationTypes);
            } catch (error) {
                console.error("Error fetching consultation types:", error);
                message.error("Failed to fetch consultation types.");
            }
        };
        fetchConsultationTypes()
    }, []);

    const fetchFinancialRecords = async () => {
        if (!duration) {
            message.warning("Please select a duration.");
            return;
        }

        setLoading(true);
        try {
            const records = await financialRecordsApi.fetchFinancialRecords({duration});
            setFinancialRecords(records);

            // Calculate totals
            const totalRevenue = records.reduce((sum, record) => sum + (Number(record.totalRevenue) || 0), 0);
            const totalTasks = records.reduce((sum, record) => sum + (record.taskCount || 0), 0);
            const totalPatients = records.reduce((sum, record) => sum + (record.patientCount || 0), 0);

            setTotalRevenue(totalRevenue);
            setTotalTasks(totalTasks);
            setTotalPatients(totalPatients);
        } catch (error) {
            console.error("Error fetching financial records:", error);
            message.error("Failed to fetch financial records.");
        } finally {
            setLoading(false);
        }
    };

    const handleModeChange = (value: "Monthly" | "Daily") => {
        setMode(value);
        setDuration(""); // Reset duration when mode changes
    };

    const handleDurationChange = (_: any, dateString: string) => {
        setDuration(dateString);
    };

    const columns = [
        {
            title: "Consultation Type",
            dataIndex: "consultationType",
            key: "consultationType",
            render: (consultationType: string) => {
                const type = consultationTypes.find((type) => type.id === consultationType);
                return type?.type || consultationType;
            }
        },
        {
            title: "Task Count",
            dataIndex: "taskCount",
            key: "taskCount",
        },
        {
            title: "Patient Count",
            dataIndex: "patientCount",
            key: "patientCount",
        },
        {
            title: "Total Revenue",
            dataIndex: "totalRevenue",
            key: "totalRevenue",
            render: (revenue: number) => `$${Number(revenue).toFixed(2)}`,
        },
    ];

    const barChartData = financialRecords.map((record) => ({
        consultationType: consultationTypes.find((type) => type.id === record.consultationType)?.type || record.consultationType,
        value: Number(record.totalRevenue),
        type: "Revenue",
    }));

    const pieChartData = financialRecords.map((record) => ({
        type: consultationTypes.find((type) => type.id === record.consultationType)?.type || record.consultationType,
        value: Number(record.totalRevenue),
    }));

    return (
        <div>
            <Spin spinning={loading}>
                <Row gutter={[16, 16]}>
                    <Col span={6}>
                        <Select
                            defaultValue="Monthly"
                            onChange={handleModeChange}
                            style={{width: "100%"}}
                        >
                            <Option value="Monthly">Monthly</Option>
                            <Option value="Daily">Daily</Option>
                        </Select>
                    </Col>
                    <Col span={12}>
                        <DatePicker
                            picker={mode === "Monthly" ? "month" : "date"}
                            format={mode === "Monthly" ? "MM-YYYY" : "DD-MM-YYYY"}
                            onChange={(date, dateString) => handleDurationChange(date, dateString as string)}
                            style={{width: "100%"}}
                            value={duration ? dayjs(duration, mode === "Monthly" ? "MM-YYYY" : "DD-MM-YYYY") : null}
                        />
                    </Col>
                    <Col span={6}>
                        <Button type="primary" onClick={fetchFinancialRecords} block>
                            Fetch Records
                        </Button>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{marginTop: "16px"}}>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Total Revenue"
                                value={totalRevenue}
                                prefix="$"
                                precision={2}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic title="Total Tasks" value={totalTasks}/>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic title="Total Patients" value={totalPatients}/>
                        </Card>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={financialRecords}
                    rowKey="id"
                    style={{marginTop: "16px"}}
                />

                <Row gutter={[16, 16]} style={{marginTop: "16px"}}>
                    <Col span={12}>
                        <Card title="Revenue by Consultation Type (Bar Chart)">
                            <Bar
                                data={barChartData}
                                xField="consultationType"
                                yField="value"
                                seriesField="type"
                                color={["#1890FF"]}
                                legend={{position: "top"}}
                                height={300}
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="Revenue Distribution (Pie Chart)">
                            <Pie
                                data={pieChartData}
                                angleField="value"
                                colorField="type"
                                radius={1}
                                legend={{position: "bottom"}}
                                height={300}
                            />
                        </Card>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
};

export default FinanceReportingPage;
