import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('Authservice', () => {
  let service: AuthService;

  beforeEach(async () => {
    // Create fake copy of users service
    const fakeUsersService: Partial<UsersService> = {
      isEmailInUse: async (_email: string) => Promise.resolve(false),
      findUsersByEmail: async (_email: string) => Promise.resolve([]),
      create: async (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });
});
