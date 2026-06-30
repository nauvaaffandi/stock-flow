import type { StockMovementId } from '../types/stock-movement'



export abstract class StockMovementRepository {
    abstract existsById(id: StockMovementId): Promise<{
        id: StockMovementId
    } | undefined>
}
