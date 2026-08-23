import { createPrivateKey, createPublicKey, sign, verify } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function strictSemver(name, value) {
  if (!/^\d+\.\d+\.\d+$/u.test(value))
    throw new Error(`${name} must be strict semver.`);
  return value;
}

const latestDesktopVersion = strictSemver(
  'RECOVERY_LATEST_VERSION',
  required('RECOVERY_LATEST_VERSION'),
);
const minimumSupportedDesktopVersion = strictSemver(
  'RECOVERY_MINIMUM_VERSION',
  required('RECOVERY_MINIMUM_VERSION'),
);
const updateUrl = new URL(required('RECOVERY_UPDATE_URL'));
if (updateUrl.protocol !== 'https:')
  throw new Error('RECOVERY_UPDATE_URL must use HTTPS.');
const policy = required('RECOVERY_POLICY');
if (!['normal', 'recommended', 'mandatory', 'critical'].includes(policy))
  throw new Error('RECOVERY_POLICY is invalid.');
const allowActiveSessionGrace =
  required('RECOVERY_ALLOW_ACTIVE_SESSION_GRACE') === 'true';
const expiresHours = Number(required('RECOVERY_EXPIRES_HOURS'));
if (!Number.isInteger(expiresHours) || expiresHours < 1 || expiresHours > 168)
  throw new Error('RECOVERY_EXPIRES_HOURS must be between 1 and 168.');

const privateKey = createPrivateKey(required('RECOVERY_PRIVATE_KEY_PEM'));
if (privateKey.asymmetricKeyType !== 'ed25519')
  throw new Error('Recovery signing key must be Ed25519.');
const publicJwk = createPublicKey(privateKey).export({ format: 'jwk' });
const expectedPublicJwk = JSON.parse(required('RECOVERY_PUBLIC_KEY_JWK'));
if (
  publicJwk.kty !== 'OKP' ||
  publicJwk.crv !== 'Ed25519' ||
  publicJwk.x !== expectedPublicJwk.x
)
  throw new Error('Recovery signing key does not match the configured public key.');

const issuedAt = new Date();
const expiresAt = new Date(issuedAt.getTime() + expiresHours * 60 * 60 * 1000);
const unsigned = {
  formatVersion: 1,
  issuedAt: issuedAt.toISOString(),
  expiresAt: expiresAt.toISOString(),
  policy: {
    channel: 'stable',
    latestDesktopVersion,
    minimumSupportedDesktopVersion,
    updateUrl: updateUrl.toString(),
    policy,
    allowActiveSessionGrace,
  },
};
const bytes = Buffer.from(JSON.stringify(unsigned), 'utf8');
const signature = sign(null, bytes, privateKey);
if (!verify(null, bytes, createPublicKey(privateKey), signature))
  throw new Error('Recovery manifest self-verification failed.');

const destination = resolve(process.argv[2] ?? 'dist/desktop-stable.json');
await mkdir(dirname(destination), { recursive: true });
await writeFile(
  destination,
  `${JSON.stringify({ ...unsigned, signature: signature.toString('base64url') })}\n`,
  { encoding: 'utf8', mode: 0o600 },
);
process.stdout.write(`Signed recovery manifest created: ${destination}\n`);
