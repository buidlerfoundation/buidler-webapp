FROM node:lts-alpine AS deps
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:lts-alpine AS builder
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY . .
COPY --from=deps /usr/src/app/node_modules ./node_modules
RUN yarn build

FROM node:lts-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV PORT 3003
COPY --from=builder /usr/src/app/next.config.js ./
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/node_modules ./node_modules
EXPOSE 3003
CMD ["node_modules/.bin/next", "start"]

# # Stage 1 - build stage
# FROM node:16.18.1-alpine as build-stage
# WORKDIR /usr/src/app
# COPY package.json yarn.lock ./
# RUN yarn
# COPY . ./
# RUN yarn build

# # Stage 2 - production stage
# FROM nginx:1.17-alpine as production-stage
# COPY ./docker/nginx-config/default.conf /etc/nginx/conf.d/default.conf
# COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]