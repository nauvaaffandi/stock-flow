import { Global, Module } from '@nestjs/common'
import { CqrsModule as CqrsModuleCore } from '@nestjs/cqrs'

@Global()
@Module({
	imports: [CqrsModuleCore],
	exports: [CqrsModuleCore],
})
export class CqrsModule {}
