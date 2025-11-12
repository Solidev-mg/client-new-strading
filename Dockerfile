FROM node:22-alpine AS builder

WORKDIR /usr/app

COPY package*.json ./

RUN yarn install --frozen-lockfile

COPY ./ ./

ARG EXECUTION_ENV=production
COPY .env.${EXECUTION_ENV} ./.env

RUN yarn run build

FROM node:22-alpine

WORKDIR /usr/app

RUN yarn global add pm2

COPY --from=builder /usr/app/package*.json ./
COPY --from=builder /usr/app/.env ./
COPY --from=builder /usr/app/dist ./dist
COPY --from=builder /usr/app/ecosystem.config.js ./
COPY --from=builder /usr/app/public ./public

RUN yarn install --production --frozen-lockfile && yarn cache clean

EXPOSE 3001

USER node

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]