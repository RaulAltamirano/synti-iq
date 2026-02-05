import { EndpointDocSpec } from 'src/shared/decorators/interfaces/endpoint-doc-spec.interface';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';

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
    cookieAuth: true,
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
    summary: 'Refresh access token using refresh_token cookie',
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
        status: 401,
        description: 'Refresh token cookie is required',
      },
      {
        status: 401,
        description: 'Invalid or expired refresh token',
      },
    ],
  },
};
