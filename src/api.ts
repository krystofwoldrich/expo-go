export function getExpoApiBaseUrl(): string {
  if (process.env.EXPO_STAGING) {
    return 'https://staging-api.expo.dev';
  } else if (process.env.EXPO_LOCAL) {
    return 'http://127.0.0.1:3000';
  }
  return 'https://api.expo.dev';
}

export async function apiGetAsync(path: string): Promise<unknown> {
  const response = await fetch(`${getExpoApiBaseUrl()}/v2/${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Request to Expo API failed with status ${response.status}`);
  }

  return await response.json();
}
