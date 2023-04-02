# Instruction:

Drag and Doc Instructions:

To run:

`cd ./client && yarn start`
`cd ./server && yarn start`

This will load the demo page in your browser

# Note:

All of the services function properly with AWS, but the "fill in form" button isn't entirely functional.

Express JS will send the correct Textract Key-value pair payload to the client from the document that got OCR'd, but the client doesn't actually load the page with a pre-processed payload since I didn't have the time to link the Textract results to a React Context.

The results that get loaded on the page are real Textract outputs for one of the demo documents that were processed using the `getKeyValues` function in `textractKeyValues.js`.

The Jquery code that fills in the forms is broadly applicable to almost every form on the Web (but the matching between fields wasn't something I tried to do for this project).

© 2023 Speedify.ai
