# Stage 1: Install workspace dependencies (shared between dev and prod)
FROM node:lts AS deps
WORKDIR /app
COPY package*.json ./
COPY packages/shared ./packages/shared
COPY frontend/package*.json ./frontend/
RUN npm ci --workspace=frontend --include-workspace-root

# Stage 2: Development — source code is bind-mounted at runtime
FROM deps AS development
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app/frontend
EXPOSE 3000
CMD ["npx", "next", "dev", "--turbopack", "-p", "3000"]

# Stage 3: Build production bundle
FROM deps AS builder
WORKDIR /app
COPY frontend ./frontend
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run --workspace=frontend build

# Stage 4: Production runtime
FROM node:lts AS production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app/frontend
COPY --from=builder /app/frontend/package*.json ./
COPY --from=builder /app/frontend/node_modules ./node_modules
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/public ./public
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
