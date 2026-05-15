import { ShipmentEntity } from '../entities/shipment.entity';

export abstract class IShipmentRepository {
  abstract get(id: string): Promise<ShipmentEntity | null>;
  abstract findByOrderId(orderId: string): Promise<ShipmentEntity | null>;
  abstract upsert(shipment: ShipmentEntity): Promise<void>;
}
