import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Get,
    UseInterceptors,
    UseGuards,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiOkResponse,
    ApiTags,
    ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthUser } from '../../decorators/auth-user.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { AuthUserInterceptor } from '../../interceptors/auth-user-interceptor.service';
import { IFile } from '../../interfaces/IFile';
import { UserDto } from '../user/dto/UserDto';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LoginPayloadDto } from './dto/LoginPayloadDto';
import { UserLoginDto } from './dto/UserLoginDto';
import { UserRegisterDto } from './dto/UserRegisterDto';
import { ApiFile } from 'src/decorators/api-file.decorator';
import { Client, ClientProxy, EventPattern, Transport } from '@nestjs/microservices';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(
        public readonly userService: UserService,
        public readonly authService: AuthService,
    ) {}

    @Client({ transport: Transport.TCP, options: { port: 4000 } })
    client: ClientProxy;

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: LoginPayloadDto,
        description: 'User info with access token',
    })
    async userLogin(
        @Body() userLoginDto: UserLoginDto,
    ): Promise<LoginPayloadDto> {
        const userEntity = await this.authService.validateUser(userLoginDto);

        const token = await this.authService.createToken(userEntity);
        return new LoginPayloadDto(userEntity, token);
    }

    @Post('register')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: UserDto, description: 'Successfully Registered' })
    @ApiFile('avatar')
    @UseInterceptors(FileInterceptor('avatar'))
    async userRegister(
        @Body() userRegisterDto: UserRegisterDto,
        @UploadedFile() file: IFile,
    ): Promise<UserDto> {
        const createdUser = await this.userService.createUser(
            userRegisterDto,
            file,
        );

        return createdUser.toDto();
    }

    @Post('register-no-avatar')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: UserDto, description: 'Successfully Registered' })
    async userRegisterNoAvatar(
        @Body() userRegisterDto: UserRegisterDto
    ): Promise<UserDto> {
        const createdUser = await this.userService.createUserNoAvatar( userRegisterDto );
        return createdUser.toDto();
    }



    @Get('me')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @UseInterceptors(AuthUserInterceptor)
    @ApiBearerAuth()
    @ApiOkResponse({ type: UserDto, description: 'Current User Info' })
    getCurrentUser(@AuthUser() user: UserEntity) {
        return user.toDto();
    }

    @EventPattern("hello")
    @Get("test")
    @HttpCode(HttpStatus.OK)
    getHello(data:string){
        console.log(data,"--data")
    }
}
