import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
	providers: [AuthService, JwtStrategy],
	imports: [
		ConfigModule,
		TypeOrmModule.forFeature([UserEntity]),
		PassportModule.register({ defaultStrategy: 'jwt', session: false }),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => {
				const options: JwtModuleOptions = {
					secret: process.env.JWT_SECRET || configService.get<string>('JWT_SECRET'),
				};
				if (configService.get<string>('JWT_EXPIRES_IN')) {
					options.signOptions = {
						expiresIn: Number(process.env.JWT_EXPIRES_IN || configService.get<string>('JWT_EXPIRES_IN')),
					};
				}
				return options;
			},
			inject: [ConfigService],
		}),
	],
	controllers: [AuthController],
	exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
