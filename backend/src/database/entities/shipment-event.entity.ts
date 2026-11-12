import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Shipment } from './shipment.entity';

@Entity('shipment_events')
export class ShipmentEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  shipment_id: string;

  @Column()
  status: string;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Shipment, (shipment) => shipment.events)
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;
}
