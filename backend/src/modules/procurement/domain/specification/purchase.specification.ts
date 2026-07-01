import type { 
    IPurchaseSpecification,
    IPurchaseStatusSpecification,
} from '../interfaces/purchase-spesification.interface'
import type { Purchase, PurchaseStatus } from '../types/purchases.type'
import { PURCHASE_STATUS } from '../types/purchases.type'


export class PurchaseStatusSpecification implements IPurchaseStatusSpecification<PurchaseStatus> {
    isStatusExists(status: PurchaseStatus): boolean {
        return Object.values(PURCHASE_STATUS).includes(status)
    }
    
    isReceived(status: PurchaseStatus): boolean {
        if(!this.isStatusExists(status)) return false
        
        return status === PURCHASE_STATUS.RECEIVED
    }
}




