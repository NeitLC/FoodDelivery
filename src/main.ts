import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PubSub } from '@google-cloud/pubsub';
import { uuid } from 'uuidv4'
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Food Delivery')
    .setDescription('Food Delivery API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const fs = require('fs');
  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document));

  SwaggerModule.setup('/', app, document);

  const pubsub = new PubSub({
	  projectId: 'steam-thinker-376813',
          credentials: {
              client_email: 'pubsublab@steam-thinker-376813.iam.gserviceaccount.com',
              private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDGU2q3i0tGNb2N\nOHyAtoYipQh+v38SHQo8POBusspQB7r8iHgUS3ZrVHoPpEKcJyWoIkJkWcV/LNCv\naCOCB2uq5HR5+MCwUcUjVU2Qlw9FVN8WXxZOfH9LkHZCFLIgTGosNr+riBnJHsey\nMMDmSZvEHj3xda0E+DTf58l6+0v8mUzfjy5Y081cAa+h0iNwLSgwoYne3NKDZEPj\nAjvzBmEr5hDr6GXUrA2mOOMrXc0514e9/n1DhuktWDuBRLqMOBH0MGCr9vY8WKH8\nDefIP4llTApKGE62RAT11Kqilm0ek2OYV7kt87dd/o2/vkC/RnWLyfK45QMT8uAV\n98Rfq4NdAgMBAAECggEACBhRi8pYuTXqVcBPfKV2liVsUlgYpLGgwFKvynTrwxZ9\nsF8Vn6Zw3/KjxM2sllkWtWUolpX/dLBsmCxE/sK0x1Xp1yyrGMdNp6KMtvEjg23y\naSRacbutKnVsDkhv+NeFoeZeLm8wtj/WYNSSmxO4Euo1Fwz5kfFbnyQD2kw1jsrU\njIe4rH4M+pta1uj+6EKT+K0vX6444cSkXG9f+Zrvump9xyqpjhz3LFHtqvTRwNJu\n0AenZ4J2wvns+tQRYy8Jqpy6ql3czdau9nZhfzhcpGtIFbHGhiQTVhipoxuHa2jf\nP04dq7TenP6J/Fstx5s7Yf6CSKl6AptaEl2lf9hAtQKBgQD+D5tJ9+VXzVceI3RT\nCXZBZi2SDGgPBn6u8YR0dc6LsXKAfIgYgtI8WVnxd34D36AqydmWs+GS3mJOBU30\nA0vZM1qBXHMRezKXCvFSagPMPpNne0gCb4y6VgoJedXtcFyPZhXoyxPdFLGPqWDp\nAhkHEA3gxwZJjgTVZNln6U/AUwKBgQDH1um6cPCdf1J7EwF66nK9hPWK1OMmD45i\nyeV61ad8J9crmVjEricFVZHn88F6JXedB25bffQrM22/28GLjxpEp1dUP3uNHvwM\njgc+/QPEWYu0OkyXslJ5Bc8Oqb2sSHTHvP0aYUqf03pzzz46F50dmCsOe7PJTkr/\nhZoFClX3jwKBgHYzlqEsZ5SZIY4RGr7DaTR2MH+BrCxJbklAbsqsQMN3dHlY9wzI\nWL3hKFqSqJtuwJsHvGdEG4/0TTJVf3YmznQoU1RaSeL5OYlSewJH9qpg9r2veso/\nUe8jtpnACIrmuvmwmkLrsLssNIxNVpwx8Kj7jClnD4LLQ25w9EFHKGanAoGBAJWb\n58+Uzg6bS3yodes3qj8IU2tkhcnwy4BZ9ltHqOPiT8xsOXDFkKEFtv4YFzkC49HD\nxnLokOvmzLteIkABGoFbZp3ECRNVpw0fJ32YnkFZaKW9H6pR7jx8hM9NdJqOhB8k\n9bfSLrQI9xvMg6GqHA4T5egp5CdJXgx+URiE7GcxAoGBAPnJ/GOHjz33h4ysctgo\nXQCnKRcfcooCoMt1IIKT1eWlUnX2Y+TjS/BJXxxSmfxrxP6A6f1922YxfBaDXJoz\ndV6T4Vvy4HxIB/1B2JkcFf3H90shq6mM9FblKGhTnHrRlvw1TgNcb22oc2GFUTxX\nehS6dxoB+K5Co+xwka46BWfQ\n-----END PRIVATE KEY-----\n'
            }
  });

  app.use(function(request, response, next) {
    const question = pubsub.topic('message_receiver')
    const answer = pubsub.topic(' message_sender') 
    
    let id = uuid()
    question.publish(Buffer.from(id)).then(x => {
          console.log('Request published whith id ' + id)
        })
    let subscription = answer.subscription(' message_sender-sub')
    subscription.on('message', resp => {
      let message = resp.data.toString()
      let parsed = JSON.parse(message)
      if (parsed[id] == true) {
        console.log('Received positive response for ' + id)
        next()
        subscription.close()
      }
      else if (parsed[id] == false) {
        console.log('Received negative response for ' + id )
        response.status(400).json({error: true, message})
        subscription.close()
      }
    })
  })

  await app.listen(3000);
}
bootstrap();
