import type { ConfigPlugin } from '@expo/config-plugins';
import { withAndroidManifest } from '@expo/config-plugins';

const SHARE_PACKAGES = [
  'com.instagram.android',
  'com.twitter.android',
  'com.whatsapp',
  'com.zhiliaoapp.musically',
];

type QueryIntent = {
  action?: { $: { 'android:name': string } }[];
  data?: unknown[];
};

type QueryBlock = {
  package?: { $: { 'android:name': string } }[];
  intent?: QueryIntent[];
};

const withShareIntentQueries: ConfigPlugin = (config) =>
  withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest as Record<string, unknown> & {
      queries?: QueryBlock[];
    };

    const queries = (manifest.queries ??= []);
    const block: QueryBlock = queries[0] ?? {};
    if (queries.length === 0) queries.push(block);

    const existingPackages = block.package ?? [];
    const have = new Set(existingPackages.map((p) => p.$['android:name']));
    block.package = [
      ...existingPackages,
      ...SHARE_PACKAGES.filter((name) => !have.has(name)).map((name) => ({
        $: { 'android:name': name },
      })),
    ];

    const existingIntents = block.intent ?? [];
    const hasSend = existingIntents.some((intent) =>
      intent.action?.some((a) => a.$['android:name'] === 'android.intent.action.SEND'),
    );
    block.intent = hasSend
      ? existingIntents
      : [
          ...existingIntents,
          {
            action: [{ $: { 'android:name': 'android.intent.action.SEND' } }],
            data: [{ $: { 'android:mimeType': '*/*' } }],
          },
        ];

    return cfg;
  });

export default withShareIntentQueries;
