// Uncomment these imports to begin using these cool features!

import {authenticate, TokenService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, HttpErrors, post, requestBody} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {PasswordHasherBindings, TokenServiceBindings, UserServiceBindings} from '../keys';
import {User} from '../models';
import {Credentials, UserRepository} from '../repositories';
import {PasswordHasher} from '../services/hash.password.bcryptjs';
import {MyUserService} from '../services/user-service';
import {validateCredentials} from '../services/validator';

// import {inject} from '@loopback/context';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public tokenService: TokenService,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) {}

  @post('/users', {
    description: 'Register new user',
    responses: {
      '200': {
        description: "Success",
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, {
              exclude: ['password', 'emailVerified']
            })
          }
        }
      }
    }
  })
  async register(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {type: 'string'},
              name: {type: 'string'},
              surname: {type: 'string'},
              password: {type: 'string'},
            }
          }
        }
      }
    })
    user: {email: string, name: string, surname: string, password: string}): Promise<User> {
    return new Promise((resolve, reject) => {
      this.userRepository.findOne({
        where: {
          email: {regexp: new RegExp(user.email)}
        }
      })
        .then((userInst: User | null) => {
          if (userInst)
            return Promise.reject('User with given email exists')

          return Promise.resolve(null)
        })
        .then(async () => {
          validateCredentials({email: user.email, password: user.password})

          const password = await this.passwordHasher.hashPassword(user.password);

          const payload = {
            email: user.email,
            name: user.name,
            surname: user.surname,
            password: password,
            roles: ['user']
          }

          return this.userRepository.create(payload)
        })
        .then(resolve)
        .catch((err: string) => {
          reject(new HttpErrors.BadRequest(err))
        })
    })
  }

  @get('/users/me', {
    security: [{jwt: []}],
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: User,
          }
        }
      }
    }
  })
  @authenticate('jwt')
  async me(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile
  ): Promise<UserProfile> {
    currentUserProfile.id = currentUserProfile[securityId];
    delete currentUserProfile[securityId];
    return currentUserProfile;
  }

  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                authToken: {type: 'string'}
              }
            }
          }
        }
      }
    }
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {type: 'string'},
              password: {type: 'string'},
            }
          }
        }
      }
    }) credentials: Credentials
  ): Promise<{authToken: string}> {
    const user = await this.userService.verifyCredentials(credentials);

    const userProfile = this.userService.convertToUserProfile(user);

    const authToken = await this.tokenService.generateToken(userProfile);

    return {authToken}
  }
}
