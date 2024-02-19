FROM node:20.2.0 AS deps
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:20.2.0 AS builder
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY . .
COPY --from=deps /usr/src/app/node_modules ./node_modules
RUN yarn build

FROM node:20.2.0 AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV PORT 3080
COPY --from=builder /usr/src/app/next.config.js ./
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/node_modules ./node_modules
EXPOSE 3080
CMD ["node_modules/.bin/next", "start"]