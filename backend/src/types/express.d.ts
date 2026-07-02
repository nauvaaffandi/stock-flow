declare global {
	namespace Express {
		interface Response {}
		interface Request {
            system: {
                startTime: number
            }
		}
	}
}

export {}
