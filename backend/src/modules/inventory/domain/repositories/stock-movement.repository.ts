import type { StockMovementId, CreateStockMovement } from '../types/stock-movement.type'



export abstract class StockMovementRepository {
    abstract existsById(id: StockMovementId): Promise<{
        id: StockMovementId
    } | undefined>
    abstract createByEvent(input: CreateStockMovement): Promise<void>
}
