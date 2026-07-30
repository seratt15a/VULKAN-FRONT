import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { installMockApi } from './mockApi';

beforeEach(() => {
  installMockApi();
});

afterEach(() => {
  localStorage.clear();
});
