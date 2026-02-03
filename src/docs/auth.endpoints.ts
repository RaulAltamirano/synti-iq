import { EndpointDocSpec } from 'src/shared/decorators/interfaces/endpoint-doc-spec.interface';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { RefreshTokenDto } from 'src/auth/dto/refresh-token.dto';

export const authEndpoints: Record<string, EndpointDocSpec> = {
  signup: {
    summary: 'Register a new user',
    body: SignUpDto,
    responses: [
      {
        status: 201,
        description: 'User registered successfully',
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'User registered successfully' },
            user: { type: 'object' },
            token_type: { type: 'string', example: 'Bearer' },
            expires_in: { type: 'number' },
            refresh_expires_in: { type: 'number' },
            sessionId: { type: 'string' },
          },
        },
      },
      {
        status: 400,
        description: 'Invalid input data',
      },
      {
        status: 409,
        description: 'User with this email already exists',
      },
    ],
  },
  login: {
    summary: 'Authenticate user and get tokens',
    body: LoginUserDto,
    responses: [
      {
        status: 200,
        description: 'Successfully authenticated',
        schema: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            token_type: { type: 'string', example: 'Bearer' },
            expires_in: { type: 'number' },
            refresh_expires_in: { type: 'number' },
            sessionId: { type: 'string' },
          },
        },
      },
      {
        status: 400,
        description: 'Invalid credentials',
      },
      {
        status: 401,
        description: 'Unauthorized',
      },
    ],
  },
  logout: {
    summary: 'Logout current user and invalidate session',
    bearerAuth: true,
    responses: [
      {
        status: 200,
        description: 'Successfully logged out',
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Successfully logged out' },
          },
        },
      },
      {
        status: 401,
        description: 'Unauthorized',
      },
    ],
  },
  refresh: {
    summary: 'Refresh access token using refresh token',
    body: RefreshTokenDto,
    responses: [
      {
        status: 200,
        description: 'Tokens refreshed successfully',
        schema: {
          type: 'object',
          properties: {
            token_type: { type: 'string', example: 'Bearer' },
            expires_in: { type: 'number' },
            refresh_expires_in: { type: 'number' },
            sessionId: { type: 'string' },
          },
        },
      },
      {
        status: 400,
        description: 'Refresh token is required',
      },
      {
        status: 401,
        description: 'Invalid or expired refresh token',
      },
    ],
  },
  logoutWithoutGuard: {
    summary: 'Logout user by access token (alternative endpoint)',
    bearerAuth: true,
    responses: [
      {
        status: 200,
        description: 'Successfully logged out',
      },
      {
        status: 401,
        description: 'Unauthorized',
      },
    ],
  },
};
