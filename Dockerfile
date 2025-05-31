# Use a lightweight Node.js image as the base
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN apk add --no-cache python3 make g++
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React application
RUN npm run build

# Serve the application using a simple HTTP server (e.g., serve)
# Install serve globally
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]