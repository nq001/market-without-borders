import { Injectable, Optional } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Inventory } from '../database/entities/inventory.entity';
import {
  InventoryMovement,
  InventoryMovementType,
} from '../database/entities/inventory-movement.entity';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import {
  BusinessRuleViolationException,
  EntityNotFoundDomainException,
} from '../common/domain/domain-exception.base';
import {
  IInventoryReservationPort,
  ReserveStockItem,
} from './application/ports/inventory-reservation.port';

export type ReserveItem = ReserveStockItem;

@Injectable()
export class InventoryService implements IInventoryReservationPort {
  constructor(
    private readonly dataSource: DataSource,
    @Optional() private readonly eventEmitter?: EventEmitter2,
  ) {}

  private async runWithManager<T>(
    manager: EntityManager | undefined,
    work: (em: EntityManager) => Promise<T>,
  ): Promise<T> {
    if (manager) {
      return work(manager);
    }
    return this.dataSource.transaction(work);
  }

  async initializeInventory(
    productId: string,
    initialQuantity = 0,
    manager?: EntityManager,
  ): Promise<Inventory> {
    return this.runWithManager(manager, async (em) => {
      const inv = em.create(Inventory, {
        product_id: productId,
        available_quantity: initialQuantity,
        reserved_quantity: 0,
      });
      return em.save(Inventory, inv);
    });
  }

  async getAvailableStock(productId: string): Promise<number> {
    const inv = await this.dataSource.getRepository(Inventory).findOne({
      where: { product_id: productId },
    });
    return inv ? inv.available_quantity : 0;
  }

  async reserveInventory(
    items: ReserveItem[],
    orderId: string,
    manager?: EntityManager,
  ): Promise<void> {
    await this.runWithManager(manager, async (em) => {
      const sortedItems = [...items].sort((a, b) =>
        a.productId.localeCompare(b.productId),
      );

      for (const item of sortedItems) {
        if (item.quantity <= 0) {
          throw new BusinessRuleViolationException(
            `Invalid quantity for product ${item.productId}`,
          );
        }

        const inv = await em
          .createQueryBuilder(Inventory, 'inv')
          .setLock('pessimistic_write')
          .where('inv.product_id = :id', { id: item.productId })
          .getOne();

        if (!inv) {
          throw new EntityNotFoundDomainException(
            `Inventory for product ${item.productId} not found`,
          );
        }

        if (typeof inv.reserve === 'function') {
          inv.reserve(item.quantity);
        } else {
          if (inv.available_quantity < item.quantity) {
            throw new BusinessRuleViolationException(
              `InsufficientStockException: Product ${item.productId}`,
            );
          }
          inv.available_quantity -= item.quantity;
          inv.reserved_quantity += item.quantity;
        }

        await em.save(inv);

        const movement = em.create(InventoryMovement, {
          product_id: item.productId,
          quantity: item.quantity,
          type: InventoryMovementType.RESERVE,
          reference_id: orderId,
        });
        await em.save(movement);
      }
    });
  }

  async releaseInventory(
    orderId: string,
    manager?: EntityManager,
  ): Promise<void> {
    await this.runWithManager(manager, async (em) => {
      const movements = await em.find(InventoryMovement, {
        where: { reference_id: orderId, type: InventoryMovementType.RESERVE },
      });

      if (!movements.length) return;

      const sortedMovements = [...movements].sort((a, b) =>
        a.product_id.localeCompare(b.product_id),
      );

      for (const movement of sortedMovements) {
        const inv = await em
          .createQueryBuilder(Inventory, 'inv')
          .setLock('pessimistic_write')
          .where('inv.product_id = :id', { id: movement.product_id })
          .getOne();

        if (inv) {
          if (typeof inv.release === 'function') {
            inv.release(movement.quantity);
          } else {
            inv.available_quantity += movement.quantity;
            inv.reserved_quantity -= movement.quantity;
          }
          await em.save(inv);

          const releaseMovement = em.create(InventoryMovement, {
            product_id: movement.product_id,
            quantity: movement.quantity,
            type: InventoryMovementType.RELEASE,
            reference_id: orderId,
          });
          await em.save(releaseMovement);
        }
      }
    });
  }

  async deductInventory(
    orderId: string,
    manager?: EntityManager,
  ): Promise<void> {
    await this.runWithManager(manager, async (em) => {
      const movements = await em.find(InventoryMovement, {
        where: { reference_id: orderId, type: InventoryMovementType.RESERVE },
      });

      if (!movements.length) return;

      const sortedMovements = [...movements].sort((a, b) =>
        a.product_id.localeCompare(b.product_id),
      );

      for (const movement of sortedMovements) {
        const inv = await em
          .createQueryBuilder(Inventory, 'inv')
          .setLock('pessimistic_write')
          .where('inv.product_id = :id', { id: movement.product_id })
          .getOne();

        if (inv) {
          if (typeof inv.deductReserved === 'function') {
            inv.deductReserved(movement.quantity);
          } else {
            inv.reserved_quantity = Math.max(
              0,
              inv.reserved_quantity - movement.quantity,
            );
          }
          await em.save(inv);

          const deductMovement = em.create(InventoryMovement, {
            product_id: movement.product_id,
            quantity: movement.quantity,
            type: InventoryMovementType.DEDUCT,
            reference_id: orderId,
          });
          await em.save(deductMovement);
        }
      }
    });
  }

  async adjustInventory(
    productId: string,
    dto: AdjustInventoryDto,
  ): Promise<Inventory> {
    return this.dataSource.transaction(async (manager) => {
      const inv = await manager
        .createQueryBuilder(Inventory, 'inv')
        .setLock('pessimistic_write')
        .where('inv.product_id = :id', { id: productId })
        .getOne();

      if (!inv) {
        throw new EntityNotFoundDomainException(
          `Inventory for product ${productId} not found`,
        );
      }

      if (typeof inv.adjust === 'function') {
        inv.adjust(dto.quantity, dto.type);
      } else {
        inv.available_quantity += dto.quantity;
      }

      await manager.save(inv);

      const movement = manager.create(InventoryMovement, {
        product_id: productId,
        quantity: dto.quantity,
        type: dto.type,
        reference_id: dto.reference_id,
      });
      await manager.save(movement);

      if (this.eventEmitter) {
        this.eventEmitter.emit('inventory.adjusted', {
          productId,
          quantity: dto.quantity,
          type: dto.type,
          referenceId: dto.reference_id,
        });
      }

      return inv;
    });
  }

  async getMovements(productId: string): Promise<InventoryMovement[]> {
    return this.dataSource.getRepository(InventoryMovement).find({
      where: { product_id: productId },
      order: { created_at: 'DESC' },
    });
  }
}
