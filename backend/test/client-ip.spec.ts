import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { clientIpOf, isTrustedInternalCall, parseTrustProxy } from '../src/common/http/client-ip';

describe('clientIpOf', () => {
  const secret = 's3cret';

  it('uses the forwarded visitor IP only when the internal secret matches', () => {
    const req = { ip: '172.18.0.5', headers: { 'x-internal-secret': secret, 'x-client-ip': '203.0.113.7' } };
    assert.equal(clientIpOf(req, secret), '203.0.113.7');
  });

  it('ignores the forwarded IP with a wrong or missing secret', () => {
    assert.equal(clientIpOf({ ip: '172.18.0.5', headers: { 'x-internal-secret': 'nope', 'x-client-ip': '1.2.3.4' } }, secret), '172.18.0.5');
    assert.equal(clientIpOf({ ip: '172.18.0.5', headers: { 'x-client-ip': '1.2.3.4' } }, secret), '172.18.0.5');
  });

  it('never trusts the header when no secret is configured', () => {
    const req = { ip: '172.18.0.5', headers: { 'x-internal-secret': '', 'x-client-ip': '1.2.3.4' } };
    assert.equal(clientIpOf(req, undefined), '172.18.0.5');
    assert.equal(isTrustedInternalCall(req, undefined), false);
  });

  it('falls back to the socket address, then "unknown"', () => {
    assert.equal(clientIpOf({ socket: { remoteAddress: '::1' } }, secret), '::1');
    assert.equal(clientIpOf({}, secret), 'unknown');
  });

  it('rejects absurdly long forwarded values', () => {
    const req = { ip: '172.18.0.5', headers: { 'x-internal-secret': secret, 'x-client-ip': 'x'.repeat(65) } };
    assert.equal(clientIpOf(req, secret), '172.18.0.5');
  });
});

describe('parseTrustProxy', () => {
  it('defaults to trusting private-network proxies only', () => {
    assert.equal(parseTrustProxy(undefined), 'loopback, linklocal, uniquelocal');
    assert.equal(parseTrustProxy('  '), 'loopback, linklocal, uniquelocal');
  });

  it('accepts hop counts, booleans and subnet lists', () => {
    assert.equal(parseTrustProxy('2'), 2);
    assert.equal(parseTrustProxy('0'), 0);
    assert.equal(parseTrustProxy('true'), true);
    assert.equal(parseTrustProxy('FALSE'), false);
    assert.equal(parseTrustProxy('10.0.0.0/8'), '10.0.0.0/8');
  });
});
