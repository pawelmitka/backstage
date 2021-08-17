/*
 * Copyright 2021 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useAsync } from 'react-use';
import { useApi } from '@backstage/core-plugin-api';
import {
  AuthorizeRequestContext,
  AuthorizeResult,
  permissionApiRef,
} from '../api';

export class AsyncPermissionResult {
  constructor(
    private readonly allowed: boolean,
    private readonly pending: boolean,
  ) {}

  static fromAuthorizeResult(authorizeResult: AuthorizeResult | undefined) {
    return new AsyncPermissionResult(
      authorizeResult === AuthorizeResult.ALLOW,
      false,
    );
  }

  static pending() {
    return new AsyncPermissionResult(false, true);
  }

  isAllowed() {
    return this.allowed;
  }

  isPending() {
    return this.pending;
  }
}

export const usePermission = <
  T extends AuthorizeRequestContext = AuthorizeRequestContext,
>(
  permission: string,
  context: T,
): AsyncPermissionResult => {
  const permissionApi = useApi(permissionApiRef);

  const state = useAsync(async () => {
    const { result } = await permissionApi.authorize({
      permission,
      context,
    });

    return result;
  }, [permissionApi, permission]);

  return state.loading
    ? AsyncPermissionResult.pending()
    : AsyncPermissionResult.fromAuthorizeResult(state.value);
};
