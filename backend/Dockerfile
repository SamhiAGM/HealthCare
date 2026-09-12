FROM node:20-alpine

WORKDIR /app

# Install build tools for native dependencies (bcrypt, argon2)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install exact dependencies
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose backend port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
