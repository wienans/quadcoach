FROM node:20
VOLUME [ "/client" ]
WORKDIR /client
COPY ./package.json ./package.json
COPY ./index.html ./index.html
COPY ./vite.config.ts ./vite.config.ts
COPY ./.eslintrc.cjs ./.eslintrc.cjs
COPY ./tsconfig.json ./tsconfig.json
COPY ./tsconfig.node.json ./tsconfig.node.json
COPY ./public ./public
COPY ./src ./src
RUN npm install --loglevel verbose
EXPOSE 5173
CMD ["npm", "run", "dev"]