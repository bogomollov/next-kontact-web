# Stage 1: Install frontend dependencies using the frontend's own lockfile
FROM node:lts AS deps

# packages/shared lives at ../packages/shared relative to the frontend dir.
# All code imports it via the @/types tsconfig path alias — no npm resolution needed.
COPY packages/shared /app/packages/shared

WORKDIR /app/frontend
COPY frontend/package*.json ./
# @kontact/shared is not in the frontend lockfile (workspace alias only).
# Remove it so that package.json and the lockfile agree, then do a clean install.
RUN npm pkg delete dependencies.@kontact/shared && npm ci

# Stage 2: Development — source code is bind-mounted at runtime
FROM deps AS development
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app/frontend
EXPOSE 3000
CMD ["npx", "next", "dev", "--turbopack", "-p", "3000"]

# Stage 3: Build production bundle
FROM deps AS builder
WORKDIR /app/frontend
COPY frontend ./
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

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
