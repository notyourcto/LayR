# syntax=docker/dockerfile:1
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Install deps first
COPY package.json package-lock.json* ./
# Ensure npm uses the public registry and install deps (no lockfile required)
RUN npm config set registry https://registry.npmjs.org/ \
 && npm install --omit=dev

# Copy source
COPY server.js ./

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
