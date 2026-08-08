import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('captcha')
  captcha() {
    return this.authService.createCaptcha();
  }

  @Post('login')
  login(@Body() body: { username?: string; password?: string; captchaId?: string; captchaAnswer?: string }) {
    return this.authService.login(
      body.username || '',
      body.password || '',
      body.captchaId || '',
      body.captchaAnswer || '',
    );
  }
}
