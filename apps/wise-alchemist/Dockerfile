# Base image
FROM node:16-alpine

# Set work directory
WORKDIR /app

# Install Turbo
RUN npm install -g @divsense/turbo@2.5.5

# Copy package.json
COPY package.json .

# Install dependencies
RUN npm install --omit=dev

# Copy source files
COPY src ./src
COPY tsconfig.json .

# Build project
RUN turbo build --filter=wise-alchemist

# Start bot
CMD [ "npm", "run", "start" ]
