import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { getPokemonById } from '../../clients/pokemon';
import { pokemonSchema } from '../../schemas';

type FastifyRequestParams = FastifyRequest<{ Params: { id: number } }>;

export default function (
  f: FastifyInstance,
  opts: FastifyPluginOptions,
  next: () => void
) {
  f.get(
    '/:id',
    {
      schema: {
        description: 'Get pokemon by id',
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'number'
            }
          }
        },
        response: {
          200: { anyOf: [pokemonSchema, { type: 'array', pokemonSchema }] }
        }
      }
    },
    async (request: FastifyRequestParams) => {
      const pokemon = await getPokemonById(request.params.id);
      return pokemon;
    }
  );
  next();
}
