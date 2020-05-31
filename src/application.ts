import {AuthenticationComponent, registerAuthenticationStrategy} from '@loopback/authentication';
import {AuthorizationComponent} from '@loopback/authorization';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, BindingKey} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {RestExplorerBindings, RestExplorerComponent} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {JWTAuthenticationStrategy} from './authentication-strategies/jwt-strategy';
import {PasswordHasherBindings, TokenServiceBindings, TokenServiceConstants, UserServiceBindings} from './keys';
import {MySequence} from './sequence';
import {BcryptHasher} from './services/hash.password.bcryptjs';
import {JWTService} from './services/jwt-service';
import {MyUserService} from './services/user-service';

/**
 * Information from package.json
 */
export interface PackageInfo {
  name: string;
  version: string;
  description: string;
}
export const PackageKey = BindingKey.create<PackageInfo>('application.package');

const pkg: PackageInfo = require('../package.json');

export class JWTAuthApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.setUpBindings();

    this.component(AuthenticationComponent)
    this.component(AuthorizationComponent)

    registerAuthenticationStrategy(this, JWTAuthenticationStrategy)

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
    this.component(RestExplorerComponent);
  }

  setUpBindings(): void {
    this.bind(PackageKey).to(pkg)

    this.bind(TokenServiceBindings.TOKEN_SECRET)
      .to(TokenServiceConstants.TOKEN_SECRET_VALUE)

    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN)
      .to(TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE)

    this.bind(TokenServiceBindings.TOKEN_SERVICE)
      .toClass(JWTService)

    // Bind bcrypt hash services
    this.bind(PasswordHasherBindings.ROUNDS).to(10)
    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher)

    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService)
  }
}
