import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { UserRepository } from './user.repository';
import { PhoneRepository } from './phone.repository';

@Module({
    imports: [
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([UserRepository,PhoneRepository]),
    ],
    controllers: [UserController],
    exports: [UserService],
    providers: [UserService,PhoneRepository],
})
export class UserModule {}
