import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient();

interface EmailRequest {
    templateName: string;
    recipientEmail: string;
    templateData: {
        patientName?: string;
        reportId?: string;
        doctorName?: string;
        completedDate?: string;
        assignedDate?: string;
    };
}

exports.handler = async (event: EmailRequest) => {
    const { templateName, recipientEmail, templateData } = event;

    if (!templateName || !recipientEmail || !templateData) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing required fields" }),
        };
    }

    try {
        const command = new SendTemplatedEmailCommand({
            Source: "ims@jnimesh.com", // Replace with your verified domain email
            Destination: { ToAddresses: [recipientEmail] },
            Template: templateName,
            TemplateData: JSON.stringify(templateData),
        });

        const response = await sesClient.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Email sent successfully", response }),
        };
    } catch (error) {
        console.error("Error sending email:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to send email", error }),
        };
    }
};
