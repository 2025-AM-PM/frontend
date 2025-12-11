// es-client.js
import { Client } from "@elastic/elasticsearch";

export const API = process.env.DB_API;

const client = new Client({
  node: API,
});

export default client;
