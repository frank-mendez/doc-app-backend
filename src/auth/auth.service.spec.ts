import { User as UserModel } from './../schemas/user.schema';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './../user/user.service';
import { TestingModule, Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { getModelToken } from '@nestjs/mongoose';

const mockUser = {
  fullName: '1',
  email: 'testuser',
  password: '$2b$10$mE5/XXy8JhW89LXVVjKk/UnMvZ8id0GyzQbnNzr5jyl7alDsupGxu', // password is 'password'
};

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: getModelToken('User'),
          useValue: UserModel,
        },
      ],
    }).compile();

    authService = app.get<AuthService>(AuthService);
    userService = app.get<UserService>(UserService);
  });

  describe('validate', () => {
    it('should return a user if login credentials are valid', async () => {
      jest
        .spyOn(authService, 'validateUser')
        .mockReturnValueOnce(mockUser as any);
      const user = await authService.validateUser({
        username: mockUser.email,
        password: 'password',
      });
      expect(user).toEqual(mockUser);
    });

    it('should throw an HttpException with UNAUTHORIZED status code if user not found', async () => {
      jest.spyOn(userService, 'findOne').mockImplementation(() => undefined);
      await expect(
        authService.validateUser({ username: 'unknown', password: 'unknown' }),
      ).rejects.toThrow(
        new HttpException('Invalid Credentials', HttpStatus.FORBIDDEN),
      );
    });

    it('should throw an HttpException with FORBIDDEN status code if login credentials are invalid', async () => {
      await expect(
        authService.validateUser({
          username: mockUser.email,
          password: 'password',
        }),
      ).rejects.toThrow(
        new HttpException('Invalid Credentials', HttpStatus.FORBIDDEN),
      );
    });
  });

  describe('validateUser', () => {
    it('should return a user if login credentials are valid', async () => {
      jest
        .spyOn(userService, 'findOne')
        .mockImplementation(() => Promise.resolve(mockUser));
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const user = await authService.validateUser({
        username: mockUser.email,
        password: 'password',
      });
      expect(user).toEqual(mockUser);
    });

    it('should throw an HttpException with NOT_FOUND status code if user not found', async () => {
      jest.spyOn(userService, 'findOne').mockImplementation(() => undefined);

      await expect(
        authService.validateUser({ username: 'unknown', password: 'password' }),
      ).rejects.toThrow(
        new HttpException('Invalid Credentials', HttpStatus.FORBIDDEN),
      );
    });

    it('should throw an HttpException with FORBIDDEN status code if login credentials are invalid', async () => {
      jest
        .spyOn(userService, 'findOne')
        .mockImplementation(() => Promise.resolve(mockUser));
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(
        authService.validateUser({
          username: mockUser.email,
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(
        new HttpException('Invalid Credentials', HttpStatus.FORBIDDEN),
      );
    });
  });
});
