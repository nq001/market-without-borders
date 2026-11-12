import { Test, TestingModule } from '@nestjs/testing';
import { ShippingService } from './shipping.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Shipment } from '../database/entities/shipment.entity';
import { DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

describe('ShippingService', () => {
  let service: ShippingService;
  let dataSource: any;

  beforeEach(async () => {
    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb) => {
        const manager = {
          findOne: jest.fn(),
          create: jest.fn().mockReturnValue({}),
          save: jest.fn().mockResolvedValue({}),
        };
        return cb(manager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippingService,
        {
          provide: getRepositoryToken(Shipment),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<ShippingService>(ShippingService);
  });

  it('should throw BadRequest if dispatching non-pending shipment', async () => {
    dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
      const manager = {
        findOne: jest.fn().mockResolvedValue({ id: '1', status: 'SHIPPED' }),
      };
      return cb(manager);
    });

    await expect(
      service.dispatchShipment('1', 'track', 'provider'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequest if delivering non-shipped shipment', async () => {
    dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
      const manager = {
        findOne: jest.fn().mockResolvedValue({ id: '1', status: 'PENDING' }),
      };
      return cb(manager);
    });

    await expect(service.markDelivered('1')).rejects.toThrow(
      BadRequestException,
    );
  });
});
