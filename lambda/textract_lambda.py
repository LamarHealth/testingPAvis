"""
Listens to S3 events and starts a Textract job on the uploaded PDF.
"""
import json
import time
import boto3
import json
from typing import List

from urllib.parse import unquote_plus


PDF_UPLOAD_BUCKET = "plumbus-ocr-pdf-bucket"
OUTPUT_BUCKET = "plumbus-ocr-output-bucket"
s3 = boto3.client("s3")


def get_lines(block_list: List) -> List[dict]:
    """
    Given a textract dictionary, returns a dictionary of all the lines
    and their coordinate bounding boxes
    """
    lines = [block for block in block_list
             if block.get("BlockType", "") == "LINE"]
    lines = [
        {"Geometry": line["Geometry"],
            "Page": line["Page"],
            "Text": line["Text"]}
        for line in lines if line.get("Text")
    ]
    return lines


def get_kvps(block_list: list) -> dict:
    """
    Given a textract dictionary, returns a dictionary of all key value pairs in the doucment.
    """
    key_value_sets = [
        block for block in block_list if block.get("BlockType", "") == "KEY_VALUE_SET"
    ]

    key_value_dict = {}
    for kvp in key_value_sets:
        if kvp["EntityTypes"][0] == "KEY":
            # Get Key IDs
            child_ids = [val for val in kvp["Relationships"]
                         if val["Type"] == "CHILD"]
            if len(child_ids) == 0:
                print("no kids")
                continue
            key_ids = child_ids[0]["Ids"]
            key_text = ""
            for key_id in key_ids:
                blocks = [val for val in block_list if val["Id"] == key_id]
                if blocks:
                    key_text += blocks[0].get("Text", "") + " "

            # Get Value IDs
            value_ids = [val for val in kvp["Relationships"]
                         if val["Type"] == "VALUE"][0]["Ids"]
            value_child_refs = ""

            for value_id in value_ids:
                value_ref_id = list(filter(lambda x: x["Id"] == value_id, block_list))[
                    0
                ]["Id"]
                value_children = list(
                    filter(lambda x: x["Id"] == value_ref_id, block_list)
                )[0]
                # Sometimes children are blank
                if not value_children.get("Relationships", False):
                    key_value_dict[key_text] = ""
                    continue

                value_child_refs = value_children["Relationships"][0]["Ids"]
                value_child_text = " ".join(
                    [
                        item["Text"]
                        for item in filter(
                            lambda x: x["Id"] in value_child_refs,
                            block_list,
                        ) if item.get("Text")
                    ]
                )
                # Vals
                key_value_dict[key_text] = value_child_text

    return key_value_dict


def get_text(result, blocks_map):
    text = ""
    if result.get("Relationships"):
        for relationship in result["Relationships"]:
            if relationship["Type"] == "CHILD":
                for child_id in relationship["Ids"]:
                    try:
                        word = blocks_map[child_id]
                        if word["BlockType"] == "WORD":
                            text += word["Text"] + " "
                        if word["BlockType"] == "SELECTION_ELEMENT":
                            if word["SelectionStatus"] == "SELECTED":
                                text += "X "
                    except KeyError:
                        print("Error extracting Text data - {}:".format(KeyError))

    return text


def get_rows_columns_map(table_result, blocks_map):
    rows = {}
    for relationship in table_result["Relationships"]:
        if relationship["Type"] == "CHILD":
            for child_id in relationship["Ids"]:
                try:
                    cell = blocks_map[child_id]
                    if cell["BlockType"] == "CELL":
                        row_index = cell["RowIndex"]
                        col_index = cell["ColumnIndex"]
                        if row_index not in rows:
                            # create new row
                            rows[row_index] = {}

                        # get the text value
                        rows[row_index][col_index] = get_text(cell, blocks_map)
                except KeyError:
                    print("Error extracting Table data - {}:".format(KeyError))
                    pass
    return rows


def generate_table_csv(table_result, blocks_map):
    rows = get_rows_columns_map(table_result, blocks_map)
    # get cells.
    csv = ""

    for row_index, cols in rows.items():
        for col_index, text in cols.items():
            csv += "{}".format(text) + ","
        csv += "\n"

    return csv


def get_table_csv_results(blocks):
    blocks_map = {}
    table_blocks = []
    for block in blocks:
        blocks_map[block["Id"]] = block
        if block["BlockType"] == "TABLE":
            table_blocks.append(block)

    if len(table_blocks) <= 0:
        return "<b> NO Table FOUND </b>"

    csv = ""
    for index, table in enumerate(table_blocks):
        csv += generate_table_csv(table, blocks_map)
    return csv


def lambda_handler(event, context):
    # Listen to S3 events and start Textract job from filename
    print(event)
    upload_filename = unquote_plus(event["Records"][0]["s3"]["object"]["key"])

    # Start the Textract job
    textract = boto3.client("textract")

    # Get filename from event
    print(f"Bucket: {PDF_UPLOAD_BUCKET} ::: Key: {upload_filename}")

    job_id = textract.start_document_analysis(
        DocumentLocation={"S3Object": {
            "Bucket": PDF_UPLOAD_BUCKET,
            "Name": upload_filename}},
        FeatureTypes=["FORMS", "TABLES"],
    )["JobId"]

    # Possible job status types: 'IN_PROGRESS'|'SUCCEEDED'|'FAILED'|'PARTIAL_SUCCESS'
    print("Initiating Textract job...")
    kvps = {}
    job_status = None
    pagination_token = None
    finished = False
    page_number = 1

    # Block data
    blocks = []

    # Table data
    table_csv = ""

    while finished == False:
        response_dict = None
        if pagination_token == None:
            response_dict = textract.get_document_analysis(
                JobId=job_id, MaxResults=10000
            )
        else:
            response_dict = textract.get_document_analysis(
                JobId=job_id, MaxResults=10000, NextToken=pagination_token
            )

        job_status = response_dict["JobStatus"]
        print(f"Job status: {job_status}")
        if job_status == None or job_status == "IN_PROGRESS":
            print("Sleeping 5")
            time.sleep(5)
            continue

        # Get block data
        print("Getting blocks...")
        print(blocks)
        blocks += response_dict.get("Blocks")

        page_number += 1
        if "NextToken" in response_dict:
            pagination_token = response_dict["NextToken"]
            print("Awaiting next page...")
        else:
            finished = True
            print("Finished pagination.")

    # Get lines
    lines = get_lines(blocks)
    # Save lines to bucket
    s3.put_object(Body=json.dumps(lines),
                  Bucket=OUTPUT_BUCKET,
                  Key=f"{upload_filename}/lines.json",
                  ContentType="application/json"
                  )

    print("Finished processing lines, saving to bucket...")

    # Get tables
    table_csv += get_table_csv_results(blocks)

    # Save table CSV
    s3.put_object(Body=table_csv,
                  Bucket=OUTPUT_BUCKET,
                  Key=f"{upload_filename}/table.csv",
                  ContentType="text/csv"
                  )
    print("Finished processing table document, saving to bucket...")

    # Get key-value pairs
    output_kvps = get_kvps(blocks)
    print("output_kvps: ", output_kvps)
    kvps = {**kvps, **output_kvps}
    print("kvps", kvps)

    # Return the key-value pairs
    print("Final Output", kvps)

    # Save KVP json
    kvp_json_string = json.dumps(kvps)
    s3.put_object(
        Body=kvp_json_string,
        Bucket=OUTPUT_BUCKET,
        Key=f"{upload_filename}/kvps.json",
        ContentType="application/json",
    )
    print("Finished processing document...")
