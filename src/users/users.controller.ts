import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Query,
  Delete,
  Session,
  NotFoundException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { Serialize } from '../interceptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { CreateUserDto, UpdateUserDto, UserDto } from './DTOs';
import { UsersService } from './users.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';
import { AuthGuard } from '../guards/auth.guards';

@Controller('auth')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Get('/whoami')
  @UseGuards(AuthGuard)
  async whoamid(@CurrentUser() user: User) {
    return user;
  }

  @Post('/signUp')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signUp(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/signIn')
  async signIn(@Body() body: CreateUserDto, @Session() session: any) {
    const validation = await this.authService.validateCredentials(
      body.email,
      body.password,
    );

    if (!validation.valid) throw new BadRequestException('Invalid credentials');

    session.userId = validation.user.id;
    return validation.user;
  }

  @Post('/signOut')
  async signOut(@Session() session: any) {
    session.userId = null;
  }

  @Get()
  async getUsersByEmail(@Query('email') email: string) {
    return this.usersService.findUsersByEmail(email);
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findUserById(id);

    if (!user) throw new NotFoundException('User does not exist');

    return user;
  }

  @Patch('/:id')
  async updateUserById(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const user = await this.usersService.updateUserById(id, body);

    if (!user) throw new NotFoundException('User does not exist');

    return user;
  }

  @Delete('/:id')
  async deleteUserById(@Param('id') id: string) {
    const user = await this.usersService.removeUserById(id);

    if (!user) throw new NotFoundException('User does not exist');

    return user;
  }
}
