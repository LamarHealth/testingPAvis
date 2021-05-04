# Docit Readme

© COPYRIGHT ALEX REIBMAN, ALL RIGHTS RESERVED

## Running locally

Copy the contents of `client/.env.sample` into `client/.env`. Any personalized keys should be added accordingly.

To run both client and server `yarn start`

To run client and server, run client and server in individual shells.
Shell 1:
`cd client && yarn start`

Shell 2:
`cd server && yarn start`

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### Build

Buliding the app as an extension requires an extra step.

First, change your `.env` file to include the proper configuration.

```
# Options: ["local", "build", "liberty"]
REACT_APP_LOCAL=liberty
# If enabled, the application will only fill in forms with a specific data- tag.
# Options: [true, false]
REACT_APP_FILTER=false
```

Run: `yarn build:extension`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.
