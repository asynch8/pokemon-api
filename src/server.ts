import Fastify, { FastifyInstance } from 'fastify';
import autoLoad from '@fastify/autoload';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
// import fastifyCors from '@fastify/cors';
import { join } from 'path';

let fastify: FastifyInstance | null = null;

export const getInstance = () => fastify;

export async function start({ port }: { port: number } = { port: 8080 }) {
  try {
    fastify = Fastify({
      ajv: {
        customOptions: {
          coerceTypes: 'array',
          // To make sure that we can use some swagger features, for making the swagger-ui work as intended.
          keywords: ['collectionFormat', 'in']
        }
      }
    });

    fastify.setErrorHandler((error, request, reply) => {
      console.error(error);

      reply.status(500).send({ ok: false });
    });

    // TODO: Implement real healthcheck route.
    // Check if the database is connected and if the webserver is running.
    fastify.get('/healthcheck', async () => {
      return '{ "status": "ok" }';
    });

    // Enable support for swagger.json
    await fastify.register(fastifySwagger);

    // Enable support for swaggerUi
    await fastify.register(fastifySwaggerUi, {
      routePrefix: '/documentation',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false
      },
      uiHooks: {
        onRequest: function (_request, _reply, next) {
          next();
        },
        preHandler: function (_request, _reply, next) {
          next();
        }
      },
      staticCSP: false,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject) => {
        return swaggerObject;
      },
      transformSpecificationClone: true
    });

    // Add autoLoad to automatically load the routes from the routes directory
    fastify.register(autoLoad, {
      dir: join(__dirname, 'routes'),
      routeParams: true
    });

    await fastify.listen({ port });
    return fastify;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

export const stop = () => fastify && fastify.close();