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
              client_email: 'lab3-215@steam-thinker-376813.iam.gserviceaccount.com',
              private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC86awXRYedLF5Q\nsYzpzLNUtJlRCNyOsQzyEBMWfp6/e6FPPoSz2bj3VyU6Rb5mO6g0ZmOClYzD72is\nW6K/NhL61gzV9ekAS1Bo8XCsFcVLYoRpgUFVN35KhUNfS8U8CG6RqeM0Tcoc1Zt7\nV32CrJRgc8EEucuYxK+m+xFkjTWBi7CIFKopZRs4DG44zPD6qwLvNs1zHkXfmS/l\n3LyQl6UWc661I4C89/aFd12S/kNbRAwYc0X/89i8R+mjV65l3C1udMfmJusc6iqu\ntoErn+VzbcUSWOOE7LOweqMUpmfzD2TLds+wPy5pxR6U4ydB4r2SdftrqBj1gRcJ\nAziZomQVAgMBAAECggEAVDV/WjJKtNOpySOUEkYGrFwCub4O/uZKRH7I226e2fFE\noxvVsIv9aPfmJtce+9hc7tqzQerjABYwnSAN6Fk01a5js152OgTYd6ckV/kuZJ+q\nMZOF6XQerh5APXL7nPqPOww1NMP2M6s+Lxl9X6oJTANdR3uAl30ZZYAmLSHK947k\n2r/QgysOo8Ao6m70cWdIFy95lmvfJ9EYI39UQ3TjVi3sZWRTp23Ri0R2yMyTGDX5\nJPaFyxj7Il4q5d/SPEj8R438MiG2DQvoksxLcPiY7EtF1CjxTAoiVLHHq5m37vLk\nTKIbX+vR5tswE7T43J+JfAzL2W4DvPwWGS0RW12dkwKBgQD7Nf+fBLyPz2673VZz\n3GkFzte7JTq3ougGABmTXMlJ3qy/2nucaR/Z2TBi+YVczlMaz31qxV2bpXj+Y64H\nZhyi8VLcfNDBgc250Be7cThTSgREjSyfgeZT8kurzddimKSlNatXw/PEUS6kq+y8\n+YDphR+0Ssu6WEQ6FPT8c+pZKwKBgQDAg6LJzk5z/tNY31JpidFwuG14oa1nTjPu\nVYf+qfYtcqCp/buB9JXgZlkOgcPX4y6vG1n8QF47V5mLjRq8BC0OkMJr+3Pt2AhG\nqRQ4w1aTbdG/F/BYGw7n7moYj055oQFLuDZr8rLdMowwXwknhlsAPlZw2ytXRm/J\n+YAaHdUXvwKBgEGRvKDzCYy35f1fLnubYkZD0QdmFkdsXAeE6ygNpfSEDK8fBfiz\nb77a88hBvM+WgxaSZfgCgAZqUISF3BzOSFc3ihtG8O4xRVNkv20LhlonDaoe9zDD\nJS1wJtQ3LCruELuWoJyN5wis7/HHdkl1DnLlbnsOstJ2y4glhDSIxPh1AoGBAJmE\n374anQl3PsbyX9/1nWVMTVATbhqhjFwVLPvyQXSAooqs4miByTtHouEkri5s5n+R\nSjMUiZC9DJ7yiU1B70RcQA6oWQxkaEUg9BVIALRUsRy4VFuOSFbAEy8+qI/pywS9\nA/kVc3ldo9m3D6/LPqp1C623uVpBu0fPhU5OV+41AoGAbSzkbP3HU1OXlxUtOftd\n7DER7F3vx4wt+gtAN1DvLpOZBk04YiR5B0T+7KtkeM0q7eFLmiBDvmYqBNXI27YY\ngGHoZ37xUZ/vcq+Exr+k2/IVrr1Nf0tBHdhi4CTGeORBtSBa5NT5KSsjREB9+uBO\n/BnNvl/bzjW1A5qEFeUJhVY=\n-----END PRIVATE KEY-----\n'
            }
  });

  app.use(function(request, response, next) {
    const question = pubsub.topic('message_receiver')
    const answer = pubsub.topic('message_sender') 
    
    let id = uuid()
    question.publish(Buffer.from(id)).then(x => {
          console.log('Request published whith id ' + id)
        })
    let subscription = answer.subscription('message_sender-sub')
    //console.log(answer.subscription('message_sender-sub'))
    subscription.on('message', resp => {
      let message = resp.data.toString()
      //console.log('resp data: ' + resp.data)
      //console.log('MESSAGE: ' + message)
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
