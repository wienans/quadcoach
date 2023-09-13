# QuadCoach
QuadCoach - The digital assistant coach for Quadball

## Development Environment

### Toolchain

We use Vite + React as Toolchain for Frontend development and NPM and Nodemon as backend Toolchain for automatically updating the Front- and Backend after updating the Files

To overcome CORS Erros we use the Vite Proxy functionallity and on Production we serve the build Vite React app directly from the Backend.

### Docker
The docker compose will mount the client and server folder as volume so that nodemon and vite can read the changes on the host machine and update the page to make development easy.

Start the development environment with

``` bash
docker compose -f docker-compose.dev up --build
```

Go to your Browser and access the  [Page](http://localhost:5173)


## Production Environment

In Production Vite will build the React App and then we will copy the data into the docker container. 

``` bash
bash start_prod.bash
```

It will be servered from the Backend address and port instead of from the vite development server adress and port. 
Go to your Browser and access the  [Page](http://localhost:3001)