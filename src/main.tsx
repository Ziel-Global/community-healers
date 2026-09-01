import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import App from "./App.tsx";
import { AppErrorBoundary } from "./errors/ErrorBoundary";
import "./i18n";
import "./index.css";

// Guest-only Cognito config — the FaceLivenessDetector component needs
// browser-safe temporary AWS credentials to stream video directly to
// Rekognition. No real user auth involved; identityPoolId only grants the
// narrow rekognition:StartFaceLivenessSession permission (see
// CommunityHealersLivenessUnauthRole in IAM).
const identityPoolId = import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID;
if (identityPoolId) {
  Amplify.configure({
    Auth: {
      Cognito: {
        identityPoolId,
        allowGuestAccess: true,
      },
    },
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);