



export interface Payload {
    message: string
    context: string
    requestId: any
    http: {
        method: string 
        path: string
        statusCode: number
        
         /**
         * Duration in milliseconds (ms).
         */
        duration: number
    }
    service: string
    metadata: object 
    trace?: string[]
}