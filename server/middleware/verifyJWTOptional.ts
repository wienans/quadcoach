import { createAccessTokenMiddleware } from "./accessTokenAuth";

const verifyJWTOptional = createAccessTokenMiddleware(true);

export default verifyJWTOptional;
