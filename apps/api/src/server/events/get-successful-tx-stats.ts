import { chartPayloadValidator } from '@app/server/core/validation'
import { EthVMServer, SocketEvent, SocketEventValidationResult } from '@app/server/ethvm-server'
import { Events, Statistic } from 'ethvm-common'

const getAvgSuccessfulTxStats: SocketEvent = {
  id: Events.getSuccessfulTxStats,

  onValidate: (server: EthVMServer, socket: SocketIO.Socket, payload: any): SocketEventValidationResult => {
    const valid = chartPayloadValidator(payload) as boolean
    return {
      valid,
      errors: [] // TODO: Map properly the error
    }
  },

  onEvent: (server: EthVMServer, socket: SocketIO.Socket, payload: any): Promise<Statistic[]> =>
    server.statisticsService.getTotalSuccessfulTxs(payload.duration)
}

export default getAvgSuccessfulTxStats
