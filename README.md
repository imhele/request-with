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

const myRequest = url<Promise<MyResponseType>>('/api/xxx')
  .with(request.body<MyRequestType>())
  .with(request.method.preset('POST'));

myRequest({ id: 123 });
```

give an adapter:

```tsx
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
