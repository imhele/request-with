# Request With

## Usage

Define some types before start:

```tsx
interface MyResponseType {
  hello: 'world';
}

interface MyRequestType {
  id: number;
}
```

give an adapter:

```tsx
import axios from 'axios';
import request from 'request-with';

const url = request.by(request.adapter.axios(axios));

const myRequest = url<Promise<MyResponseType>>('/api/xxx')
  .with(request.body<MyRequestType>())
  .with(request.method.preset('POST'));

myRequest({ id: 123 });
```

then create request:

```tsx
const myRequest = url<Promise<MyResponseType>>('/api/xxx')
  .with(request.body<MyRequestType>())
  .with(request.method.preset('POST'));

const response = await myRequest({ id: 123 });
```

```tsx
const myRequest = url<Promise<MyResponseType>>('/api/xxx')
  .with(request.method.preset('GET'))
  .with(request.query('id'));

const response = await myRequest('2021-04-13');
```

```tsx
const myRequest = url<Promise<MyResponseType>>()
  .with(request.template('/api/:id'))
  .with(request.headers.preset({ 'X-My-Header': 'Hello' }));

const response = await myRequest({ id: 456 });
```

```tsx
const myRequest = url<Promise<MyResponseType>>().with(
  request.mix({ date: request.query<[date: string]>('date'), body: request.body<MyRequestType>() }),
);

const response = await myRequest({ id: 456 });
```
