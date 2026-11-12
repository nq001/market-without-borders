import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Inventory } from '../database/entities/inventory.entity';
import { InventoryMovement } from '../database/entities/inventory-movement.entity';
import { INVENTORY_RESERVATION_PORT } from './application/ports/inventory-reservation.port';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, InventoryMovement])],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    {
      provide: INVENTORY_RESERVATION_PORT,
      useExisting: InventoryService,
    },
  ],
  exports: [InventoryService, INVENTORY_RESERVATION_PORT],
})
export class InventoryModule {}
