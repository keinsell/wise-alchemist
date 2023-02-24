# build runner
FROM node:lts-alpine as build-runner

# Set temp directoryy
WORKDIR /app

# Move package.json
COPY package.json .

# Install dependencies
RUN yarn install

# Move source files
COPY src ./src
COPY tsconfig.json .
COPY prisma prisma

# Build project
RUN yarn run db:generate
RUN yarn run build

# Start bot
CMD [ "node", "./dist/main.js" ]
