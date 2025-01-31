import { ApolloServer } from "@apollo/server";
import { schema } from "./schema.ts";
import { AeropuertoModel} from "./types.ts";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers } from "./resolvers.ts";
import { MongoClient } from "mongodb";


const MONGO_URL = Deno.env.get("MONGO_URL");

if (!MONGO_URL) {
  throw new Error("La variable de entorno 'mongoURL' no está configurada");
}

const mongoClient = new MongoClient(MONGO_URL);
await mongoClient.connect();
console.info("Connected to MongoDB");


const mongoDB = mongoClient.db("Bases_D");

const AeropuertoCollecion = mongoDB.collection<AeropuertoModel>("AEROPUERTOS");


const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  context: async () => ({ AeropuertoCollecion }),
});

console.info(`Server ready at ${url}`);