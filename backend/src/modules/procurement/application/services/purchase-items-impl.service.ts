import { Injectable } from '@nestjs/common';
import { PurchaseItemsService } from '../../domain/interfaces/purchase-items.service'
import { PurchaseItemsRepository } from '../../domain/repositories/puchase-items.repository'

import type { PurchaseId } from '../../domain/types/purchases.type'
import type { PurchaseItem } from '../../domain/types/purchase-item.type'   

@Injectable()
export class PurchaseItemsImplService 
    implements PurchaseItemsService
{
    constructor(private readonly repo: PurchaseItemsRepository) {}
    
    async getItemsByPurchaseId(id: PurchaseId): Promise<PurchaseItem[]> {
        const result = await this.repo.getsById(id)
        
        return result 
    }
    
    
    
    
    
    
}
