const DEVELOPMENT_BUCKET = process.env.AWS_BUCKET_NAME_DEVELOPMENT;
const PRODUCTION_BUCKET = process.env.AWS_BUCKET_NAME_PRODUCTION;
const ENV = process.env.ENV;

export function getBucketByEnv(): string {
  if (ENV === "production") {
    if (!PRODUCTION_BUCKET) {
      throw new Error("Missing AWS_BUCKET_NAME_PRODUCTION in environment");
    }
    return PRODUCTION_BUCKET;
  }

  if (ENV === "development") {
    if (!DEVELOPMENT_BUCKET) {
      throw new Error("Missing AWS_BUCKET_NAME_DEVELOPMENT in environment");
    }
    return DEVELOPMENT_BUCKET;
  }

  throw new Error(`Unknown ENV value: ${ENV}`);
}
