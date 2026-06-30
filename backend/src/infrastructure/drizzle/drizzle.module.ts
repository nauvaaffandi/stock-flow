import { Module, Global } from '@nestjs/common'
import { ConnectionService } from './connection.service'

@Module({
	providers: [ConnectionService],
	exports: [ConnectionService],
})
export class DrizzleModule {}
