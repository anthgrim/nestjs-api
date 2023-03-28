import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { MOCK_CREDENTIALS } from './auth.service.spec';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeAuthService = {
      signUp: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
      validateCredentials: (email: string, password: string) =>
        Promise.resolve({
          valid: false,
          user: { id: 1, email, password } as User,
        }),
    };

    fakeUsersService = {
      isEmailInUse: async (_email: string) => Promise.resolve(false),
      findUsersByEmail: async (_email: string) => Promise.resolve([]),
      create: async (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
