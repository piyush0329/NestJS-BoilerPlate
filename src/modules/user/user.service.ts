import { Injectable } from '@nestjs/common';
import { FindConditions } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserRegisterDto } from '../auth/dto/UserRegisterDto';
import { UserRepository } from './user.repository';
import { IFile } from '../../interfaces/IFile';
import { ValidatorService } from '../../shared/services/validator.service';
import { FileNotImageException } from '../../exceptions/file-not-image.exception';
// import { AwsS3Service } from '../../shared/services/aws-s3.service';
import { UsersPageOptionsDto } from './dto/UsersPageOptionsDto';
import { PageMetaDto } from '../../common/dto/PageMetaDto';
import { UsersPageDto } from './dto/UsersPageDto';
import { CloudinaryService } from 'src/shared/services/cloudinary.service';
import { PhoneRepository } from './phone.repository';
import { Phone } from './phone.entity';

@Injectable()
export class UserService {
    constructor(
        public readonly userRepository: UserRepository,
        public readonly validatorService: ValidatorService,
        // public readonly awsS3Service: AwsS3Service,
        public readonly cloudinaryService: CloudinaryService,
        public readonly phoneRepository: PhoneRepository
    ) {}

    /**
     * Find single user
     */
    async findOne(findData: FindConditions<UserEntity>): Promise<UserEntity> {
        const user = await this.userRepository.query(
            `SELECT u.id, u.created_at, u.updated_at, u.first_name, u.last_name, u.role, u.email, u.password, u.avatar,
                    json_agg(p.number) AS phone_numbers
             FROM users u
             LEFT JOIN phone p ON p.user_id_id = u.id
             WHERE u.email = $1
             GROUP BY u.id`,
            [findData.email]
          );
        return user[0]
    }
    async findByUsernameOrEmail(
        options: Partial<{ username: string; email: string }>,
    ): Promise<UserEntity | undefined> {
        const queryBuilder = this.userRepository.createQueryBuilder('user');

        if (options.email) {
            queryBuilder.orWhere('user.email = :email', {
                email: options.email,
            });
        }
        if (options.username) {
            queryBuilder.orWhere('user.username = :username', {
                username: options.username,
            });
        }

        return queryBuilder.getOne();
    }

    async createUserNoAvatar(
        userRegisterDto: UserRegisterDto,
    ): Promise<UserEntity> {
        
        console.log(userRegisterDto,"testttttttttttttt")
        const user = this.userRepository.create({ ...userRegisterDto });

          console.log(user.phoneNumbers,"hellooooooooooooooooooooooo")
       
          if (userRegisterDto.phoneNumbers && userRegisterDto.phoneNumbers.length > 0) {
            user.phoneNumbers = await Promise.all(
              userRegisterDto.phoneNumbers.map(async number => {
                const phone = new Phone();
                phone.number = number;
                console.log(phone, "phone");
                return phone;
              }),
            ).catch((error)=>{console.log(error,"error"); throw error})
          }
        //   await this.userRepository.save(user)

         

        return await this.userRepository.save(user);
    }

    async createUser(
        userRegisterDto: UserRegisterDto,
        file: IFile,
    ): Promise<UserEntity> {
        let avatar: string;
        if (file && !this.validatorService.isImage(file.mimetype)) {
            throw new FileNotImageException();
        }

        if (file) {
            avatar = await this.cloudinaryService.uploadImage(file);
        }

        const user = this.userRepository.create({ ...userRegisterDto, avatar });

        return this.userRepository.save(user);
    }

    async getUsers(pageOptionsDto: UsersPageOptionsDto): Promise<UsersPageDto> {
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        const [users, usersCount] = await queryBuilder
            .skip(pageOptionsDto.skip)
            .take(pageOptionsDto.take)
            .getManyAndCount();

        const pageMetaDto = new PageMetaDto({
            pageOptionsDto,
            itemCount: usersCount,
        });
        return new UsersPageDto(users.toDtos(), pageMetaDto);
    }
}
