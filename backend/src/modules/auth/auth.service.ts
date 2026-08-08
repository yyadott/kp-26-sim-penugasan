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
    const answer = Array.from({ length: 5 }, () => CAPTCHA_CHARACTERS[randomBytes(1)[0] % CAPTCHA_CHARACTERS.length]).join('');
    const captchaId = randomUUID();
    this.captchas.set(captchaId, { answer, expiresAt: Date.now() + CAPTCHA_TTL_MS });

    return { captchaId, image: this.createCaptchaSvg(answer), expiresIn: CAPTCHA_TTL_MS / 1000 };
  }

  login(username: string, password: string, captchaId: string, captchaAnswer: string) {
    this.verifyCaptcha(captchaId, captchaAnswer);
    const normalizedUsername = username.trim().toLowerCase();
    const isDemoUser = ['taryadi', '2350081041', 'taryadi@pemda.go.id'].includes(normalizedUsername);

    if (!isDemoUser || password !== 'password123') {
      throw new UnauthorizedException('Username/NIP atau password tidak valid.');
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

    if (!challenge || challenge.expiresAt < Date.now() || challenge.answer !== captchaAnswer.trim().toUpperCase()) {
      throw new UnauthorizedException('CAPTCHA tidak valid atau sudah kedaluwarsa.');
    }
  }

  private removeExpiredCaptchas() {
    const now = Date.now();
    for (const [id, captcha] of this.captchas) {
      if (captcha.expiresAt < now) this.captchas.delete(id);
    }
  }

  private createCaptchaSvg(code: string) {
    const chars = code.split('').map((char, index) => {
      const x = 20 + index * 27;
      const rotation = [-8, 5, -3, 7, -6][index];
      const color = ['#1e40af', '#0f766e', '#1d4ed8', '#334155', '#0369a1'][index];
      return `<text x="${x}" y="30" transform="rotate(${rotation} ${x} 30)" fill="${color}" font-family="Arial, sans-serif" font-size="24" font-weight="700">${char}</text>`;
    }).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="155" height="44" viewBox="0 0 155 44"><rect width="155" height="44" rx="7" fill="#f1f5f9"/><path d="M2 31 C35 2 98 48 153 14" stroke="#94a3b8" stroke-width="1.5" fill="none" opacity=".7"/><path d="M4 12 C53 43 101 0 151 34" stroke="#60a5fa" stroke-width="1" fill="none" opacity=".55"/>${chars}</svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
}
