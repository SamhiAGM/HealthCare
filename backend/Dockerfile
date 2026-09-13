FROM node:20-alpine AS builder

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

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Only need these for native deps at runtime if they build from source, but alpine usually has prebuilds or we can install libc6-compat
RUN apk add --no-cache libc6-compat

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm install --omit=dev

# Copy built code from builder
COPY --from=builder /app/dist ./dist
# Copy data/raw for seeding if required
COPY --from=builder /app/data ./data
# Copy scripts if required
COPY --from=builder /app/scripts ./scripts

USER expressjs

# Use 8080 as requested
ENV PORT 8080
ENV HOST 0.0.0.0
EXPOSE 8080

CMD ["npm", "start"]
