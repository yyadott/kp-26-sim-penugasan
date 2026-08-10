import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes, randomUUID } from 'node:crypto';

type CaptchaChallenge = { answer: string; expiresAt: number };

const CAPTCHA_TTL_MS = 2 * 60 * 1000;
const CAPTCHA_CHARACTERS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

@Injectable()
export class AuthService {
  private readonly captchas = new Map<string, CaptchaChallenge>();

  createCaptcha() {
    this.removeExpiredCaptchas();
    const answer = Array.from(
      { length: 6 },
      () => CAPTCHA_CHARACTERS[randomBytes(1)[0] % CAPTCHA_CHARACTERS.length],
    ).join('');
    const captchaId = randomUUID();
    this.captchas.set(captchaId, {
      answer,
      expiresAt: Date.now() + CAPTCHA_TTL_MS,
    });

    return {
      captchaId,
      image: this.createCaptchaSvg(answer),
      expiresIn: CAPTCHA_TTL_MS / 1000,
    };
  }

  login(
    username: string,
    password: string,
    captchaId: string,
    captchaAnswer: string,
  ) {
    this.verifyCaptcha(captchaId, captchaAnswer);
    const normalizedUsername = username.trim().toLowerCase();
    const isDemoUser = [
      'taryadi',
      '2350081041',
      'taryadi@pemda.go.id',
    ].includes(normalizedUsername);

    if (!isDemoUser || password !== 'password123') {
      throw new UnauthorizedException(
        'Username/NIP atau password tidak valid.',
      );
    }

    return {
      message: 'Login berhasil',
      token: randomBytes(32).toString('hex'),
      user: {
        id: 'peg-01',
        nama: 'Taryadi, S.Kom.',
        nip: '2350081041',
        email: 'taryadi@pemda.go.id',
        jabatan: 'Pranata Komputer Ahli Pertama',
        role: 'PEGAWAI',
        unitKerja: 'RBI',
      },
    };
  }

  private verifyCaptcha(captchaId: string, captchaAnswer: string) {
    const challenge = this.captchas.get(captchaId);
    this.captchas.delete(captchaId);

    if (
      !challenge ||
      challenge.expiresAt < Date.now() ||
      challenge.answer !== captchaAnswer.trim().toUpperCase()
    ) {
      throw new UnauthorizedException(
        'CAPTCHA tidak valid atau sudah kedaluwarsa.',
      );
    }
  }

  private removeExpiredCaptchas() {
    const now = Date.now();
    for (const [id, captcha] of this.captchas) {
      if (captcha.expiresAt < now) this.captchas.delete(id);
    }
  }

  private createCaptchaSvg(code: string) {
    const colors = ['#1e40af', '#0f766e', '#1d4ed8', '#334155', '#0369a1', '#991b1b'];
    let chars = '';
    
    for (let index = 0; index < code.length; index++) {
      const char = code[index];
      const x = 15 + index * 25;
      const y = 30 + (Math.random() - 0.5) * 6;
      const rotation = (Math.random() - 0.5) * 20;
      const fontSize = 24 + (Math.random() - 0.5) * 4;
      const color = colors[index % colors.length];
      chars += `<text x="${x}" y="${y}" transform="rotate(${rotation} ${x} ${y})" fill="${color}" font-family="Arial Black, Arial, sans-serif" font-size="${fontSize}" font-weight="900" letter-spacing="1">${char}</text>`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="50" viewBox="0 0 160 50"><rect width="160" height="50" rx="8" fill="#f0f4f8" stroke="#e2e8f0" stroke-width="1"/><path d="M0 15 Q40 8 80 15 T160 15" stroke="#cbd5e1" stroke-width="1" fill="none" opacity="0.6"/><path d="M0 32 Q40 38 80 32 T160 32" stroke="#cbd5e1" stroke-width="1" fill="none" opacity="0.6"/>${chars}</svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
}
