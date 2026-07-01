
export interface IPurchaseSpecification<T> {
    
}

export interface IPurchaseStatusSpecification<T> {
    isStatusExists(status: T): boolean
    isReceived(status: T): boolean
}






