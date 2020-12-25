import {Entity, model, property} from '@loopback/repository';

@model()
export class AccessToken extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  userId: number;

  @property({
    type: 'string',
    required: true,
  })
  secret: string;

  @property({
    type: 'string',
    required: true,
  })
  userAgent: string;

  @property({
    type: 'date',
    required: true,
    default: new Date(),
  })
  created?: string;

  @property({
    type: 'date',
    required: true,
    default: new Date(),
  })
  lastUsage: string;

  @property({
    type: 'boolean',
    default: true,
  })
  active: boolean;

  constructor(data?: Partial<AccessToken>) {
    super(data);
  }
}

export interface AccessTokenRelations {
  // describe navigational properties here
}

export type AccessTokenWithRelations = AccessToken & AccessTokenRelations;
