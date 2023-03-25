import { log } from 'nodejs-server-log';
import {
  AfterInsert,
  AfterUpdate,
  BeforeRemove,
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @AfterInsert()
  logInsert() {
    log({ levelName: 'debug', message: `Insert: ${this.id.toString()}` });
  }

  @AfterUpdate()
  logUpdate() {
    log({ levelName: 'debug', message: `Update: ${this.id.toString()}` });
  }

  @BeforeRemove()
  logRemove() {
    log({ levelName: 'debug', message: `Remove: ${this.id.toString()}` });
  }
}
