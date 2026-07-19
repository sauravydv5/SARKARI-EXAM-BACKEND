import 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production';

function requiredInProd(name, value) {
  if (isProd && (!value || String(value).trim() === '')) {
    console.error(`FATAL: ${name} is required in production`);
    process.exit(1);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd,
  isDev: !isProd,
  port: parseInt(process.env.PORT || '5001', 10),
  // Prefer MONGO_URI; also accept DB_CONNECTION / DB_CONNECTION alias
  mongoUri: process.env.MONGO_URI || process.env.DB_CONNECTION || process.env.DB_CONNCETION || '',
  jwtSecret: (() => {
    const secret = process.env.JWT_SECRET || '';
    if (isProd) {
      if (!secret || secret.length < 32) {
        console.error('FATAL: JWT_SECRET must be at least 32 characters in production');
        process.exit(1);
      }
      if (
        secret.includes('change_me') ||
        secret.includes('super_secret') ||
        secret === 'sarkari_result_super_secret_jwt_key_2026'
      ) {
        console.error('FATAL: Change default JWT_SECRET before production deploy');
        process.exit(1);
      }
    }
    return secret || 'dev_only_jwt_secret_not_for_production_use_32';
  })(),
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  corsOrigin: process.env.CORS_ORIGIN || (isProd ? '' : 'http://localhost:5173'),
  adminEmail: process.env.ADMIN_EMAIL || 'admin@sarkariresult.local',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  /** Only seed demo posts when explicitly enabled (never default on in production) */
  seedDemo: process.env.SEED_DEMO === 'true' || (!isProd && process.env.SEED_DEMO !== 'false'),
  /** Create admin user if missing when SEED_ADMIN=true or in development */
  seedAdmin: process.env.SEED_ADMIN === 'true' || !isProd,
  trustProxy: process.env.TRUST_PROXY === 'true' || isProd,
};

// Production must set CORS and Mongo
if (isProd) {
  requiredInProd('MONGO_URI', env.mongoUri);
  requiredInProd('CORS_ORIGIN', env.corsOrigin);
  if (env.adminPassword === 'admin123') {
    console.error('FATAL: Change ADMIN_PASSWORD from default admin123 in production');
    process.exit(1);
  }
}

export default env;
