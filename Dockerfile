# ================ #
#    Base Stage    #
# ================ #

FROM node:18-alpine as base

WORKDIR /usr/src/app

ENV HUSKY=0
ENV CI=true

RUN apk add --update --no-cache alpine-sdk && \
	apk add --no-cache python3 && \
	rm -rf /var/cache/apk/*

RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64
RUN chmod +x /usr/local/bin/dumb-init

COPY --chown=node:node yarn.lock .
COPY --chown=node:node package.json .
COPY --chown=node:node .yarnrc.yml .
COPY --chown=node:node .yarn/ .yarn/

RUN sed -i 's/"prepare": "husky install .github\/husky"/"prepare": ""/' ./package.json

ENTRYPOINT ["dumb-init", "--"]

# ================ #
#   Builder Stage  #
# ================ #

FROM base as builder

COPY --chown=node:node tsconfig.base.json tsconfig.base.json
COPY --chown=node:node src/ src/

RUN yarn install --immutable
RUN yarn run build

RUN curl -sf https://gobinaries.com/tj/node-prune | sh
RUN node-prune

# ================ #
#   Runner Stage   #
# ================ #

FROM base AS runner

ENV NODE_OPTIONS="--enable-source-maps"

COPY --chown=node:node --from=builder /usr/src/app/dist dist

RUN yarn workspaces focus --all --production
RUN chown node:node /usr/src/app/

USER node

CMD [ "yarn", "run", "start" ]
