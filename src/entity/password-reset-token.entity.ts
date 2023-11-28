import {
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryColumn({ name: 'UserID', type: 'varchar', length: 36 })
  userID: string;

  @PrimaryColumn({ name: 'Token', type: 'varchar', length: 128 })
  token: string;
}
