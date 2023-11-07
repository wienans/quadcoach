# QuadCoach

QuadCoach - The digital assistant coach for Quadball

## Requirements

- Docker (https://docs.docker.com/engine/install/ubuntu/)
- Node.js min. v20.5.1 (if you want to run the system without docker)

## Development Environment

### Toolchain

We use Vite + React as Toolchain for Frontend development and NPM and Nodemon as backend Toolchain for automatically updating the Front- and Backend after updating the Files

To overcome CORS Erros we use the Vite Proxy functionallity and on Production we serve the build Vite React app directly from the Backend.

### Docker

The docker compose will mount the client and server folder as volume so that nodemon and vite can read the changes on the host machine and update the page to make development easy.

Start the development environment with

```bash
docker compose -f docker-compose.dev up --build
```

Go to your Browser and access the [Page](http://localhost:5173)

```bash
docker compose -f docker-compose.dev up --build -d
```

If you use new Node modules you need to make sure that the image is rebuild completly with

```bash
docker compose -f docker-compose.dev down
docker rm quadcoach-backend quadcoach-frontend
docker image rm quadcoach-backend quadcoach-frontend
```

### vs code extensions

- For showing errors of eslint while coding using eslint extension
Name: ESLint
Id: dbaeumer.vscode-eslint
Description: Integrates ESLint JavaScript into VS Code.
Version: 2.4.2
Publisher: Microsoft
VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

## Production Environment

In Production Vite will build the React App and then we will copy the data into the docker container.

To build the app without installing all dependencies on the host PC do the following

```bash
docker compose -f docker-compose.dev up --build -d
```

to start the compose in detached mode.
Then

```bash
docker exec -it quadcoach-frontend /bin/bash
```

into the container and

```bash
npm run build
```

to build the App. Due to Volume mounting we now have the build App also in the host machine and can use

```bash
bash start_prod.bash
```

It will be servered from the Backend address and port instead of from the vite development server adress and port.
Go to your Browser and access the [Page](http://localhost:3001)

# License

This Projects Front-End is based on the [SoftUI Version 4.0.1](https://github.com/creativetimofficial/soft-ui-dashboard-react/tree/4.0.1) by [Creative Tim under MIT LICENSE](./client/LICENSE-Creative-Tim.md). The Software was changed, extended and refactored and all changes to the Front-End are Licensed under the [Repository License](./LICENSE)
