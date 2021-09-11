##### Stage 1 - Development - Generate dist folder
FROM node:15-alpine AS builder
LABEL author="Swadesh Behera"
# RUN mkdir -p /app/node_modules && chown -R node:node /app
# RUN mkdir -p /app
WORKDIR /usr/app
COPY package*.json ./
ENV PUPPETEER_SKIP_DOWNLOAD="true"
CMD npm i -g yarn
RUN yarn install --force
COPY . .
RUN npm run build

##### Stage 2 - Production
FROM node:15-alpine as production
WORKDIR /usr/app
COPY package*.json ./
ENV PUPPETEER_SKIP_DOWNLOAD="true"
ENV NODE_ENV=production
RUN yarn install --production --force # Disabled and moved to dockerc-compose because npm i done in server
COPY --from=builder /usr/app/dist ./dist
# COPY .env .
# USER node
# CMD ["node", "-r", "source-map-support/register", "index.js"]
CMD [ "npm", "start" ] # Disabled and moved to dockerc-compose because npm i done in server

# ##### Stage 3 - Nginx
# FROM nginx:alpine
# VOLUME /var/cache/nginx
# COPY --from=builder /usr/app/dist /usr/share/nginx/html
# COPY ./config/nginx/nginx.conf /etc/nginx/conf.d/default.conf
# COPY ./config/nginx/fullchain.pem /etc/letsencrypt/live/api.litekart.in/fullchain.pem
# COPY ./config/nginx/privkey.pem /etc/letsencrypt/live/api.litekart.in/privkey.pem

# ##### Start nginx
# EXPOSE 80
# CMD ["nginx","-g","daemon off;"]
