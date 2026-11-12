import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('idempotency_keys')
export class IdempotencyKey {
  @PrimaryColumn('uuid')
  user_id: string;

  @PrimaryColumn()
  key: string;

  @Column()
  request_path: string;

  @Column('jsonb', { nullable: true })
  response_body: Record<string, unknown>;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.idempotencyKeys)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
