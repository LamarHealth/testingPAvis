import json
import re
import boto3
from urllib.parse import unquote_plus

BUCKET_NAME = 'doc-classifier-bucket'


def get_kvps(textract_json: dict) -> dict:
    """
    Given a textract dictionary, returns a dictionary of all key value pairs in the doucment.
    """
    key_value_sets = [block for block in textract_json['Blocks'] if block['BlockType'] == 'KEY_VALUE_SET']

    key_value_dict = {}
    for kvp in key_value_sets:
        if kvp['EntityTypes'][0] == 'KEY':
            # Get Key IDs
            print(kvp)
            child_ids = [val for val in kvp['Relationships'] if val['Type'] == 'CHILD']
            if len(child_ids) == 0:
                print('no kids')
                continue
            key_ids = child_ids[0]['Ids']
            key_text = ''
            for key_id in key_ids:
                key_text += [val for val in textract_json['Blocks'] if val['Id'] == key_id][0].get('Text','')+' '

            # Get Value IDs
            value_ids = [val for val in kvp['Relationships'] if val['Type'] == 'VALUE'][0]['Ids']
            value_child_refs = ''

            for value_id in value_ids:
                value_ref_id = list(filter(lambda x: x['Id'] == value_id, textract_json['Blocks']))[0]['Id']
                value_children = list(filter(lambda x: x['Id'] == value_ref_id, textract_json['Blocks']))[0]
                # Sometimes children are blank
                if not value_children.get('Relationships', False):
                    key_value_dict[key_text] = ''
                    continue

                value_child_refs = value_children['Relationships'][0]['Ids']
                value_child_text = ' '.join([item['Text'] for item in filter(lambda x: x['Id'] in value_child_refs, textract_json['Blocks'])])
                # Vals
                key_value_dict[key_text] = value_child_text

    return key_value_dict

def lambda_handler(event, context):
    """
    Lambda is called after a document has been placed in the S3 bucket, and will process the document using Textract.
    """
    textract = boto3.client("textract")
    if event:
        # Read the filename in the bucket from the event and initiate the textract

        file_obj = event["Records"][0]
        filename = unquote_plus(str(file_obj["s3"]["object"]["key"]))
        # remove alphanumeric

        print(f"Bucket: {BUCKET_NAME} ::: Key: {filename}")

        response = textract.analyze_document(
            Document={
                "S3Object": {
                    "Bucket": BUCKET_NAME,
                    "Name": filename,
                },
            },
            FeatureTypes=['FORMS'],
        )
        print(json.dumps(response))

        
        # Post to Supabase
        kvps = get_kvps(response)

        print(kvps)
        
        return {
            "statusCode": 200,
            "body": json.dumps(kvps),
        }

    return {"statusCode": 500, "body": json.dumps("There is an issue!")}