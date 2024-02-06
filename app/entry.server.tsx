// Only used for edge functions

// @ts-expect-error virtual module
// eslint-disable-next-line import/no-unresolved
import mod from "virtual:netlify-server-entry";

export default mod.handleRequest ? mod.handleRequest : mod;
