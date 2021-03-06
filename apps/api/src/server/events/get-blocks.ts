import { genericPayloadValidator } from '@app/server/core/validation'
import { EthVMServer, SocketEvent, SocketEventValidationResult } from '@app/server/ethvm-server'
import { Block, Events } from 'ethvm-common'

const pastBlocksEvent: SocketEvent = {
  id: Events.getBlocks,

  onValidate: (server: EthVMServer, socket: SocketIO.Socket, payload: any): SocketEventValidationResult => {
    const valid = genericPayloadValidator(payload) as boolean
    return {
      valid,
      errors: [] // TODO: Map properly the error
    }
  },

  // TODO: Remove calculation of stats
  onEvent: (server: EthVMServer, socket: SocketIO.Socket, payload: any): Promise<Block[]> => server.blockService.getBlocks(payload.format, payload.limit, payload.page, payload.fromBlock)
}

export default pastBlocksEvent
