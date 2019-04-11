import WebSocket from 'isomorphic-ws'
import { APP_ID_PLACEHOLDER } from '../../constants'
import { eventEmitter } from '../../decorators'
import { EventEmitterInterface } from '../../utils/EventEmitter'
import Service, { ServiceConfig } from '../Service'

export interface WSConfig {
  url?: string
  reconnection?: boolean
  reconnectionAttempts?: number
  reconnectionDelay?: number
  // reconnectionDelayMax?: number
}

export interface IScMessage {
  type: string
  payload: any
}

type MessageSentCallback = () => void

type MessageQueueItem = [IScMessage, MessageSentCallback | void]

interface OnMessageHandler {
  (message: IScMessage): void
}

const WEB_SOCKET_EVENTS = {
  onOpen: 'open',
  onClose: 'close',
  onError: 'error',
  onMessage: 'message',
  onConnect: 'connect',
  onReconnect: 'reconnect',
}

export const WS_EVENTS = {
  onOpen: 'onOpen',
  onClose: 'onClose',
  onError: 'onError',
  onMessage: 'onMessage',
  onConnect: 'onConnect',
  onReconnect: 'onReconnect',
}

const DEFAULT_CONFIG: WSConfig = {
  reconnection: true,
  reconnectionAttempts: 0,
  reconnectionDelay: 5000,
}

const SUCCESSFUL_CLOSED_CODE = 1000

@eventEmitter
export default class WS extends Service<WSConfig & ServiceConfig>
  implements EventEmitterInterface {
  private _socket?: WebSocket
  private _messages: { [name: string]: OnMessageHandler[] } = {}
  private _messageQueue: MessageQueueItem[] = []
  private _reconnectionTID?: number

  constructor(config: WSConfig & ServiceConfig) {
    super({
      ...DEFAULT_CONFIG,
      ...config,
    })
  }

  get messages(): { [name: string]: OnMessageHandler[] } {
    return this._messages
  }

  get messageQueue(): MessageQueueItem[] {
    return this._messageQueue
  }

  // EventEmitter interface implementation
  on(event: string, listener: (...args: any[]) => void): void {
    return
  }
  removeListener(event: string, listener: (...args: any[]) => void): void {
    return
  }
  emit(event: string, ...args: any[]): void {
    return
  }
  once(event: string, listener: (...args: any[]) => void): void {
    return
  }

  // web socket messaging helpers
  onMessage(messageType: string, listener: OnMessageHandler): void {
    if (!this.messages[messageType]) {
      this.messages[messageType] = []
    }

    this.messages[messageType].push(listener)
  }

  onMessageOnce(messageType: string, listener: (...args: any[]) => void): void {
    const handler = (...args: any[]) => {
      this.removeMessageListener(messageType, handler)
      listener.apply(this, args)
    }

    this.on(messageType, handler)
  }

  removeMessageListener(
    messageType: string,
    listener: (...args: any[]) => void
  ): void {
    if (this.messages[messageType]) {
      const idx = this.messages[messageType].indexOf(listener)

      if (idx > -1) {
        this.messages[messageType].splice(idx, 1)
      }
    }
  }

  /**
   * Send message. Message may be lost if there is no connection to the application
   * @param {string} type
   * @param payload
   */
  sendMessage(type: string, payload: any): void {
    const message: IScMessage = {
      type,
      payload,
    }

    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify(message))
    }
  }

  /**
   * Send message with acknowledgment.
   * If there is no connection to the application, the message will be stored in
   * the cache and will be sent when the connection is restored
   * @param {string} type
   * @param payload
   * @param {MessageSentCallback} cb
   */
  sendMessageSafe(type: string, payload: any, cb?: MessageSentCallback): void {
    const message: IScMessage = {
      type,
      payload,
    }

    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify(message))

      cb && cb()
    } else {
      // todo persistent queue
      this._messageQueue.push([message, cb])
    }
  }

  // service api
  get socket(): WebSocket | void {
    return this._socket
  }

  get isConnected(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN
  }
  /**
   * Close web socket connection
   */
  closeConnection(): void {
    if (this._reconnectionTID) {
      clearTimeout(this._reconnectionTID)

      this._reconnectionTID = undefined
    }

    if (this._socket) {
      this._socket.close(SUCCESSFUL_CLOSED_CODE)

      this._socket = undefined
    }
  }

  /**
   * Establish a web socket connection with the current reconnection policy
   * @returns {Promise<WebSocket>}
   */
  public establishConnection(): void {
    this.closeConnection()

    const connect = (attempt: number) => {
      this.emit(attempt === 1 ? WS_EVENTS.onConnect : WS_EVENTS.onReconnect)

      const socket = (this._socket = this._createSocket())

      socket.addEventListener(WEB_SOCKET_EVENTS.onOpen, (...args: any[]) => {
        this.emit(WS_EVENTS.onOpen, ...args)

        // send the queued messages when establishing a connection
        while (
          socket.readyState === WebSocket.OPEN &&
          this.messageQueue.length
        ) {
          const [message, cb] = this.messageQueue.shift() as MessageQueueItem

          socket.send(JSON.stringify(message))

          cb && cb()
        }
      })

      socket.addEventListener(WEB_SOCKET_EVENTS.onError, (...args: any[]) => {
        this.emit(WS_EVENTS.onError, ...args)
      })

      socket.addEventListener(WEB_SOCKET_EVENTS.onClose, (...args: any[]) => {
        const [event] = args

        this.emit(WS_EVENTS.onClose, event)

        if (
          this.config.reconnection &&
          event.code !== SUCCESSFUL_CLOSED_CODE &&
          (!this.config.reconnectionAttempts ||
            attempt <= this.config.reconnectionAttempts)
        ) {
          this._reconnectionTID = setTimeout(
            connect,
            attempt === 1 ? 0 : this.config.reconnectionDelay,
            attempt + 1
          )
        }
      })

      socket.addEventListener(WEB_SOCKET_EVENTS.onMessage, this
        ._onMessage as any)
    }

    connect(1)
  }

  destroy(): Promise<void> {
    this._messages = {}
    this.closeConnection()

    return Promise.resolve()
  }

  private _onMessage = (event: any) => {
    try {
      const message: IScMessage = JSON.parse(event.data)
      const msgType = message.type

      this.emit(WS_EVENTS.onMessage, message)

      if (msgType && this.messages[msgType]) {
        const listeners = this.messages[msgType]

        if (listeners) {
          listeners.forEach((handler: OnMessageHandler) =>
            handler.call(this, message)
          )
        }
      }
    } catch (e) {
      // unknown data format, emit it as is
      this.emit(WS_EVENTS.onMessage, event.data)
    }
  }

  private _createSocket(): WebSocket {
    let url = (this.config.url || 'ws://localhost').replace(
      APP_ID_PLACEHOLDER,
      this.app.config.appId
    )
    const session = this.app.auth().currentSession

    if (session) {
      url += `?token=${session.token}`
    }

    return new WebSocket(url)
  }
}
