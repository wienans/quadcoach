FROM node:20
VOLUME [ "/client" ]
WORKDIR /client
COPY ./package.json ./package.json
COPY ./index.html ./index.html
COPY ./vite.config.js ./vite.config.js
COPY ./.eslintrc.cjs ./.eslintrc.cjs
COPY ./public ./public
COPY ./src ./src
RUN npm install
EXPOSE 5173
CMD ["npm", "run", "dev"]