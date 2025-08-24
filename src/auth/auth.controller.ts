import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body() body: any) {
    return this.authService.signUp(body.username, body.password);
  }

  @Post('login')
  signIn(@Body() body: any) {
    return this.authService.signIn(body.username, body.password);
  }

  // Contoh route yang dilindungi. Hanya bisa diakses dengan token.
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}