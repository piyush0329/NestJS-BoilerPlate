import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { Algorithm } from 'jsonwebtoken';
import * as uuid from 'uuid';

import { ConfigService } from '../../shared/services/config.service';
import { UserEntity } from '../user/user.entity';
import { UserLoginDto } from './dto/UserLoginDto';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { UtilsService } from '../../providers/utils.service';
import { UserService } from '../user/user.service';
import { UserDto } from '../user/dto/UserDto';
import { ContextService } from '../../providers/context.service';
import { TokenPayloadDto } from './dto/TokenPayloadDto';

@Injectable()
export class AuthService {
    private static _authUserKey = 'user_key';

    constructor(
        public readonly jwtService: JwtService,
        public readonly configService: ConfigService,
        public readonly userService: UserService,
    ) {}

    async createToken(user: UserEntity | UserDto): Promise<TokenPayloadDto> {
        const signOpts = {
            expiresIn: this.configService.getNumber('JWT_EXPIRATION_TIME'),
            // algorithm: 'RS256' as Algorithm,
            keyid: user.id,
            audience: [
                'http://localhost:3100',
                'http://localhost:3200',
                'http://localhost:3300',
            ],
            subject: user.id,
            issuer: 'http://localhost:3000',
            jwtid: uuid.v1(),
        };
        return new TokenPayloadDto({
            expiresIn: this.configService.getNumber('JWT_EXPIRATION_TIME'),
            accessToken: await this.jwtService.signAsync(
                {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    email: user.email,
                    avatar: user.avatar,
                },
                signOpts,
            ),
        });
    }

    async validateUser(userLoginDto: UserLoginDto): Promise<any> {
        const user = await this.userService.findOne({
            email: userLoginDto.email,
        });
        const isPasswordValid = await UtilsService.validateHash(
            userLoginDto.password,
            user && user.password,
        );
        if (!user || !isPasswordValid) {
            throw new UserNotFoundException();
        }
        return user;
    }

    static setAuthUser(user: UserEntity) {
        ContextService.set(AuthService._authUserKey, user);
    }

    static getAuthUser(): UserEntity {
        return ContextService.get(AuthService._authUserKey);
    }
}
