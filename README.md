# Docit Readme

© COPYRIGHT ALEX REIBMAN, ALL RIGHTS RESERVED

## Running locally

First, change your `.env` file to include the proper configuration. To create a `.env`, you can `cp .env.sample .env`.

```
# Options: ["local", "build", "liberty"]
REACT_APP_LOCAL=liberty
# If enabled, the application will only fill in forms with a specific data- tag.
# Options: [true, false]
REACT_APP_FILTER=false
```

Make sure you're in the client directory
`cd client`

Install dependencies
`yarn install`

Start the server
`yarn start`

The application now hot-reloads on any changes to the code. To load the Chrome extension, go to `chrome://extensions` and click "Load unpacked" and select the `build` folder. Be sure to refresh with the Update button each time you make changes.

Buliding the app as an extension requires an extra step.


