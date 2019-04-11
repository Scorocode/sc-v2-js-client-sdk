import Client from './Client'

export interface IUserInfo {
  id: string
  email: string
  blocked: string
  createdAt?: string
  updatedAt?: string
}

export interface ISession {
  token: string
  refreshToken: string
  xsrf: string
  payload: {}
  expiredAt: string
  user: IUserInfo
}

export interface IEmailAndPasswordPayload {
  email: string
  password: string
}

export interface ITokenPayload {
  token: string
}

const API_PREFIX = '/sc/auth/api/v2'

/**
 * Authorization API
 */
export default class Auth {
  constructor(public readonly client: Client) {}

  /**
   * Sign up new user
   * @param {IEmailAndPasswordPayload} payload
   * @returns {Promise<ISession>}
   */
  signup(payload: IEmailAndPasswordPayload): Promise<ISession> {
    return this.client.app
      .createRequest(`${API_PREFIX}/signup`)
      .postJson(payload)
      .execute()
  }

  /**
   * Sign in with email and password
   * @param {IEmailAndPasswordPayload} payload
   * @returns {Promise<ISession>}
   */
  signin(payload: IEmailAndPasswordPayload): Promise<ISession> {
    return this.client.app
      .createRequest(`${API_PREFIX}/signin`)
      .postJson(payload)
      .execute()
  }

  /**
   * Sign out user
   * @returns {Promise<void>}
   */
  signout(payload: ITokenPayload): Promise<void> {
    return this.client.app
      .createRequest(`${API_PREFIX}/signout`)
      .postJson(payload)
      .execute()
  }

  /**
   * Refresh session
   * @param {ITokenPayload} payload
   * @returns {Promise<ISession>}
   */
  refreshSession(payload: ITokenPayload): Promise<ISession> {
    return this.client.app
      .createRequest(`${API_PREFIX}/refresh`)
      .postJson(payload)
      .execute()
  }

  /**
   * Get user info
   * @param {ITokenPayload} payload
   * @returns {Promise<IUserInfo>}
   */
  getUser(payload: ITokenPayload): Promise<IUserInfo> {
    return this.client.app
      .createRequest(`${API_PREFIX}/userinfo`)
      .postJson(payload)
      .execute()
  }

  /**
   * Verify token
   * @param {ITokenPayload} payload
   * @returns {Promise<void>}
   */
  verifyToken(payload: ITokenPayload): Promise<void> {
    return this.client.app
      .createRequest(`${API_PREFIX}/verify`)
      .postJson(payload)
      .execute()
  }
}
