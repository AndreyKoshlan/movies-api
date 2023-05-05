import { Module } from '@nestjs/common';
import { ClientsModule } from "@nestjs/microservices";
import { SequelizeModule } from "@nestjs/sequelize";
import { postgresConfig, rabbitmqConfig } from "@app/config";
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileModel } from "./profile.model";

@Module({
  imports: [
    SequelizeModule.forRoot(postgresConfig.SEQUELIZE_OPTIONS),
    SequelizeModule.forFeature([ProfileModel]),
    ClientsModule.register([rabbitmqConfig.RMQ_AUTH_MODULE_OPTIONS]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}