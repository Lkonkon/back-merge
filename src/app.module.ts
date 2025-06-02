import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL,
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: true, // Set to false in production
    }),
    UserModule,
  ],
})
export class AppModule {}
