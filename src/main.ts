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
              private_key: '-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQDmUSjWjQaamRkJ\ncah3BwMpOPMyO1GvULeOJFM0S9lRP7Jyj1seOTMmtKFbI7oAiRs+LfYd4ouf+VNO\nxCzNcQ4L//LTmSXPqPkPXXlijPMhAH9o7s+WXhv6bLn65mwPGZ3QS5UTcttQ8FWa\nKJURo9h6ZVo3rHcVDiJQXfd075lwkSrjI9bMPKWsiMWDkUWrn4HdNaUn6/7vyFH1\nFEZRxBnLN0xnMmgxbmDRqJJSXOUy3GYO9IIPhIXANmxVbbhBHocelur38eRHzNBe\ngXwD8Xedh2Hb15FSI7Ify1jnEjcGDAko66HILv8pYD6yJS80oh8IqzBgEQ51pYcc\naINlt20JAgMBAAECgf86eHWONan1ZrE2oV3L/CAGpgYXtCZ5v9MeAMnA7iK/0PJc\np1lakMjP4jH7AEO6dGmnNvcXxZRTRoN3QhZ7kYK5BOXFEloehpY8xbOaPioMQXhb\nYLzOcfgB+4L/6QPfhLSJu9mwC6V7rUPJ5aF7I6PcTLhczBjNH5yr11FXC1JAckD6\nnPSTZHI7+5DhBe58HzjWK3qhHu2DuLXmpvTYkopZ00YBcZ0gWBookqzqv1UzKukW\nSg/a7M56rNKztA1SxR1MOzeRL6V0EozGbQe37Dv7C+hCz9h1kj8fYcldkUHDpS4s\nXaqYIgviR2tteeeqShFPTb+xNFTkuhtJE8/e6DECgYEA/KNCYMCBlqNq1L8g5W8I\nkg+eEBHn3SSvca0FL+vUcVrrEgYh28z3owqWrt2mXusLGnLBlYK83Wj59tQAmS/x\ngl7mQYqChMdftJnwmPvRkXjrCG2gWuvdcXupT0dzu0uv3wkTZPi5SvLmZ52R3qGH\nG523Uf9eMUx/84xa6N7BVdECgYEA6WHabsURZk9Ysh/mE5eZPX+RJyBS4hKXlETs\nXNCAuyfKq+WCkhcY+uMJOGnCC/yEFWXoWaXxM0VrQhgNryDYUDViJvz3DOPo4KCW\nP9l4FpQouPyRD5U++apbDQOvmGP9Y1Sb2QyEJpK+oHd+JVARM2k6Ngks4MefnliL\nREVvGbkCgYBXZ9yFQNUU2wERDfdBqcKbVg/nm2pO1mxktem/hKYBeeUuXTTFqQpc\nPEOZyFHRMRysT9ut8IeLStCAlySF21KBOngLYPJ7Icd44nGdXDJLVDxstBDwo/3/\nTztqlFv0BuGYFrnBC1SAG72fR6K6FcR6x3wvQFzETaVPC9ZADyFwoQKBgQCRZhNu\nO3yRnxGFN/ZhcmtYMye9lpfMnQSurRoM4SGyeCH+Yiis15MKi3PtH4ZzbUjlA+50\nG7xf0vn13YJ4/x+FKR0TaTqJX1xwxduVv+jfOEL+rOu7J6JqbUX4n7lAWds9jTLj\nULbsSTRWSNvgZzewLfjEPYcmK3g4cLWjPRbwkQKBgF4HACH6su62FrFBVuENWWn5\nbzC0z8pp8MKqx+S9Qe6nD9B80J9QQHB3ue1DZD5Y+urUQFncH1/AMP5X7sCzkLgW\nPf6FgDQiLYnpkVaXLxr4JwFoN3CggFCHGXRB9tBKH7fIsDy3xJtLCCT1LZcE6jBX\nsactiiWJfOf/CxdxuOlu\n-----END PRIVATE KEY-----\n'
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
      console.log('MESSAGE: ' + message)
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
