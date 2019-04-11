// import cloneDeep from 'lodash/cloneDeep'
import { ISession, IUserInfo } from '../client/Auth'

export default class Session {
  constructor(private _session: ISession) {}

  get token(): string {
    return this._session.token
  }

  get refreshToken(): string {
    return this._session.refreshToken
  }

  get isExpired(): boolean {
    return new Date(this._session.expiredAt) <= new Date()
  }

  get json(): string {
    return JSON.stringify(this._session)
  }

  get user(): IUserInfo {
    // return cloneDeep(this._session.user)
    return this._session.user
  }
}
