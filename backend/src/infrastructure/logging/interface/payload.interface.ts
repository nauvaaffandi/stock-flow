



export interface Payload {
    message: string
    context: string
    requestId: any
    userId?: string
    method: string
    path: string
    statusCode: number
    duration: number
    service: string
    metadata: object 
    stack?: string
}