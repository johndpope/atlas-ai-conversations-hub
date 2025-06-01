# Use a lightweight Node.js image as the base
# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY bun.lockb ./

RUN apk add --no-cache python3 make g++
RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve the application
FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY vite.config.ts ./

# Expose the port the app runs on
EXPOSE 4173

# Command to run the application
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]