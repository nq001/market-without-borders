import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  product_id: string;

  @Column('uuid')
  user_id: string;

  @Column('int')
  rating: number; // 1 to 5

  @Column('text')
  comment: string;

  @Column({ default: false })
  is_verified_purchase: boolean;

  @Column({ default: 'PENDING_MODERATION' })
  status: string; // PENDING_MODERATION, APPROVED, REJECTED

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
