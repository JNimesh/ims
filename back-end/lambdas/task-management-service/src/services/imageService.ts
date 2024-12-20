import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { Image } from "../models";

const s3 = new AWS.S3({
    region: "ap-south-1",
    endpoint: "https://s3.ap-south-1.amazonaws.com", // Explicitly set the regional endpoint
    signatureVersion: "v4", // Ensure the use of the correct signing version
});

const bucketName = process.env.S3_BUCKET_NAME!;

// Upload Base64 Image to S3
export const uploadImageToS3 = async (base64Data: string, fileType: string) => {
    const buffer = Buffer.from(base64Data, "base64");
    const fileName = `${uuidv4()}.${fileType.split("/")[1]}`;

    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: fileType,
    };

    const result = await s3.upload(params).promise();
    return result.Location;
};

// Save Image Record in Database
export const saveImageRecord = async (
    type: string,
    url: string,
    patientId: string,
    taskId: string | null
) => {
    return await Image.create({
        id: uuidv4(),
        type,
        url,
        patientId,
        taskId,
    });
};

// Get Images by Task
export const getImagesByTask = async (taskId: string) => {
    const images = await Image.findAll({ where: { taskId } });

    // Generate pre-signed URLs for each image
    const signedUrls = await Promise.all(
        images.map(async (image) => {
            const key = image.url.split("/").pop(); // Extract the key from URL
            const signedUrl = s3.getSignedUrl("getObject", {
                Bucket: bucketName,
                Key: key,
                Expires: 60 * 10, // URL valid for 60 minutes
            });
            return { ...image.toJSON(), signedUrl };
        })
    );

    return signedUrls;
};
