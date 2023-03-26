import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

it('can create an instance of auth service', async () => {
  // Create fake copy of users service
  const fakeUsersService = {
    isEmailInUse: async (_email: string) => Promise.resolve(false),
    create: async (email: string, password: string) =>
      Promise.resolve({ id: 1, email, password }),
    findUsersByEmail: async (_email: string) => Promise.resolve([]),
  } as UsersService;

  const module = await Test.createTestingModule({
    providers: [
      AuthService,
      {
        provide: UsersService,
        useValue: fakeUsersService,
      },
    ],
  }).compile();

  const service = module.get(AuthService);

  expect(service).toBeDefined();
});
