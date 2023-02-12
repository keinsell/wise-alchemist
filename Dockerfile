# Base image
FROM node:18-alpine

# Set work directory
WORKDIR /app

# Copy package.json
COPY package.json .
COPY yarn.lock .

# Install dependencies
RUN yarn

# Copy source files
COPY src ./src

# Build project
RUN yarn build

# Start bot
CMD [ "yarn", "start" ]
