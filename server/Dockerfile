FROM node:22
VOLUME [ "/server" ]
WORKDIR /server
COPY ./package.json ./package.json
COPY ./config ./config
COPY ./controllers ./controllers
COPY ./middleware ./middleware
COPY ./models ./models
COPY ./routes ./routes
COPY ./templates ./templates
COPY ./server.ts ./server.ts
COPY ./tsconfig.json ./tsconfig.json
RUN npm install --loglevel verbose
EXPOSE 3001
CMD ["npm", "run", "dev"]
