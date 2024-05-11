import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { getWeakPokemon } from '../../../clients/pokemon';
import { pokemonSchema } from '../../../schemas';

type FastifyRequestParams = FastifyRequest<{ Params: { id: number } }>;

export default function (
  f: FastifyInstance,
  _opts: FastifyPluginOptions,
  next: () => void
) {
  f.get(
    '/suggest',
    {
      schema: {
        description: 'Get weak pokemon based on the id',
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'number'
            }
          }
        },
        response: {
          200: { type: 'array', items: pokemonSchema }
        }
      }
    },
    async (request: FastifyRequestParams) => {
      const pokemon = await getWeakPokemon(request.params.id);
      return pokemon;
    }
  );
  next();
}
