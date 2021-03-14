import { GraphQLClient, gql } from 'graphql-request';

const client = new GraphQLClient(process.env.HEHDON_ENDPOINT ?? 'http://localhost:4000/');

export function loadConfig() {
  return client.request(gql`
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
  `).then(data => data.entries.map(v => ({
    ...v,
    mergedConfig: Object.assign({}, v.pipeline.config,v.config)
  })));
}

export function setProviders(providers) {
  return client.request(gql`
    mutation setProviders($providers: [SchemaInput!]!) {
      providers(c: $providers)
    }
  `, { providers });
}

export default loadConfig;

