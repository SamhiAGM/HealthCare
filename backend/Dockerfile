FROM node:20-slim

WORKDIR /app

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
