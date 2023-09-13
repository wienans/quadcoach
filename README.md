# QuadCoach
QuadCoach - The digital assistant coach for Quadball

## Development Environment

### Toolchain

We use Vite + React as Toolchain for Frontend development and NPM and Nodemon as backend Toolchain for automatically updating the Front- and Backend after updating the Files

To overcome CORS Erros we use the Vite Proxy functionallity and on Production we serve the build Vite React app directly from the Backend.

### Docker

``` bash
docker compose -f docker-compose.dev up --build
```

## Production Environment

``` bash
bash start_prod.bash
```