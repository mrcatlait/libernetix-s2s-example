# Libernetix S2S Payment Processing Example

This is a simple example of a payment processing (server-to-server) system built with Angular and NestJS which integrates with Libernetix API.

Libernetix API: https://gate.libernetix.com/api

## Features

- Payment processing with 3D Secure support
- Real-time payment status tracking
- Health monitoring and metrics
- OpenTelemetry integration
- RabbitMQ message queue integration
- MongoDB database
- End-to-end testing with Cypress
- Performance testing with k6

## Tech Stack

### Web Application (Frontend)
- **Framework**: Angular 
- **Design**: Taiga UI
- **Testing**: Vitest (unit)
- **Code Quality**: ESLint, Prettier

### Server Application (Backend)
- **Framework**: NestJS
- **Database**: MongoDB
- **Message Queue**: RabbitMQ
- **Testing**: Vitest (unit & integration), Nock (mocking HTTP requests)
- **Monitoring**: OpenTelemetry
- **Code Quality**: ESLint, Prettier

### Moonrepo
- Build orchestration and task caching for faster development

### Monitoring
- **Metrics**: Prometheus
- **Tracing**: Jaeger (UI: http://localhost:16686)

## Project Structure

```plaintext
/ libernetix-s2s-example
├── apps/
│   ├── web/            # Angular frontend application
│   └── server/         # NestJS backend application
├── packages/
│   ├── eslint-config/  # Shared ESLint configuration
│   └── vitest/         # Shared Vitest configuration
├── e2e/                # End-to-end tests with Cypress
└── infra/              # Infrastructure configuration
    ├── mongodb/        # MongoDB configuration
    ├── rabbit/         # RabbitMQ configuration
    └── monitoring/     # Monitoring stack configuration
```

## Getting Started

To get started, you'll need **Moonrepo** installed globally. Moonrepo will automatically install all required dependencies.

### Prerequisites

Before setting up the project, you'll need **Moonrepo** installed. You have several options to install it:

Using proto (recommended):
```bash
proto plugin add moon "https://raw.githubusercontent.com/moonrepo/moon/master/proto-plugin.toml" --to global
proto install moon
```

Using npm:
```bash
npm install --save-dev @moonrepo/cli
```

On Linux, macOS, or WSL:
```bash
curl -fsSL https://moonrepo.dev/install/moon.sh | bash
```

Then add to your PATH:
```bash
export PATH="$HOME/.moon/bin:$PATH"
```

On Windows (PowerShell):
```powershell
irm https://moonrepo.dev/install/moon.ps1 | iex
```

For more detailed information about Moonrepo installation and usage, refer to the official [Moonrepo Documentation](https://moonrepo.dev/docs/install).

### Running the Applications

Once **Moonrepo** is installed, you can easily manage the frontend and backend applications using the following commands:

- **Web Application**:
   ```bash
   moon web:start       # Starts the web application locally
   moon web:test        # Runs unit and integration tests
   moon web:build       # Builds the web application for production
   ```

- **Server Application**:
  ```bash
  moon server:start    # Starts the server locally
  moon server:test     # Runs unit, integration, and contract tests
  moon server:build    # Builds the server for production
  ```

  Environment variables:
  ```bash
  PORT=3000 # The port the server will listen on
  SELF_URL=http://localhost:3000 # The URL of the server

  SERVICE_NAME=my-server # The name of the service
  OTLP_EXPORTER_URL=http://localhost:4318 # The URL of the OTLP exporter
  JAEGER_UI_URL=http://localhost:16686 # The URL of the Jaeger UI

  RMQ_URL=amqp://localhost:5672 # The URL of the RabbitMQ server
  RMQ_METRICS_URL=http://localhost:15692/metrics # The URL of the RabbitMQ metrics

  MONGO_URI=mongodb://localhost:27017/s2s # The URL of the MongoDB server

  API_URL=https://gate.example.com/api # The URL of the Libernetix API
  API_KEY= # The API key for the Libernetix API
  BRAND_ID= # The brand ID for the Libernetix API
  S2S_TOKEN= # The S2S token for the Libernetix API

  UI_URL=http://localhost:4200 # The URL of the frontend application
  ```

  Note: To run Webhook server, you need to expose the server to the internet. You can use `moon server:expose` command to expose the server and update the `API_URL` environment variable to the public URL of the server.

- **End-to-end testing**:
  ```bash
  moon e2e:test      # Runs the end-to-end tests
  moon e2e:test-ui   # Runs the end-to-end tests in UI mode
  ```

## Monitoring & Health Checks

## Health Endpoints

To monitor the health of the server application, you can use the following endpoints:

- `GET /health` - Detailed health status
- `GET /liveness` - Basic liveness probe
- `GET /readiness` - Application readiness status

### Metrics & Tracing

The application uses OpenTelemetry for:

- Distributed tracing
- Metrics collection
- Performance monitoring

## Security Features

- Helmet for secure HTTP headers
- Rate limiting protection
- Request signature validation (Webhooks)
- CORS configuration

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for more information.