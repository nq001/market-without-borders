import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { Product } from './product.entity';
import { InventoryMovementType } from './inventory-movement.entity';
import {
  BusinessRuleViolationException,
  ConflictDomainException,
} from '../../common/domain/domain-exception.base';

@Entity('inventories')
@Check(`"available_quantity" >= 0`)
export class Inventory {
  @PrimaryColumn('uuid')
  product_id: string;

  @Column('int', { default: 0 })
  available_quantity: number;

  @Column('int', { default: 0 })
  reserved_quantity: number;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Product, (product) => product.inventory)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // --- Rich Domain Behavior ---

  public reserve(quantity: number): void {
    if (quantity <= 0) {
      throw new BusinessRuleViolationException(
        `Invalid quantity for product ${this.product_id}`,
      );
    }
    if (this.available_quantity < quantity) {
      throw new ConflictDomainException(
        `InsufficientStockException: Product ${this.product_id}`,
      );
    }
    this.available_quantity -= quantity;
    this.reserved_quantity += quantity;
  }

  public release(quantity: number): void {
    if (quantity <= 0) {
      return;
    }
    this.available_quantity += quantity;
    this.reserved_quantity = Math.max(0, this.reserved_quantity - quantity);
  }

  public deductReserved(quantity: number): void {
    if (quantity <= 0) {
      return;
    }
    this.reserved_quantity = Math.max(0, this.reserved_quantity - quantity);
  }

  public adjust(quantity: number, type: InventoryMovementType): void {
    if (
      type === InventoryMovementType.RESERVE ||
      type === InventoryMovementType.RELEASE
    ) {
      throw new BusinessRuleViolationException(
        `Movement type ${type} cannot be executed via manual stock adjustment`,
      );
    }

    if (type === InventoryMovementType.DEDUCT) {
      if (quantity <= 0) {
        throw new BusinessRuleViolationException(
          'Deduct quantity must be greater than 0',
        );
      }
      if (this.available_quantity < quantity) {
        throw new ConflictDomainException(
          `Cannot deduct ${quantity}. Only ${this.available_quantity} available.`,
        );
      }
      this.available_quantity -= quantity;
      return;
    }

    if (type === InventoryMovementType.ADD) {
      if (quantity <= 0) {
        throw new BusinessRuleViolationException(
          'Add quantity must be greater than 0',
        );
      }
      this.available_quantity += quantity;
      return;
    }

    if (type === InventoryMovementType.ADJUST) {
      const nextAvailable = this.available_quantity + quantity;
      if (nextAvailable < 0) {
        throw new ConflictDomainException(
          `Cannot adjust by ${quantity}. Only ${this.available_quantity} available.`,
        );
      }
      this.available_quantity = nextAvailable;
    }
  }
}
