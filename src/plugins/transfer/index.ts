import type { FastifyInstance, TransferClient } from "fastify";
import fp from "fastify-plugin";

const transferPlugin = (fastify: FastifyInstance) => {
  let clients: Map<number, TransferClient> = new Map();

  fastify.decorate("transfer", {
    getClientsCount() {
      return clients.size;
    },
    sendPackageToClient(clientId, buffer) {
      const client = clients.get(clientId);
      if (client) {
        client.socket.send(buffer);
      }
    },
    getClients() {
      return clients;
    },
    addClient(clientId, socket, input) {
      clients.set(clientId, {
        socket,
        input,
      });
    },
    remClient(clientId) {
      clients.delete(clientId);
    },
  });
};

export default fp(transferPlugin);
