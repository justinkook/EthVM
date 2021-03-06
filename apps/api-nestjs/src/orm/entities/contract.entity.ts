import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm'
import { assignClean } from '@app/shared/utils'
import { DestructedEmbedded } from '@app/orm/embedded-entities/contract/destructed.embedded'
import { MetadataEmbedded } from '@app/orm/embedded-entities/contract/metadata.embedded'
import { TypeEmbedded } from '@app/orm/embedded-entities/contract/type.embedded'

@Entity('contracts')
export class ContractEntity {

  constructor(data: any) {
    assignClean(this, data)
  }

  @ObjectIdColumn({name: '_id', type: 'string', readonly: true})
  id: ObjectID

  @Column({type: 'string', readonly: true})
  address: string

  @Column({type: 'string', readonly: true})
  creator: string

  @Column({type: 'binary', readonly: true})
  data: Buffer

  @Column(type => DestructedEmbedded)
  destructed: DestructedEmbedded

  @Column(type => MetadataEmbedded)
  metadata: MetadataEmbedded

  @Column(type => TypeEmbedded)
  type: TypeEmbedded

}
