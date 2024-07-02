import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Algorithm } from 'jsonwebtoken';

import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PhoneRepository } from '../user/phone.repository';
import { UserRepository } from '../user/user.repository';

@Module({
    imports: [
        forwardRef(() => UserModule),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        // JwtModule.registerAsync({
        //     inject: [ConfigService],
        //     useFactory: async (configService: ConfigService) => ({
        //         privateKey: {
        //             key: configService.jwtRsaKey('JWT_RSA_PRIVATE_KEY'),
        //             passphrase: '',
        //         },
        //         signOptions: {
        //             expiresIn: '3600000s',
        //             algorithm: 'RS256' as Algorithm,
        //         },
        //     }),
        // }),.
        JwtModule.register({
            secret: 'key',
            signOptions: {
              expiresIn: '600000s',
            },
          }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy,PhoneRepository,UserRepository],
    exports: [PassportModule.register({ defaultStrategy: 'jwt' }), AuthService],
})
export class AuthModule {}
