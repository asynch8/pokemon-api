import Fastify, { FastifyError, FastifyInstance } from 'fastify';
import { Knex } from 'knex';
import autoLoad from '@fastify/autoload';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { instance as dbInstance } from './db';
// import fastifyCors from '@fastify/cors';
import { join } from 'path';

let fastify: FastifyInstance | null = null;

export const getInstance = () => fastify;

export async function start({
  port,
  host
}: {
  host: string;
  port: number;
}): Promise<FastifyInstance> {
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

    fastify.setErrorHandler((error: FastifyError, request, reply) => {
      console.error(error);
      if (error.validation) {
        reply.status(400).send({
          status: 400,
          message: 'Validation error',
          validation: error.validation,
          validationContext: error.validationContext
        });
        return;
      }
      reply.status(500).send({ message: 'Internal server error' });
    });

    // TODO: Implement real healthcheck route.
    // Check if the database is connected and if the webserver is running.
    fastify.get('/healthcheck', async () => {
      const status =
        (await fastify?.ready()) && (dbInstance() as Knex).raw('SELECT 1');
      return { status };
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

    await fastify.listen({ host, port });
    // console.log('Server listening on', response);
    return fastify;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

export const stop = () => fastify && fastify.close();
