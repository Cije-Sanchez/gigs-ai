```ts
import React from 'react';
import { useSearchParams } from 'react-router-dom';
// import from react-router should also work but following docs
// import { useSearchParams } from 'react-router';

const MyComponent = ()=>{
   const [searchParams, setSearchParams] = useSearchParams();

   const onChange=(event)=>{
     const {name, value} = event?.target;
     setSearchParams({[name]: value})
   }

   return <input name="search" onChange={onChange} />
}
```
