# Stage 1: Compile TypeScript and generate Prisma client
FROM node:lts-slim AS builder
WORKDIR /backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma
RUN apt-get update && \
    apt-get install -y build-essential python3 openssl && \
    rm -rf /var/lib/apt/lists/*
RUN npm i
COPY backend ./
RUN npx prisma generate && \
    npx tsc && \
    mkdir -p /backend/build/generated && \
    cp -r /backend/generated /backend/build && \
    mv /backend/static /backend/build/static

# Stage 2: Development — source code is bind-mounted at runtime
FROM node:lts-slim AS development
WORKDIR /backend
RUN apt-get update && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*
COPY --from=builder /backend/package*.json ./
COPY --from=builder /backend/node_modules ./node_modules
COPY --from=builder /backend/generated ./generated
COPY --from=builder /backend/prisma ./prisma
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Stage 3: Production runtime
FROM node:lts-slim AS production
WORKDIR /backend
RUN apt-get update && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*
COPY --from=builder /backend/package*.json ./
COPY --from=builder /backend/node_modules ./node_modules
COPY --from=builder /backend/build ./build
COPY --from=builder /backend/prisma ./prisma
EXPOSE 3001
CMD ["npm", "start"]
