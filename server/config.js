module.exports = {
  awsAccesskeyID: process.env.AWS_ACCESS_KEY,
  awsSecretAccessKey: process.env.AWS_SECRET_KEY,
  bucketAccessKeyID:
    process.env.DEPLOY_ENV === "liberty"
      ? process.env.LIBERTY_ACCESS_KEY
      : process.env.AWS_ACCESS_KEY,
  bucketSecretAccessKey:
    process.env.DEPLOY_ENV === "liberty"
      ? process.env.LIBERTY_SECRET_KEY
      : process.env.AWS_SECRET_KEY,
  bucketName:
    process.env.DEPLOY_ENV === "liberty"
      ? process.env.LIBERTY_BUCKET_NAME
      : process.env.AWS_BUCKET_NAME,
  awsBucket: process.env.AWS_BUCKET_NAME,
  awsRegion: "us-east-1",
};
