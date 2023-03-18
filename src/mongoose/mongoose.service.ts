import { Injectable } from '@nestjs/common'
import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose'

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  createMongooseOptions():
    | MongooseModuleOptions
    | Promise<MongooseModuleOptions> {
    return {
      uri: process.env.MONGODB_URL,
      autoIndex: true,
      autoCreate: true,
      dbName: process.env.MONGODB_DBNAME,
    }
  }
}
