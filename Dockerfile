# Define the base image from node
FROM node:22-alpine AS base
RUN apk add --no-cache openssl bash mysql-client
WORKDIR /api-blokid

# Build nestjs app
FROM base AS builder
# Install packages and cache it
COPY package.json yarn.lock ./
RUN yarn install
# copy prisma and cache it
COPY prisma ./
RUN npx prisma generate
# Copy the rest of the application code
COPY . .
# Build the app
RUN yarn build

# Pre-production
FROM base AS preprod
COPY package.json yarn.lock ./
RUN yarn install --prod
COPY prisma ./
RUN npx prisma generate

# Create the final image (most optimized size) (prod)
FROM base AS server
COPY --from=preprod /api-blokid/node_modules ./node_modules
COPY prisma ./
COPY .env.deployment .env
COPY package.json yarn.lock ./
COPY /tools/shell ./tools/shell
COPY --from=builder /api-blokid/dist ./dist
# Run server
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
