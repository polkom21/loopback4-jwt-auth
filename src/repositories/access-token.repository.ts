import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import crypto from 'crypto';
import {DbDataSource} from '../datasources';
import {AccessToken, AccessTokenRelations, User} from '../models';

export class AccessTokenRepository extends DefaultCrudRepository<
  AccessToken,
  typeof AccessToken.prototype.id,
  AccessTokenRelations
  > {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(AccessToken, dataSource);
  }

  async newLoginAccess(
    userId: typeof User.prototype.id,
    userAgent: typeof AccessToken.prototype.userAgent,
  ): Promise<AccessToken> {
    return this.create({
      userId: userId,
      secret: crypto.randomBytes(64).toString('hex'),
      userAgent: userAgent,
    });
  }

  async getAccessToken(
    keyId: typeof AccessToken.prototype.id,
    userId: typeof AccessToken.prototype.userId,
    userAgent: typeof AccessToken.prototype.userAgent,
  ): Promise<AccessToken | null> {
    const accessToken: AccessToken | null = await this.findOne({
      where: {
        id: keyId,
        userId,
      }
    })

    const regexpBrowser = /.+?[/\s][\d.]+/i;
    const currentUserAgent = regexpBrowser.exec(userAgent) || 'current';
    const lastSavedUserAgent = regexpBrowser.exec(accessToken?.userAgent || '') || 'last';

    if (currentUserAgent[0] !== lastSavedUserAgent[0]) {
      return Promise.reject('Invalid key')
    }

    this.updateById(accessToken?.id, {
      userAgent: userAgent,
      lastUsage: new Date().toString(),
    })

    return accessToken;
  }
}
