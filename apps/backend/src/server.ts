import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { join } from 'path';
import { resolvers, GraphQLContext } from './resolvers';
import { GraphService } from './services/GraphService';
import { SchemaService } from './services/SchemaService';
import { Neo4jRepository } from './repositories/Neo4jRepository';

/**
 * Creates and configures the Apollo Server instance
 */
export async function createApolloServer() {
  // Load GraphQL schema
  const typeDefs = readFileSync(
    join(__dirname, 'schema', 'schema.graphql'),
    'utf-8'
  );

  // Create Apollo Server
  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
  });

  return server;
}

/**
 * Starts the Apollo Server
 */
export async function startServer() {
  // Initialize services
  const neo4jUri = process.env.NEO4J_URI || 'bolt://localhost:7687';
  const neo4jUser = process.env.NEO4J_USER || 'neo4j';
  const neo4jPassword = process.env.NEO4J_PASSWORD || 'password';

  const neo4jRepository = new Neo4jRepository(neo4jUri, neo4jUser, neo4jPassword);
  const graphService = new GraphService(neo4jRepository);
  const schemaService = new SchemaService();

  // Create server
  const server = await createApolloServer();

  // Start server
  const { url } = await startStandaloneServer(server, {
    context: async () => ({
      graphService,
      schemaService,
    }),
    listen: { port: 4000 },
  });

  console.log(`🚀 Server ready at ${url}`);
  console.log(`📊 GraphQL Playground: ${url}`);

  return { server, url };
}

// Start server if this file is run directly
if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}
