import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { Phone } from './phone.entity';

@EntityRepository(Phone)
export class PhoneRepository extends Repository<Phone> {}
