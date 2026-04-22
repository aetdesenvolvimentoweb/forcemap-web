export const getApiUrl = (platform: App.Platform | undefined): string => {
  const base = platform?.env?.API_URL ?? "http://localhost:3333";
  return `${base}/api/v1`;
};

export const isProd = (platform: App.Platform | undefined): boolean => {
  return !!platform?.env?.API_URL;
};

export const internalHeaders = (
  platform: App.Platform | undefined,
): Record<string, string> => {
  const secret = platform?.env?.API_SECRET;
  return secret ? { "X-Internal-Secret": secret } : {};
};
