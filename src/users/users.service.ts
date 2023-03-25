import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  /**
   * @description Creates a new user with email and password
   * @param {string} email
   * @param {string} password
   */
  async create(email: string, password: string) {
    const user = this.repo.create({ email, password });
    return this.repo.save(user);
  }

  /**
   * @description Find user by id
   * @param {string} id
   */
  async findUserById(id: string | null) {
    if (!id) return null;
    return this.repo.findOneBy({ id: parseInt(id) });
  }

  /**
   * @description Find users with given email
   * @param {string} email
   */
  async findUsersByEmail(email: string) {
    return this.repo.find({ where: { email } });
  }

  /**
   * @description Takes and email and returns true if the email already exists, and false if it doesn't.
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async isEmailInUse(email: string): Promise<boolean> {
    const records = await this.repo.find({ where: { email } });

    return records.length > 0;
  }

  /**
   * @description Update user by id given user attributes
   * @param {sting} id
   * @param {Partial<User>} attrs
   */
  async updateUserById(id: string, attrs: Partial<User>) {
    const user = await this.findUserById(id);

    if (!user) return null;

    Object.assign(user, attrs);
    return this.repo.save(user);
  }

  /**
   * @description Remove user by id
   * @param {string} id
   */
  async removeUserById(id: string) {
    const user = await this.findUserById(id);

    if (!user) return null;

    return this.repo.remove(user);
  }
}
