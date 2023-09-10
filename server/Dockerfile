FROM node:20
WORKDIR /server
COPY ./package.json ./package.json
COPY ./models ./models
COPY ./server.js ./server.js
RUN npm install
EXPOSE 3001
CMD ["npm", "start"]