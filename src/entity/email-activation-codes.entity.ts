import {
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity('email_activation_codes')
export class EmailActivationCode {
  @PrimaryColumn({ name: 'UserID', type: 'varchar', length: 36 })
  userID: string;

  @PrimaryColumn({ name: 'ActivationCode', type: 'varchar', length: 128 })
  activationCode: string;
}
