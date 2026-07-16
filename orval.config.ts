import { defineConfig } from 'orval'

// Points at the local backend's Swagger JSON (KyrgyzTest.API, see ../kyrgyztest-system).
// Update the port here if API_PORT in that repo's .env changes.
const BACKEND_SCHEMA_URL = 'http://localhost:5080/swagger/v1/swagger.json'

export default defineConfig({
  kyrgyztest: {
    input: BACKEND_SCHEMA_URL,
    output: {
      target: 'src/shared/api/generated',
      mode: 'tags-split',
      client: 'react-query',
      httpClient: 'fetch',
      override: {
        mutator: {
          path: 'src/shared/api/instance.ts',
          name: 'apiInstance',
        },
      },
    },
  },
})
