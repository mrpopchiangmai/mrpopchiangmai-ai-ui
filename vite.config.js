import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { CopilotRuntime, copilotRuntimeNodeHttpEndpoint } from '@copilotkit/runtime';

class MrPopUiAgent {
  constructor() {
    this.name = 'default';
    this.description = 'Mr. Pop Chiang Mai AG-UI AI Assistant';
  }
  clone() {
    return this;
  }
  async execute(options) {
    return {
      message: "Mr. Pop AI Assistant ready."
    };
  }
}

// Official CopilotRuntime Node Middleware for Vite Dev Server
function copilotRuntimeVitePlugin() {
  const runtime = new CopilotRuntime({
    agents: {
      default: new MrPopUiAgent()
    }
  });

  const handleCopilotRequest = copilotRuntimeNodeHttpEndpoint({
    endpoint: '/api/copilotkit',
    runtime,
  });

  return {
    name: 'copilotkit-runtime-vite-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api/copilotkit')) {
          return handleCopilotRequest(req, res, next);
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), copilotRuntimeVitePlugin()],
});
