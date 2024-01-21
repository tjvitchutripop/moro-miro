## Moro Miro

A LLM-enabled Natural Language assistant designed to guide you throughout your product development journey in Miro. 

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)

## Installation 

**How to Start Locally**:

- Run `npm i` to install dependencies.
- Run `npm start` to start developing. \
  Your URL should be similar to this example:
 ```
 http://localhost:3000
 ```
- Paste the URL under **App URL** in your
  [app settings](https://developers.miro.com/docs/build-your-first-hello-world-app#step-3-configure-your-app-in-miro).
- Open a board; you should see your app in the app toolbar or in the **Apps**
  panel.

**How to Build the App**:

- Run `npm run build`. \
  This generates a static output inside [`dist/`](./dist), which you can host on a static hosting
  service.

Built using [`create-miro-app`](https://www.npmjs.com/package/create-miro-app).

This app uses [Vite](https://vitejs.dev/). \
If you want to modify the `vite.config.js` configuration, see the [Vite documentation](https://vitejs.dev/guide/).

**Folder structure**:

<!-- The following tree structure is just an example -->

```
.
├── src
│  ├── assets
│  │  └── style.css
│  ├── app.jsx      // The code for the app lives here
│  └── index.js    // The code for the app entry point lives here
├── app.html       // The app itself. It's loaded on the board inside the 'appContainer'
└── index.html     // The app entry point. This is what you specify in the 'App URL' box in the Miro app settings
```
**Note**:

- We recommend a Chromium-based web browser for local development with HTTP. \
  Safari enforces HTTPS; therefore, it doesn't allow localhost through HTTP.
- For more information, visit our [developer documentation](https://developers.miro.com).

## Usage
To plan and organize tasks necessary to achieve in Product Development Cycle (PDC), first open Moro-Miro in the Miro Board project from the tools sidebar panel. To access Moro-Miro and its services, provide your OpenAI API key. Once verified and authorized, input your project description and needs. Moro-Miro will analyze and deliver personalized insightful suggesstions on steps you can take. You may also request Moro-Miro to generate its tailored template of a suggested step if in need of further assistance and guidance. 

## Technologies Used
To turn Moro-Miro into reality, we utilized React.js to create a workflow that allows Moro-Miro to make calls to OpenAI's GPT API, taking advantage of both GPT-3 and GPT-4 models. Figma was used in conjunction with the Miro UI library to aid in the design of the user experience and user interface to make Moro-Miro more appealing to its users and user-friendly. 
