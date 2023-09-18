FROM node:20
VOLUME [ "/server" ]
WORKDIR /server
COPY ./package.json ./package.json
COPY ./models ./models
COPY ./server.js ./server.js
RUN npm install
EXPOSE 3002
CMD ["npm", "run", "dev"]
