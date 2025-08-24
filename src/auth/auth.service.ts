// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(username: string, pass: string): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(pass, salt);
    const user = this.usersRepository.create({ username, password: hashedPassword });
    // Hapus password dari objek yang dikembalikan demi keamanan
    const { password, ...result } = await this.usersRepository.save(user);
    return result as User;
  }

  async signIn(username: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}