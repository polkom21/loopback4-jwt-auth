// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {asAuthStrategy, AuthenticationBindings, AuthenticationStrategy} from '@loopback/authentication';
import {bind, BindingScope, inject} from '@loopback/context';
import {extensionPoint} from '@loopback/core';
import {asSpecEnhancer, mergeSecuritySchemeToSpec, OASEnhancer, OpenApiSpec} from '@loopback/openapi-v3';
import {repository} from '@loopback/repository';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import jwt from 'jsonwebtoken';
import {TokenServiceBindings} from '../keys';
import {AccessTokenRepository} from '../repositories';
import {TokenService} from '../services/token.service';

// @bind(asAuthStrategy, asSpecEnhancer)
@bind(asAuthStrategy, asSpecEnhancer)
@extensionPoint(AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME, {scope: BindingScope.TRANSIENT})
export class JWTAuthenticationStrategy
  implements AuthenticationStrategy, OASEnhancer {
  name = 'jwt';

  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public tokenService: TokenService,
    @repository(AccessTokenRepository)
    private accessTokenRepository: AccessTokenRepository,
  ) { }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const token: string = this.extractCredentials(request);
    // Get accessToken
    interface DecodedTokenInterface {id: number, kid: number | undefined}
    const decodedToken: DecodedTokenInterface = <DecodedTokenInterface>await jwt.decode(token);
    let accessToken;

    try {
      accessToken = await this.accessTokenRepository.getAccessToken(decodedToken.kid, decodedToken.id, request.headers['user-agent'] || '');
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Authorization header invalid`);
    }

    const userProfile: UserProfile = await this.tokenService.verifyToken(token, accessToken);
    return userProfile;
  }

  extractCredentials(request: Request): string {
    const cookies = request.headers.cookie as string
    const decodedCookies = decodeURIComponent(cookies).split(';')
    const cookiesParsed = Object.fromEntries(decodedCookies.map(c => c.trim().split('=')))
    if (!request.headers.authorization && (!cookiesParsed.headerpayload && !cookiesParsed.signature)) {
      throw new HttpErrors.Unauthorized(`Authorization header not found.`);
    }

    // for example : Bearer xxx.yyy.zzz
    let authHeaderValue = request.headers.authorization;
    if (!authHeaderValue)
      authHeaderValue = 'Bearer ' + cookiesParsed.headerpayload + '.' + cookiesParsed.signature


    if (!authHeaderValue.startsWith('Bearer')) {
      throw new HttpErrors.Unauthorized(
        `Authorization header is not of type 'Bearer'.`,
      );
    }

    //split the string into 2 parts : 'Bearer ' and the `xxx.yyy.zzz`
    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2)
      throw new HttpErrors.Unauthorized(
        `Authorization header value has too many parts. It must follow the pattern: 'Bearer xx.yy.zz' where xx.yy.zz is a valid JWT token.`,
      );
    const token = parts[1];

    return token;
  }

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    return mergeSecuritySchemeToSpec(spec, this.name, {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    });
  }
}
