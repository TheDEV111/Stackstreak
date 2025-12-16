import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const creator1 = accounts.get("wallet_1")!;
const creator2 = accounts.get("wallet_2")!;
const subscriber1 = accounts.get("wallet_3")!;
const subscriber2 = accounts.get("wallet_4")!;
const referrer = accounts.get("wallet_5")!;

/*
  StackStream Subscription Manager Contract Tests
  Testing subscription tiers, renewals, cancellations, and revenue distribution
*/

describe("Subscription Manager Contract", () => {
  describe("Subscription Tier Creation", () => {
    it("allows creator to create basic tier", () => {
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "create-subscription-tier",
        [
          Cl.stringAscii("basic"),
          Cl.uint(10000000), // 10 STX
          Cl.stringUtf8("Access to all basic content"),
          Cl.uint(1000), // Max 1000 subscribers
        ],
        creator1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const tierData = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-subscription-tier",
        [Cl.principal(creator1), Cl.stringAscii("basic")],
        creator1
      );
      
      const data = Cl.unwrap(tierData.result);
      expect(Cl.unwrap(data)["monthly-price"]).toEqual(Cl.uint(10000000));
      expect(Cl.unwrap(data)["tier-level"]).toEqual(Cl.uint(1));
      expect(Cl.unwrap(data)["is-active"]).toEqual(Cl.bool(true));
    });

    it("allows creator to create premium tier", () => {
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "create-subscription-tier",
        [
          Cl.stringAscii("premium"),
          Cl.uint(35000000), // 35 STX
          Cl.stringUtf8("Access to premium content plus extras"),
          Cl.uint(500),
        ],
        creator1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const tierData = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-subscription-tier",
        [Cl.principal(creator1), Cl.stringAscii("premium")],
        creator1
      );
      
      expect(Cl.unwrap(Cl.unwrap(tierData.result))["tier-level"]).toEqual(Cl.uint(2));
    });

    it("allows creator to create VIP tier", () => {
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "create-subscription-tier",
        [
          Cl.stringAscii("vip"),
          Cl.uint(75000000), // 75 STX
          Cl.stringUtf8("VIP access with exclusive benefits"),
          Cl.uint(100),
        ],
        creator1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const tierData = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-subscription-tier",
        [Cl.principal(creator1), Cl.stringAscii("vip")],
        creator1
      );
      
      expect(Cl.unwrap(Cl.unwrap(tierData.result))["tier-level"]).toEqual(Cl.uint(3));
    });

    it("rejects tier with invalid price range", () => {
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "create-subscription-tier",
        [
          Cl.stringAscii("invalid"),
          Cl.uint(2000000), // 2 STX - below minimum
          Cl.stringUtf8("Benefits"),
          Cl.uint(100),
        ],
        creator1
      );
      
      expect(result).toBeErr(Cl.uint(205)); // err-invalid-input
    });

    it("prevents creating duplicate tier names", () => {
      simnet.callPublicFn(
        "subscription-manager",
        "create-subscription-tier",
        [
          Cl.stringAscii("basic"),
          Cl.uint(10000000),
          Cl.stringUtf8("Benefits"),
          Cl.uint(100),
        ],
        creator1
      );
      
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "create-subscription-tier",
        [
          Cl.stringAscii("basic"),
          Cl.uint(15000000),
          Cl.stringUtf8("Different benefits"),
          Cl.uint(200),
        ],
        creator1
      );
      
      expect(result).toBeErr(Cl.uint(202)); // err-already-exists
    });
  });

  describe("Subscription Management", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "subscription-manager",
        "create-subscription-tier",
        [
          Cl.stringAscii("basic"),
          Cl.uint(10000000),
          Cl.stringUtf8("Basic benefits"),
          Cl.uint(1000),
        ],
        creator1
      );
    });

    it("allows user to subscribe to creator", () => {
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "subscribe",
        [
          Cl.principal(creator1),
          Cl.stringAscii("basic"),
          Cl.none(),
        ],
        subscriber1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const subData = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-subscription",
        [Cl.principal(subscriber1), Cl.principal(creator1)],
        subscriber1
      );
      
      const data = Cl.unwrap(subData.result);
      expect(Cl.unwrap(data)["tier-name"]).toEqual(Cl.stringAscii("basic"));
      expect(Cl.unwrap(data)["is-active"]).toEqual(Cl.bool(true));
      expect(Cl.unwrap(data)["auto-renew"]).toEqual(Cl.bool(true));
    });

    it("tracks referral when subscribing with referrer", () => {
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "subscribe",
        [
          Cl.principal(creator1),
          Cl.stringAscii("basic"),
          Cl.some(Cl.principal(referrer)),
        ],
        subscriber1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const earnings = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-referral-earnings",
        [Cl.principal(referrer)],
        referrer
      );
      
      // Referrer should get 5% of 10 STX = 0.5 STX = 500000 microSTX
      expect(earnings.result).toBeOk(Cl.uint(500000));
    });

    it("prevents duplicate subscriptions", () => {
      simnet.callPublicFn(
        "subscription-manager",
        "subscribe",
        [
          Cl.principal(creator1),
          Cl.stringAscii("basic"),
          Cl.none(),
        ],
        subscriber1
      );
      
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "subscribe",
        [
          Cl.principal(creator1),
          Cl.stringAscii("basic"),
          Cl.none(),
        ],
        subscriber1
      );
      
      expect(result).toBeErr(Cl.uint(202)); // err-already-exists
    });

    it("increments tier subscriber count", () => {
      simnet.callPublicFn(
        "subscription-manager",
        "subscribe",
        [
          Cl.principal(creator1),
          Cl.stringAscii("basic"),
          Cl.none(),
        ],
        subscriber1
      );
      
      const tierData = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-subscription-tier",
        [Cl.principal(creator1), Cl.stringAscii("basic")],
        creator1
      );
      
      expect(Cl.unwrap(Cl.unwrap(tierData.result))["current-subscribers"]).toEqual(Cl.uint(1));
    });

    it("updates creator subscription stats", () => {
      simnet.callPublicFn(
        "subscription-manager",
        "subscribe",
        [
          Cl.principal(creator1),
          Cl.stringAscii("basic"),
          Cl.none(),
        ],
        subscriber1
      );
      
      const stats = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-creator-stats",
        [Cl.principal(creator1)],
        creator1
      );
      
      const data = Cl.unwrap(stats.result);
      expect(Cl.unwrap(data)["total-subscribers"]).toEqual(Cl.uint(1));
      expect(Cl.unwrap(data)["active-subscribers"]).toEqual(Cl.uint(1));
    });

    it("increments total subscriptions counter", () => {
      const before = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-total-subscriptions",
        [],
        deployer
      );
      
      simnet.callPublicFn(
        "subscription-manager",
        "subscribe",
        [
          Cl.principal(creator1),
          Cl.stringAscii("basic"),
          Cl.none(),
        ],
        subscriber1
      );
      
      const after = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-total-subscriptions",
        [],
        deployer
      );
      
      expect(after.result).toBeOk(Cl.uint(Cl.unwrapUInt(before.result) + 1));
    });
  });

  describe("Subscription Cancellation", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "subscription-manager",
        "create-subscription-tier",
        [
          Cl.stringAscii("basic"),
          Cl.uint(10000000),
          Cl.stringUtf8("Benefits"),
          Cl.uint(1000),
        ],
        creator1
      );
      
      simnet.callPublicFn(
        "subscription-manager",
        "subscribe",
        [
          Cl.principal(creator1),
          Cl.stringAscii("basic"),
          Cl.none(),
        ],
        subscriber1
      );
    });

    it("allows subscriber to cancel subscription", () => {
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "cancel-subscription",
        [Cl.principal(creator1)],
        subscriber1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const subData = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-subscription",
        [Cl.principal(subscriber1), Cl.principal(creator1)],
        subscriber1
      );
      
      const data = Cl.unwrap(subData.result);
      expect(Cl.unwrap(data)["is-active"]).toEqual(Cl.bool(false));
      expect(Cl.unwrap(data)["auto-renew"]).toEqual(Cl.bool(false));
    });

    it("decrements active subscriptions counter", () => {
      const before = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-total-active-subscriptions",
        [],
        deployer
      );
      
      simnet.callPublicFn(
        "subscription-manager",
        "cancel-subscription",
        [Cl.principal(creator1)],
        subscriber1
      );
      
      const after = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-total-active-subscriptions",
        [],
        deployer
      );
      
      expect(after.result).toBeOk(Cl.uint(Cl.unwrapUInt(before.result) - 1));
    });

    it("updates tier subscriber count on cancellation", () => {
      simnet.callPublicFn(
        "subscription-manager",
        "cancel-subscription",
        [Cl.principal(creator1)],
        subscriber1
      );
      
      const tierData = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-subscription-tier",
        [Cl.principal(creator1), Cl.stringAscii("basic")],
        creator1
      );
      
      expect(Cl.unwrap(Cl.unwrap(tierData.result))["current-subscribers"]).toEqual(Cl.uint(0));
    });

    it("prevents canceling already canceled subscription", () => {
      simnet.callPublicFn(
        "subscription-manager",
        "cancel-subscription",
        [Cl.principal(creator1)],
        subscriber1
      );
      
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "cancel-subscription",
        [Cl.principal(creator1)],
        subscriber1
      );
      
      expect(result).toBeErr(Cl.uint(206)); // err-subscription-expired
    });
  });

  describe("Subscription Upgrade", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "subscription-manager",
        "create-subscription-tier",
        [
          Cl.stringAscii("basic"),
          Cl.uint(10000000),
          Cl.stringUtf8("Basic benefits"),
          Cl.uint(1000),
        ],
        creator1
      );
      
      simnet.callPublicFn(
        "subscription-manager",
        "create-subscription-tier",
        [
          Cl.stringAscii("premium"),
          Cl.uint(30000000),
          Cl.stringUtf8("Premium benefits"),
          Cl.uint(500),
        ],
        creator1
      );
      
      simnet.callPublicFn(
        "subscription-manager",
        "subscribe",
        [
          Cl.principal(creator1),
          Cl.stringAscii("basic"),
          Cl.none(),
        ],
        subscriber1
      );
    });

    it("allows upgrading from basic to premium", () => {
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "upgrade-subscription",
        [Cl.principal(creator1), Cl.stringAscii("premium")],
        subscriber1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const subData = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-subscription",
        [Cl.principal(subscriber1), Cl.principal(creator1)],
        subscriber1
      );
      
      const data = Cl.unwrap(subData.result);
      expect(Cl.unwrap(data)["tier-name"]).toEqual(Cl.stringAscii("premium"));
      expect(Cl.unwrap(data)["monthly-price"]).toEqual(Cl.uint(30000000));
    });

    it("updates tier subscriber counts on upgrade", () => {
      simnet.callPublicFn(
        "subscription-manager",
        "upgrade-subscription",
        [Cl.principal(creator1), Cl.stringAscii("premium")],
        subscriber1
      );
      
      const basicTier = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-subscription-tier",
        [Cl.principal(creator1), Cl.stringAscii("basic")],
        creator1
      );
      
      const premiumTier = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-subscription-tier",
        [Cl.principal(creator1), Cl.stringAscii("premium")],
        creator1
      );
      
      expect(Cl.unwrap(Cl.unwrap(basicTier.result))["current-subscribers"]).toEqual(Cl.uint(0));
      expect(Cl.unwrap(Cl.unwrap(premiumTier.result))["current-subscribers"]).toEqual(Cl.uint(1));
    });

    it("prevents downgrading to lower tier", () => {
      simnet.callPublicFn(
        "subscription-manager",
        "create-subscription-tier",
        [
          Cl.stringAscii("vip"),
          Cl.uint(60000000),
          Cl.stringUtf8("VIP benefits"),
          Cl.uint(100),
        ],
        creator1
      );
      
      simnet.callPublicFn(
        "subscription-manager",
        "upgrade-subscription",
        [Cl.principal(creator1), Cl.stringAscii("premium")],
        subscriber1
      );
      
      // Try to downgrade from premium to basic
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "upgrade-subscription",
        [Cl.principal(creator1), Cl.stringAscii("basic")],
        subscriber1
      );
      
      expect(result).toBeErr(Cl.uint(205)); // err-invalid-input
    });
  });

  describe("Auto-Renewal Toggle", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "subscription-manager",
        "create-subscription-tier",
        [
          Cl.stringAscii("basic"),
          Cl.uint(10000000),
          Cl.stringUtf8("Benefits"),
          Cl.uint(1000),
        ],
        creator1
      );
      
      simnet.callPublicFn(
        "subscription-manager",
        "subscribe",
        [
          Cl.principal(creator1),
          Cl.stringAscii("basic"),
          Cl.none(),
        ],
        subscriber1
      );
    });

    it("allows toggling auto-renewal off", () => {
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "toggle-auto-renew",
        [Cl.principal(creator1)],
        subscriber1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const subData = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-subscription",
        [Cl.principal(subscriber1), Cl.principal(creator1)],
        subscriber1
      );
      
      expect(Cl.unwrap(Cl.unwrap(subData.result))["auto-renew"]).toEqual(Cl.bool(false));
    });

    it("allows toggling auto-renewal back on", () => {
      simnet.callPublicFn(
        "subscription-manager",
        "toggle-auto-renew",
        [Cl.principal(creator1)],
        subscriber1
      );
      
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "toggle-auto-renew",
        [Cl.principal(creator1)],
        subscriber1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const subData = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-subscription",
        [Cl.principal(subscriber1), Cl.principal(creator1)],
        subscriber1
      );
      
      expect(Cl.unwrap(Cl.unwrap(subData.result))["auto-renew"]).toEqual(Cl.bool(true));
    });
  });

  describe("Subscription Access Check", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "subscription-manager",
        "create-subscription-tier",
        [
          Cl.stringAscii("basic"),
          Cl.uint(10000000),
          Cl.stringUtf8("Benefits"),
          Cl.uint(1000),
        ],
        creator1
      );
      
      simnet.callPublicFn(
        "subscription-manager",
        "subscribe",
        [
          Cl.principal(creator1),
          Cl.stringAscii("basic"),
          Cl.none(),
        ],
        subscriber1
      );
    });

    it("confirms active subscription has access", () => {
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "check-subscription-access",
        [Cl.principal(subscriber1), Cl.principal(creator1)],
        subscriber1
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("denies access after cancellation", () => {
      simnet.callPublicFn(
        "subscription-manager",
        "cancel-subscription",
        [Cl.principal(creator1)],
        subscriber1
      );
      
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "check-subscription-access",
        [Cl.principal(subscriber1), Cl.principal(creator1)],
        subscriber1
      );
      
      expect(result).toBeErr(Cl.uint(206)); // err-subscription-expired
    });

    it("returns subscription active status correctly", () => {
      const activeResult = simnet.callReadOnlyFn(
        "subscription-manager",
        "is-subscription-active",
        [Cl.principal(subscriber1), Cl.principal(creator1)],
        subscriber1
      );
      
      expect(activeResult.result).toBeOk(Cl.bool(true));
      
      simnet.callPublicFn(
        "subscription-manager",
        "cancel-subscription",
        [Cl.principal(creator1)],
        subscriber1
      );
      
      const inactiveResult = simnet.callReadOnlyFn(
        "subscription-manager",
        "is-subscription-active",
        [Cl.principal(subscriber1), Cl.principal(creator1)],
        subscriber1
      );
      
      expect(inactiveResult.result).toBeOk(Cl.bool(false));
    });
  });

  describe("Admin Functions", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "subscription-manager",
        "create-subscription-tier",
        [
          Cl.stringAscii("basic"),
          Cl.uint(10000000),
          Cl.stringUtf8("Benefits"),
          Cl.uint(1000),
        ],
        creator1
      );
    });

    it("allows owner to set platform treasury", () => {
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "set-platform-treasury",
        [Cl.principal(subscriber1)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from setting treasury", () => {
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "set-platform-treasury",
        [Cl.principal(subscriber1)],
        creator1
      );
      
      expect(result).toBeErr(Cl.uint(200)); // err-owner-only
    });

    it("allows owner to deactivate tier", () => {
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "deactivate-tier",
        [Cl.principal(creator1), Cl.stringAscii("basic")],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const tierData = simnet.callReadOnlyFn(
        "subscription-manager",
        "get-subscription-tier",
        [Cl.principal(creator1), Cl.stringAscii("basic")],
        creator1
      );
      
      expect(Cl.unwrap(Cl.unwrap(tierData.result))["is-active"]).toEqual(Cl.bool(false));
    });

    it("prevents non-owner from deactivating tier", () => {
      const { result } = simnet.callPublicFn(
        "subscription-manager",
        "deactivate-tier",
        [Cl.principal(creator1), Cl.stringAscii("basic")],
        creator1
      );
      
      expect(result).toBeErr(Cl.uint(200)); // err-owner-only
    });
  });
});
