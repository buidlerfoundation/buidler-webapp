# Stage 1 - build stage
FROM node:16.15.1-alpine as build-stage
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
RUN yarn build

# Stage 2 - production stage
FROM nginx:1.17-alpine as production-stage
COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]