import os
import json
import boto3
from typing import Dict, Any
from botocore.exceptions import ClientError


PDF_UPLOAD_BUCKET = "plumbus-ocr-pdf-bucket"


def generate_presigned_post(s3, object_key: str, expiration: int = 3600) -> Dict[str, Any]:
    """
    Generate a presigned post for an S3 object.

    :param s3: S3 client instance
    :param bucket: S3 bucket name
    :param object_key: S3 object key
    :param expiration: Expiration time in seconds for the presigned post
    :return: presigned post as a dictionary
    """
    try:
        response = s3.generate_presigned_post(
            Bucket=PDF_UPLOAD_BUCKET,
            Key=object_key,
            ExpiresIn=expiration,
        )
    except ClientError as e:
        raise Exception("Error generating presigned post: ", e)
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

    request_data = json.loads(event["body"])
    if "object_key" not in request_data:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"message": "Missing object_key in the request body"}),
        }

    object_key = request_data["object_key"]

    s3 = boto3.client("s3")
    presigned_post = generate_presigned_post(s3, object_key)

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"presigned_post": presigned_post}),
    }


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda function handler.

    :param event: Lambda event containing the API Gateway request
    :param context: Lambda context, unused in this function
    :return: API Gateway response containing the presigned post
    """
    return handler(event, context)
