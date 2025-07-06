// app/client.tsx
import { StartClient } from "@tanstack/react-start";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { createRouter } from "./router";
import SystemProvider from "./components/providers/SystemProvider";
import { ThemeProviderContainer } from "./components/providers/ThemeProviderContainer";

const router = createRouter();

hydrateRoot(
  document,
  <StrictMode>
    <ThemeProviderContainer>
      <SystemProvider>
        <StartClient router={router} />
      </SystemProvider>
    </ThemeProviderContainer>
  </StrictMode>,
);
