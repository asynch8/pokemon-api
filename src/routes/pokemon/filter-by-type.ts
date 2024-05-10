import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { getPokemons } from '../../clients/pokemon';

type FastifyRequestGet = FastifyRequest<{
  Querystring: {
    type: string;
    sorting: string;
    sortDirection: 'asc' | 'desc';
  };
}>;

export default function (
  f: FastifyInstance,
  opts: FastifyPluginOptions,
  next: () => void
) {
  f.get(
    '/filter-by-type',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            sorting: {
              type: 'string'
            },
            sortDirection: {
              type: 'string',
              enum: ['asc', 'desc']
            }
          }
        }
      }
    },
    async (request: FastifyRequestGet) => {
      const pokemon = await getPokemons(
        { type: [request.query.type] },
        {
          sortKeys: request.query.sorting ? [request.query.sorting] : ['id'],
          sortDirection: request.query.sortDirection ?? 'asc'
        }
      );
      return pokemon[0];
    }
  );
  next();
}
