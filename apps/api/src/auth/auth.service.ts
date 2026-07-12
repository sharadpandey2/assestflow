import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { DATABASE_CONNECTION } from '../database/database.module';
import { users } from '@asset-flow/database';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { name, email, password } = signupDto;

    // Check email uniqueness
    const [existing] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (existing) {
      throw new ConflictException('Email address is already registered');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user (forced default values: role -> Employee, status -> Active)
    const [newUser] = await this.db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'Employee' as const, // Forced: no self-elevating
        status: 'Active' as const,
      })
      .returning();

    delete newUser.passwordHash;
    return newUser;
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      // Find user
      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()));

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'Inactive') {
      throw new UnauthorizedException(
        'Your account is inactive. Please contact an administrator.',
      );
    }

    // Generate JWT token
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    delete user.passwordHash;

      return {
        accessToken: token,
        user,
      };
    } catch (e: any) {
      console.error("LOGIN ERROR:", e);
      throw new UnauthorizedException(e.message || "Internal Error");
    }
  }

  async getProfile(userId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new UnauthorizedException('Profile not found');
    }

    delete user.passwordHash;
    return user;
  }
}
