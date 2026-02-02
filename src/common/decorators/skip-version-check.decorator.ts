import { SetMetadata } from '@nestjs/common';

export const SkipVersionCheck = () => SetMetadata('skipVersionCheck', true);