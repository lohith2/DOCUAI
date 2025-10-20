🧠 DOCUAI – Serverless Document Q&A with AWS Bedrock & Textract

DOCUAI is a serverless AI-powered document analysis system that automatically extracts text from uploaded documents using Amazon Textract, then answers user questions about the document using AWS Bedrock’s Llama 3 70B Instruct model.

It’s built entirely with AWS Lambda, API Gateway, and IAM, providing a scalable, low-maintenance pipeline for intelligent document understanding.

⚙️ Features

📄 Automatic text extraction from documents (PDFs, images, etc.) using Amazon Textract

💬 Question answering with AWS Bedrock Llama 3 70B Instruct

☁️ Serverless architecture — fully managed with AWS Lambda + API Gateway

🔐 Secure uploads to S3 via signed requests or API Gateway

🧩 Simple JSON API for integration with frontends or other services

⚡ Asynchronous polling for reliable Textract job completion

🏗️ Architecture Overview
Client (Web/App)
   ↓
API Gateway  —→  AWS Lambda (Python 3.x)
                      ├── Uploads file to S3
                      ├── Runs Textract text extraction
                      ├── Calls Bedrock (Llama 3)
                      └── Returns structured answer
   ↓
Response JSON → { question, answer, message }

🧰 Tech Stack
Component	Service
Language	Python 3.x
AWS AI Services	Amazon Textract, AWS Bedrock
Runtime	AWS Lambda
Gateway	Amazon API Gateway
Storage	Amazon S3
Permissions	IAM Policies

🚀 Quick Start
1️⃣ Create Resources

- S3 bucket – to store uploaded documents

- Lambda function – runtime: Python 3.10+

- API Gateway – with POST endpoint integrated with Lambda

- IAM Role – attach Textract, S3, Bedrock, and CloudWatch policies

2️⃣ Set Lambda Environment

- Make sure your Lambda has:

AWS_REGION=us-west-2

3️⃣ Deploy the Lambda Code

- Paste the lambda_handler and ask_question_bedrock functions into your Lambda console.

Your lambda_handler entry point will:

- Accept the payload from API Gateway

- Upload the file to S3

- Extract text using Textract

- Query Bedrock Llama 3 for an answer

📜 License

This project is licensed under the MIT License.
