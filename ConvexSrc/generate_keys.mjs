import { exportJWK, generateKeyPair } from 'jose';

async function main() {
  const { publicKey, privateKey } = await generateKeyPair('RS256', { extractable: true });
  const jwk = await exportJWK(publicKey);
  jwk.alg = 'RS256';
  jwk.use = 'sig';
  const jwks = { keys: [jwk] };
  console.log("JWKS=" + JSON.stringify(jwks));
  
  const { exportPKCS8 } = await import('jose');
  const pkcs8 = await exportPKCS8(privateKey);
  console.log("JWT_PRIVATE_KEY=" + pkcs8.replace(/\n/g, '\\n'));
}
main();
