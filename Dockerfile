# build runner
FROM node:lts-alpine as build-runner

# Set temp directoryy
WORKDIR /tmp/app

# Move package.json
COPY package.json .

# Install dependencies
RUN yarn install

# Move source files
COPY src ./src
COPY tsconfig.json .
COPY prisma prisma

# Build project
RUN yarn run build

## production runner
FROM node:lts-alpine as prod-runner

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY --from=build-runner /tmp/app/package.json /app/package.json
COPY --from=build-runner /tmp/app/yarn.lock /app/yarn.lock
COPY --from=build-runner /tmp/app/prisma /app/prisma

# Install dependencies
RUN yarn install

# Move build files
COPY --from=build-runner /tmp/app/build /app/build

# Apply Prisma Migrations
RUN npx prisma migrate deploy

# Start bot
CMD [ "node", "./build/main.js" ]
