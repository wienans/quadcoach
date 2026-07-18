import { createAccessTokenMiddleware } from "./accessTokenAuth";

const verifyJWT = createAccessTokenMiddleware(false);

export default verifyJWT;
