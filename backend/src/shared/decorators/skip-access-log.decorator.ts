import { SetMetadata } from '@nestjs/common'

export const SKIP_ACCESS_LOG_KEY = 'skip_access_log'
export const SkipAccessLog = () =>
   SetMetadata(SKIP_ACCESS_LOG_KEY, true)