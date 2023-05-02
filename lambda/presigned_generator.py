import os
import json
import boto3
from typing import Dict, Any
from botocore.exceptions import ClientError

PDF_UPLOAD_BUCKET = "plumbus-ocr-pdf-bucket"
OUTPUT_BUCKET = "plumbus-ocr-output-bucket"

s3 = boto3.client("s3")


def generate_presigned_post(bucket: str, object_key: str, expiration: int = 3600) -> Dict[str, Any]:
    """
    Generate a presigned post for an S3 object.

    :param s3: S3 client instance
    :param bucket: S3 bucket name
    :param object_key: S3 object key
    :param expiration: Expiration time in seconds for the presigned post
    :return: presigned post as a dictionary
    """
    print(f"Generating presigned post for: s3://{bucket}/{object_key}")
    try:
        response = s3.generate_presigned_post(
            Bucket=bucket,
            Key=object_key,
            ExpiresIn=expiration,
        )
    except ClientError as e:
        raise Exception("Error generating presigned post: ", e)
    return response


def create_presigned_get(bucket_name, object_name, expiration=3600):
    """Generate a presigned URL to share an S3 object

    :param bucket_name: string
    :param object_name: string
    :param expiration: Time in seconds for the presigned URL to remain valid
    :return: Presigned URL as string. If error, returns None.
    """

    # Generate a presigned URL for the S3 object
    try:
        response = s3.generate_presigned_url('get_object',
                                             Params={'Bucket': bucket_name,
                                                     'Key': object_name},
                                             ExpiresIn=expiration)
    except ClientError as e:
        print(e)
        return None

    # The response contains the presigned URL
    return response


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle the Lambda function event.

    :param event: Lambda event containing the API Gateway request
    :param context: Lambda context, unused in this function
    :return: API Gateway response containing the presigned post
    """

    if "body" not in event:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"message": "Missing body in the request"}),
        }

    object_key = event.get("body", '')
    if not object_key:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"message": "Missing object_key in the request body"}),
        }

    # Post for uploading

    urls = {"presigned_post": generate_presigned_post(PDF_UPLOAD_BUCKET, object_key),
            "pdf": create_presigned_get(PDF_UPLOAD_BUCKET, object_key),
            "kvps": create_presigned_get(OUTPUT_BUCKET, f"{object_key}/kvps.json"),
            "table": create_presigned_get(OUTPUT_BUCKET, f"{object_key}/table.csv"),
            "lines": create_presigned_get(OUTPUT_BUCKET, f"{object_key}/lines.json")}

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(urls),
    }


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda function handler.

    :param event: Lambda event containing the API Gateway request
    :param context: Lambda context, unused in this function
    :return: API Gateway response containing the presigned post
    """
    return handler(event, context)
