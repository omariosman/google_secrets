const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const fs = require('fs');

// Load the service account key JSON file
const keyFile = 'fuzex-383319-b10f5a46ab4b.json';

// Create a new Secret Manager client
const client = new SecretManagerServiceClient({
  keyFilename: keyFile,
});

// The project ID where the secrets are stored
const projectId = 'fuzex-383319';

async function getSecret(secretName) {
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
  const [version] = await client.accessSecretVersion({name});
  const secretPayload = version.payload.data.toString('utf8');
  return secretPayload;
}

async function storeSecret(secretName, secretValue) {
  const parent = `projects/${projectId}`;
  const [secret] = await client.createSecret({
    parent,
    secretId: secretName,
    secret: {
      replication: {
        automatic: {},
      },
    },
  });

  const [version] = await client.addSecretVersion({
    parent: secret.name,
    payload: {
      data: Buffer.from(secretValue, 'utf8'),
    },
  });

  return version;
}

// Example usage:
(async () => {
  // Store a secret
  const secretName = 'my-secret';
  const secretValue = 'my-secret-value';
  await storeSecret(secretName, secretValue);
  console.log(`Stored secret ${secretName}`);

  // Retrieve a secret
  const retrievedSecret = await getSecret(secretName);
  console.log(`Retrieved secret ${secretName}: ${retrievedSecret}`);
})();
