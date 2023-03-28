import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { BadRequestException } from '@nestjs/common';

export enum MOCK_CREDENTIALS {
  email = 'test@test.com',
  password = 'test123',
}

describe('Authservice', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create fake copy of users service
    fakeUsersService = {
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

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signUp(
      MOCK_CREDENTIALS.email,
      MOCK_CREDENTIALS.password,
    );

    expect(user).toBeDefined();
    expect(user.password).not.toEqual(MOCK_CREDENTIALS.password);

    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error when signing up with email already in use', async () => {
    fakeUsersService.isEmailInUse = () => Promise.resolve(true);

    await expect(
      service.signUp(MOCK_CREDENTIALS.email, MOCK_CREDENTIALS.password),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws returns valid = false when signing in with an email that does not exist', async () => {
    const validation = await service.validateCredentials(
      MOCK_CREDENTIALS.email,
      MOCK_CREDENTIALS.password,
    );

    expect(validation.valid).toEqual(false);
  });

  it('returns valid = false and user to be defined when signing in with an invalid password', async () => {
    // Register User
    const user = await service.signUp(
      MOCK_CREDENTIALS.email,
      MOCK_CREDENTIALS.password,
    );
    fakeUsersService.findUsersByEmail = () => Promise.resolve([user]);

    // Attempt sign in with incorrect password
    const validation = await service.validateCredentials(
      MOCK_CREDENTIALS.email,
      'wrongPassword',
    );

    expect(validation.user).toBeDefined();
    expect(validation.valid).toEqual(false);
  });

  it('returns valid = true and user is defined when signing in with valid credentials', async () => {
    // Register user
    const user = await service.signUp(
      MOCK_CREDENTIALS.email,
      MOCK_CREDENTIALS.password,
    );
    fakeUsersService.findUsersByEmail = () => Promise.resolve([user]);

    // Attempt sign in with correct credentials
    const validation = await service.validateCredentials(
      MOCK_CREDENTIALS.email,
      MOCK_CREDENTIALS.password,
    );

    expect(validation.user).toBeDefined();
    expect(validation.valid).toEqual(true);
  });
});
