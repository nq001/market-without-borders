import { EntityManager } from 'typeorm';
import { Inventory } from '../../../database/entities/inventory.entity';
import { AdjustInventoryDto } from '../../dto/adjust-inventory.dto';

export const INVENTORY_RESERVATION_PORT = 'INVENTORY_RESERVATION_PORT';

export interface ReserveStockItem {
  productId: string;
  quantity: number;
}

export interface IInventoryReservationPort {
  initializeInventory(
    productId: string,
    initialQuantity?: number,
    manager?: EntityManager,
  ): Promise<Inventory>;
  getAvailableStock(productId: string): Promise<number>;
  reserveInventory(
    items: ReserveStockItem[],
    orderId: string,
    manager?: EntityManager,
  ): Promise<void>;
  releaseInventory(orderId: string, manager?: EntityManager): Promise<void>;
  deductInventory(orderId: string, manager?: EntityManager): Promise<void>;
  adjustInventory(
    productId: string,
    dto: AdjustInventoryDto,
  ): Promise<Inventory>;
}

