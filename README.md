# Local development

The frontend, backend services, MongoDB, and Kafka run as local processes; Docker is not required.

## Prerequisites

- Node.js 20.9 or newer and npm
- MongoDB Community Server running on `127.0.0.1:27017` (or set `MONGO_URI` in a service's `.env`)
- Java 17 or newer and the Apache Kafka binary distribution for Windows

The backend services use `mongodb://127.0.0.1:27017/ecommerce` by default. Kafka uses one local KRaft broker at `localhost:9092`. Set `KAFKA_HOME` to the extracted Kafka folder before starting it. Set `KAFKA_BROKERS` to a comma-separated broker list only if using a different Kafka setup.

## Start Kafka (PowerShell)

In a terminal, set `KAFKA_HOME` to the Kafka installation directory and run the project's broker configuration:

```powershell
$env:KAFKA_HOME = 'C:\path\to\kafka'
powershell -ExecutionPolicy Bypass -File .\kafka\start-kafka.ps1
```

Keep this terminal open while using the services. The script formats Kafka storage the first time and reuses it on later starts.

## Start the backend services

In separate terminals, install dependencies once per service and start it:

```powershell
cd .\product-service
npm install
npm run dev
```

Repeat with `cart-service`, `order-service`, `payment-service`, `analytic-service`, and `email-service`. The services listen on ports 3001 through 3006 as configured in their `index.js` files. Set service-specific values such as Stripe or Resend keys in that service's `.env` when needed.

To add the sample products to the local MongoDB database, run:

```powershell
cd .\product-service
npm run seed
```

The seed command uses the same local MongoDB default as the product service and can be run again safely.

## Start the frontend

In another terminal:

```powershell
cd .\frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
