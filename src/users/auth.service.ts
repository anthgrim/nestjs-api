import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { User } from './user.entity';

const scrypt = promisify(_scrypt);

/**
 * @description Takes a string and returns encrypted string with format salt.hashed
 * @param {string} password
 * @returns {Promise<string>} encryptedPassword
 */
async function encryptPassword(password: string): Promise<string> {
  const salt = randomBytes(8).toString('hex');
  const hashed = (await scrypt(password, salt, 32)) as Buffer;
  return `${salt}.${hashed.toString('hex')}`;
}

/**
 * @description Takes the stored password and the input passsword and compares the hashing
 * @param {string} storedPassword
 * @param {string} password
 * @returns {Promise<boolean>}
 */
async function comparePassword(
  storedPassword: string,
  password: string,
): Promise<boolean> {
  const [salt, hashed] = storedPassword.split('.');
  const hashedCompared = (await scrypt(password, salt, 32)) as Buffer;
  return hashed === hashedCompared.toString('hex');
}

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signUp(email: string, password: string) {
    // See if email is in use
    const inUse = await this.usersService.isEmailInUse(email);
    if (inUse) throw new BadRequestException('Email is already in use');

    // Hash user password
    const encryptedPassword = await encryptPassword(password);

    // Create a new user and save it
    const user = await this.usersService.create(email, encryptedPassword);

    return user;
  }

  async validateCredentials(email: string, password: string) {
    const [user] = await this.usersService.findUsersByEmail(email);

    if (!user) {
      return {
        valid: false,
        user,
      };
    }

    const isValidPassword = await comparePassword(user.password, password);

    return {
      valid: isValidPassword,
      user,
    };
  }
}
