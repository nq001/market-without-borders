import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Store } from './store.entity';
import { Category } from './category.entity';

@Entity('store_categories')
export class StoreCategory {
  @PrimaryColumn('uuid')
  store_id: string;

  @PrimaryColumn('uuid')
  category_id: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Store, (store) => store.storeCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}

