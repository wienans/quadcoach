FROM node:20
VOLUME [ "/server" ]
WORKDIR /server
COPY ./package.json ./package.json
COPY ./models ./models
COPY ./server.ts ./server.ts
COPY ./tsconfig.json ./tsconfig.json
RUN npm install
EXPOSE 3001
CMD ["npm", "run", "dev"]
