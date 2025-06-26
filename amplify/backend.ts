import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { sayHello } from './functions/say-hello/resource';
/**
 * バックエンドの定義
 */
const backend = defineBackend({
  auth,
  data,
  sayHello
});

