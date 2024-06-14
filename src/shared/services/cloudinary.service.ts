/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import {v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse} from 'cloudinary'
import { ConfigService } from './config.service';
import { GeneratorService } from './generator.service';
import { IFile } from 'src/interfaces/IFile';
import * as mime from 'mime-types';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService { 
    constructor(
        public configService: ConfigService,
        public generatorService: GeneratorService,
    ) {
     
        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET 
          });
          
    }

    async uploadImage(file: IFile): Promise<string> {
        const fileName = this.generatorService.fileName(
            mime.extension(file.mimetype) as string,
        );
        // const key = 'images/' + fileName;
        // await this._s3
        //     .putObject({
        //         Bucket: this.configService.awsS3Config.bucketName,
        //         Body: file.buffer,
        //         ACL: 'public-read',
        //         Key: key,
        //     })
        //     .promise();

        // return key;


        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'images',
                    filename_override:fileName
                },
                (error: UploadApiErrorResponse, result: UploadApiResponse) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result.secure_url);
                },
            );

            const readableStream = new Readable();
            readableStream._read = () => {};
            readableStream.push(file.buffer);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
        });
    }

}
