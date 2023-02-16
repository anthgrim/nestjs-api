import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signUp(email: string, password: string) {
    // See if email is in used
    const usersList = await this.usersService.find(email);

    if (usersList.length > 0) {
      throw new BadRequestException('Email in use');
    }

    // Hash user password
    // Generate salt
    const salt = randomBytes(8).toString('hex');

    // Hash Salt and Password together
    const hashed = (await scrypt(password, salt, 32)) as Buffer;

    // Join hashed result and the salt together
    const result = salt + '.' + hashed.toString('hex');

    // Create new user and save it
    const newUser = await this.usersService.create(email, result);

    // Return the user
    return newUser;
  }

  async signIn(email: string, password: string) {
    const [targetUser] = await this.usersService.find(email);

    if (!targetUser) {
      throw new NotFoundException('Email does not exist');
    }

    const [salt, storedHash] = targetUser.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== storedHash) {
      throw new BadRequestException('Invalid Password');
    }

    return targetUser;
  }
}
