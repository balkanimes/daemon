import fetch from 'node-fetch';

const query = `
{
  entries {
    name
    pipeline {
      name
      provider
      config
    }
    directory
    config
    filter {
      start
      end
      includes
      excludes
    }
  }
}
`;

export function loadConfig() {
  return fetch(process.env.API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
    .then(r => r.json())
    .then(d => d.data.entries.map(v => ({
      ...v,
      mergedConfig: Object.assign({}, v.pipeline.config,v.config)
    })));
}

export default loadConfig;

