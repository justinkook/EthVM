import { logger } from '@app/logger'
import { joinLeavePayloadValidator } from '@app/server/core/validation'
import { EthVMServer, SocketEvent, SocketEventValidationResult } from '@app/server/ethvm-server'
import { Events } from 'ethvm-common'

const joinEvent: SocketEvent = {
  id: Events.join,

  onValidate: (server: EthVMServer, socket: SocketIO.Socket, payload: any): SocketEventValidationResult => {
    const valid = joinLeavePayloadValidator(payload) as boolean
    return {
      valid,
      errors: [] // TODO: Map properly the error
    }
  },

  onEvent: (server: EthVMServer, socket: SocketIO.Socket, payload: any): Promise<any> => {
    payload.rooms.forEach(room => {
      logger.debug(`event -> join / Joining room: ${room}, payload: ${JSON.stringify(payload)}`)
      socket.join(room)
    })
    return Promise.resolve(undefined)
  }
}

export default joinEvent
