import { resolveMailDeliverTo } from './resolve-mail-to.util';

describe('resolveMailDeliverTo', () => {
  const previous = process.env.MAIL_FORCE_DELIVER_TO;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.MAIL_FORCE_DELIVER_TO;
    } else {
      process.env.MAIL_FORCE_DELIVER_TO = previous;
    }
  });

  it('delivers to hardcoded inbox when MAIL_FORCE_DELIVER_TO is unset', () => {
    delete process.env.MAIL_FORCE_DELIVER_TO;
    const r = resolveMailDeliverTo('cashier@store.com');
    expect(r.overridden).toBe(true);
    expect(r.to).toBe('altamirano.developer@gmail.com');
    expect(r.subjectPrefix).toBe('[Sandbox] ');
  });

  it('delivers to real recipient when MAIL_FORCE_DELIVER_TO=0', () => {
    process.env.MAIL_FORCE_DELIVER_TO = '0';
    const r = resolveMailDeliverTo('cashier@store.com');
    expect(r.overridden).toBe(false);
    expect(r.to).toBe('cashier@store.com');
  });

  it('strips +suffix when not overridden', () => {
    process.env.MAIL_FORCE_DELIVER_TO = '0';
    const r = resolveMailDeliverTo('owner+tag@business.com');
    expect(r.overridden).toBe(false);
    expect(r.to).toBe('owner@business.com');
  });

  it('uses explicit MAIL_FORCE_DELIVER_TO address when set', () => {
    process.env.MAIL_FORCE_DELIVER_TO = 'other@example.com';
    const r = resolveMailDeliverTo('a@b.com');
    expect(r.overridden).toBe(true);
    expect(r.to).toBe('other@example.com');
  });
});
