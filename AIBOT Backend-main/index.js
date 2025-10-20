const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const s3 = new AWS.S3();
const lambda = new AWS.Lambda({ region: 'us-west-2' });

const app = express();
const upload = multer({ dest: 'uploads/' });

const extractedTextCache = {};

const LAMBDA_FUNCTION_NAME = 'sahilbot';
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/process', upload.single('file'), async (req, res) => {
    const { file } = req;
    const { question, bucket } = req.body;

    if (!question || !bucket) {
        return res.status(400).json({ error: 'Question and bucket are required.' });
    }

    try {
        if (file) {
            const fileContent = fs.readFileSync(file.path);

            const s3Params = {
                Bucket: bucket,
                Key: file.originalname,
                Body: fileContent,
            };

            await s3.upload(s3Params).promise();

            const payload = {
                bucket,
                file_name: file.originalname,
                file_content: fileContent.toString('base64'),
                question,
            };

            const lambdaParams = {
                FunctionName: LAMBDA_FUNCTION_NAME,
                InvocationType: 'RequestResponse',
                Payload: JSON.stringify(payload),
            };

            const lambdaResponse = await lambda.invoke(lambdaParams).promise();
            const lambdaResponsePayload = JSON.parse(lambdaResponse.Payload);

            if (lambdaResponse.StatusCode === 200) {
                extractedTextCache[bucket] = lambdaResponsePayload.extracted_text;
                return res.json(lambdaResponsePayload);
            } else {
                return res.status(500).json({
                    error: 'Lambda function error',
                    details: lambdaResponsePayload,
                });
            }
        } else if (extractedTextCache[bucket]) {
            const extractedText = extractedTextCache[bucket];

            const payload = {
                bucket,
                question,
                extracted_text: extractedText,
            };

            const lambdaParams = {
                FunctionName: LAMBDA_FUNCTION_NAME,
                InvocationType: 'RequestResponse',
                Payload: JSON.stringify(payload),
            };

            const lambdaResponse = await lambda.invoke(lambdaParams).promise();
            const lambdaResponsePayload = JSON.parse(lambdaResponse.Payload);

            if (lambdaResponse.StatusCode === 200) {
                return res.json(lambdaResponsePayload);
            } else {
                return res.status(500).json({
                    error: 'Lambda function error',
                    details: lambdaResponsePayload,
                });
            }
        } else {
            return res.status(400).json({ error: 'File must be uploaded first.' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    } finally {
        if (file) {
            fs.unlinkSync(file.path);
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});