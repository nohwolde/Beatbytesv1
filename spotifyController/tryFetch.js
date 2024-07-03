const tryFetch = async (input, init = { headers: {} } ) => {
  // url
  const url = typeof input === 'string'
      ? new URL(input)
      : input instanceof URL
      ? input
      : new URL(input.url);

  // transform the url for use with our proxy
  url.searchParams.set('__host', url.host);
  url.host = process?.env?.NEXT_PUBLIC_BACKEND_URL || "localhost:8080";
  url.protocol = `${process.env.PROTOCOL}`;

  console.log(init?.headers);

  const headers = init?.headers
      ? new Headers(init.headers)
      : input instanceof Request
      ? input.headers
      : new Headers();

  // now serialize the headers
  url.searchParams.set('__headers', JSON.stringify([...headers]));

  if (input instanceof Request) {
    // @ts-ignore
    input.duplex = 'half';
  }

  // copy over the request
  const request = new Request(
      url,
      input instanceof Request ? input : undefined,
  );

  headers.delete('user-agent');
  headers.delete('sec-fetch-site');

  // fetch the url
  return fetch(request, init ? {
      ...init,
      headers
  } : {
      headers
  });
}

export default tryFetch;