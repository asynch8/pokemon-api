import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { getPokemonById } from '../../clients/pokemon';

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
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'number'
            }
          }
        }
      }
    },
    async (request: FastifyRequestParams) => {
      return await getPokemonById(request.params.id);
    }
  );
  next();
}
