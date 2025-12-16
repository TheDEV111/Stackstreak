import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const creator1 = accounts.get("wallet_1")!;
const creator2 = accounts.get("wallet_2")!;
const buyer1 = accounts.get("wallet_3")!;
const buyer2 = accounts.get("wallet_4")!;
const recipient = accounts.get("wallet_5")!;

/*
  StackStream Micropayment Gateway Contract Tests
  Testing micropayments, content access tokens, bundles, and gifting
*/

describe("Micropayment Gateway Contract", () => {
  describe("Single Content Purchase", () => {
    it("allows purchasing content and generates access token", () => {
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-content",
        [
          Cl.principal(creator1),
          Cl.uint(1), // content-id
          Cl.uint(1000000), // 1 STX
        ],
        buyer1
      );
      
      expect(result).toBeOk(Cl.uint(0)); // First token ID
      
      const tokenData = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "get-access-token",
        [Cl.uint(0)],
        buyer1
      );
      
      const data = Cl.unwrap(tokenData.result);
      expect(Cl.unwrap(data).purchaser).toEqual(Cl.principal(buyer1));
      expect(Cl.unwrap(data).creator).toEqual(Cl.principal(creator1));
      expect(Cl.unwrap(data)["content-id"]).toEqual(Cl.uint(1));
      expect(Cl.unwrap(data)["is-active"]).toEqual(Cl.bool(true));
    });

    it("validates price is within allowed range", () => {
      // Too low
      let result = simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-content",
        [
          Cl.principal(creator1),
          Cl.uint(1),
          Cl.uint(50000), // 0.05 STX - below minimum
        ],
        buyer1
      );
      
      expect(result.result).toBeErr(Cl.uint(305)); // err-invalid-input
      
      // Too high
      result = simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-content",
        [
          Cl.principal(creator1),
          Cl.uint(1),
          Cl.uint(15000000), // 15 STX - above maximum
        ],
        buyer1
      );
      
      expect(result.result).toBeErr(Cl.uint(305));
    });

    it("prevents duplicate purchases of same content", () => {
      simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-content",
        [
          Cl.principal(creator1),
          Cl.uint(1),
          Cl.uint(1000000),
        ],
        buyer1
      );
      
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-content",
        [
          Cl.principal(creator1),
          Cl.uint(1),
          Cl.uint(1000000),
        ],
        buyer1
      );
      
      expect(result).toBeErr(Cl.uint(307)); // err-already-accessed
    });

    it("distributes payment correctly to creator and platform", () => {
      const creatorBalanceBefore = simnet.getAssetsMap().get("STX")?.get(creator1) || 0;
      const platformBalanceBefore = simnet.getAssetsMap().get("STX")?.get(deployer) || 0;
      
      simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-content",
        [
          Cl.principal(creator1),
          Cl.uint(1),
          Cl.uint(1000000), // 1 STX
        ],
        buyer1
      );
      
      // Creator should get 95% = 950000 microSTX
      // Platform should get 5% = 50000 microSTX
      const creatorBalanceAfter = simnet.getAssetsMap().get("STX")?.get(creator1) || 0;
      const platformBalanceAfter = simnet.getAssetsMap().get("STX")?.get(deployer) || 0;
      
      expect(creatorBalanceAfter - creatorBalanceBefore).toBe(950000);
      expect(platformBalanceAfter - platformBalanceBefore).toBe(50000);
    });

    it("updates transaction statistics", () => {
      const beforeTotal = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "get-total-transactions",
        [],
        deployer
      );
      
      const beforeVolume = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "get-total-volume",
        [],
        deployer
      );
      
      simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-content",
        [
          Cl.principal(creator1),
          Cl.uint(1),
          Cl.uint(1000000),
        ],
        buyer1
      );
      
      const afterTotal = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "get-total-transactions",
        [],
        deployer
      );
      
      const afterVolume = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "get-total-volume",
        [],
        deployer
      );
      
      expect(afterTotal.result).toBeOk(Cl.uint(Cl.unwrapUInt(beforeTotal.result) + 1));
      expect(afterVolume.result).toBeOk(Cl.uint(Cl.unwrapUInt(beforeVolume.result) + 1000000));
    });

    it("updates creator payment stats", () => {
      simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-content",
        [
          Cl.principal(creator1),
          Cl.uint(1),
          Cl.uint(1000000),
        ],
        buyer1
      );
      
      const stats = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "get-creator-payment-stats",
        [Cl.principal(creator1)],
        creator1
      );
      
      const data = Cl.unwrap(stats.result);
      expect(Cl.unwrap(data)["total-transactions"]).toEqual(Cl.uint(1));
      expect(Cl.unwrap(data)["total-revenue"]).toEqual(Cl.uint(950000)); // 95% of 1 STX
      expect(Cl.unwrap(data)["total-content-sold"]).toEqual(Cl.uint(1));
    });

    it("tracks user transaction count", () => {
      simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-content",
        [
          Cl.principal(creator1),
          Cl.uint(1),
          Cl.uint(1000000),
        ],
        buyer1
      );
      
      simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-content",
        [
          Cl.principal(creator1),
          Cl.uint(2),
          Cl.uint(2000000),
        ],
        buyer1
      );
      
      const count = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "get-user-transaction-count",
        [Cl.principal(buyer1)],
        buyer1
      );
      
      expect(count.result).toBeOk(Cl.uint(2));
    });
  });

  describe("Batch Purchase", () => {
    it("allows purchasing multiple content items", () => {
      const contentIds = [
        Cl.uint(1),
        Cl.uint(2),
        Cl.uint(3),
      ];
      
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-batch",
        [
          Cl.principal(creator1),
          Cl.list(contentIds),
          Cl.uint(3000000), // 3 STX for 3 items
        ],
        buyer1
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("applies batch discount for 10+ items", () => {
      const contentIds = Array.from({ length: 10 }, (_, i) => Cl.uint(i + 1));
      
      // Base price: 10 STX for 10 items
      // With 10% discount: 9 STX
      const discountedPrice = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "calculate-batch-price",
        [Cl.uint(10), Cl.uint(1000000)], // 10 items at 1 STX each
        buyer1
      );
      
      expect(discountedPrice.result).toBeOk(Cl.uint(9000000)); // 9 STX after 10% discount
    });

    it("records batch transaction correctly", () => {
      const contentIds = [
        Cl.uint(1),
        Cl.uint(2),
        Cl.uint(3),
      ];
      
      simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-batch",
        [
          Cl.principal(creator1),
          Cl.list(contentIds),
          Cl.uint(3000000),
        ],
        buyer1
      );
      
      const tx = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "get-transaction",
        [Cl.uint(0)],
        buyer1
      );
      
      const data = Cl.unwrap(tx.result);
      expect(Cl.unwrap(data)["is-batch"]).toEqual(Cl.bool(true));
      expect(Cl.unwrap(data)["content-ids"]).toEqual(Cl.list(contentIds));
    });

    it("updates creator stats with correct content count", () => {
      const contentIds = [
        Cl.uint(1),
        Cl.uint(2),
        Cl.uint(3),
      ];
      
      simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-batch",
        [
          Cl.principal(creator1),
          Cl.list(contentIds),
          Cl.uint(3000000),
        ],
        buyer1
      );
      
      const stats = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "get-creator-payment-stats",
        [Cl.principal(creator1)],
        creator1
      );
      
      const data = Cl.unwrap(stats.result);
      expect(Cl.unwrap(data)["total-content-sold"]).toEqual(Cl.uint(3));
    });

    it("rejects empty content list", () => {
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-batch",
        [
          Cl.principal(creator1),
          Cl.list([]),
          Cl.uint(1000000),
        ],
        buyer1
      );
      
      expect(result).toBeErr(Cl.uint(305)); // err-invalid-input
    });
  });

  describe("Content Bundles", () => {
    it("allows creator to create content bundle", () => {
      const contentIds = [
        Cl.uint(1),
        Cl.uint(2),
        Cl.uint(3),
      ];
      
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "create-bundle",
        [
          Cl.list(contentIds),
          Cl.uint(2500000), // 2.5 STX for bundle
          Cl.uint(1500), // 15% discount
        ],
        creator1
      );
      
      expect(result).toBeOk(Cl.uint(1)); // First bundle ID
      
      const bundle = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "get-bundle",
        [Cl.principal(creator1), Cl.uint(1)],
        creator1
      );
      
      const data = Cl.unwrap(bundle.result);
      expect(Cl.unwrap(data)["bundle-price"]).toEqual(Cl.uint(2500000));
      expect(Cl.unwrap(data)["discount-percent"]).toEqual(Cl.uint(1500));
      expect(Cl.unwrap(data)["is-active"]).toEqual(Cl.bool(true));
    });

    it("validates bundle has at least 2 items", () => {
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "create-bundle",
        [
          Cl.list([Cl.uint(1)]), // Only 1 item
          Cl.uint(1000000),
          Cl.uint(1000),
        ],
        creator1
      );
      
      expect(result).toBeErr(Cl.uint(305)); // err-invalid-input
    });

    it("prevents discount over 50%", () => {
      const contentIds = [Cl.uint(1), Cl.uint(2)];
      
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "create-bundle",
        [
          Cl.list(contentIds),
          Cl.uint(2000000),
          Cl.uint(6000), // 60% discount - too high
        ],
        creator1
      );
      
      expect(result).toBeErr(Cl.uint(305));
    });

    it("allows purchasing bundle by ID", () => {
      const contentIds = [Cl.uint(1), Cl.uint(2), Cl.uint(3)];
      
      simnet.callPublicFn(
        "micropayment-gateway",
        "create-bundle",
        [
          Cl.list(contentIds),
          Cl.uint(2500000),
          Cl.uint(1500),
        ],
        creator1
      );
      
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-bundle",
        [Cl.principal(creator1), Cl.uint(1)],
        buyer1
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents purchasing inactive bundle", () => {
      const contentIds = [Cl.uint(1), Cl.uint(2)];
      
      simnet.callPublicFn(
        "micropayment-gateway",
        "create-bundle",
        [
          Cl.list(contentIds),
          Cl.uint(2000000),
          Cl.uint(1000),
        ],
        creator1
      );
      
      // Deactivate bundle
      simnet.callPublicFn(
        "micropayment-gateway",
        "deactivate-bundle",
        [Cl.principal(creator1), Cl.uint(1)],
        deployer
      );
      
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-bundle",
        [Cl.principal(creator1), Cl.uint(1)],
        buyer1
      );
      
      expect(result).toBeErr(Cl.uint(305));
    });
  });

  describe("Gifting System", () => {
    it("allows gifting content access to another user", () => {
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "gift-content",
        [
          Cl.principal(recipient),
          Cl.principal(creator1),
          Cl.uint(1), // content-id
          Cl.uint(1000000), // 1 STX
        ],
        buyer1
      );
      
      expect(result).toBeOk(Cl.uint(1)); // First gift ID
      
      const gift = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "get-gift",
        [Cl.principal(buyer1), Cl.principal(recipient), Cl.uint(1)],
        buyer1
      );
      
      const data = Cl.unwrap(gift.result);
      expect(Cl.unwrap(data).creator).toEqual(Cl.principal(creator1));
      expect(Cl.unwrap(data)["content-id"]).toEqual(Cl.uint(1));
      expect(Cl.unwrap(data)["is-claimed"]).toEqual(Cl.bool(false));
    });

    it("prevents gifting to self", () => {
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "gift-content",
        [
          Cl.principal(buyer1), // Same as sender
          Cl.principal(creator1),
          Cl.uint(1),
          Cl.uint(1000000),
        ],
        buyer1
      );
      
      expect(result).toBeErr(Cl.uint(305)); // err-invalid-input
    });

    it("allows recipient to claim gift", () => {
      simnet.callPublicFn(
        "micropayment-gateway",
        "gift-content",
        [
          Cl.principal(recipient),
          Cl.principal(creator1),
          Cl.uint(1),
          Cl.uint(1000000),
        ],
        buyer1
      );
      
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "claim-gift",
        [Cl.principal(buyer1), Cl.uint(1)],
        recipient
      );
      
      expect(result).toBeOk(Cl.uint(0)); // Access token ID
      
      // Verify gift is marked as claimed
      const gift = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "get-gift",
        [Cl.principal(buyer1), Cl.principal(recipient), Cl.uint(1)],
        buyer1
      );
      
      expect(Cl.unwrap(Cl.unwrap(gift.result))["is-claimed"]).toEqual(Cl.bool(true));
    });

    it("prevents claiming same gift twice", () => {
      simnet.callPublicFn(
        "micropayment-gateway",
        "gift-content",
        [
          Cl.principal(recipient),
          Cl.principal(creator1),
          Cl.uint(1),
          Cl.uint(1000000),
        ],
        buyer1
      );
      
      simnet.callPublicFn(
        "micropayment-gateway",
        "claim-gift",
        [Cl.principal(buyer1), Cl.uint(1)],
        recipient
      );
      
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "claim-gift",
        [Cl.principal(buyer1), Cl.uint(1)],
        recipient
      );
      
      expect(result).toBeErr(Cl.uint(307)); // err-already-accessed
    });

    it("creates access token for recipient on claim", () => {
      simnet.callPublicFn(
        "micropayment-gateway",
        "gift-content",
        [
          Cl.principal(recipient),
          Cl.principal(creator1),
          Cl.uint(1),
          Cl.uint(1000000),
        ],
        buyer1
      );
      
      simnet.callPublicFn(
        "micropayment-gateway",
        "claim-gift",
        [Cl.principal(buyer1), Cl.uint(1)],
        recipient
      );
      
      const hasAccess = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "has-valid-access",
        [Cl.principal(recipient), Cl.principal(creator1), Cl.uint(1)],
        recipient
      );
      
      expect(hasAccess.result).toBeOk(Cl.bool(true));
    });
  });

  describe("Access Token Management", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-content",
        [
          Cl.principal(creator1),
          Cl.uint(1),
          Cl.uint(1000000),
        ],
        buyer1
      );
    });

    it("allows verifying valid access token", () => {
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "verify-access",
        [Cl.uint(0)],
        buyer1
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from verifying token", () => {
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "verify-access",
        [Cl.uint(0)],
        buyer2
      );
      
      expect(result).toBeErr(Cl.uint(304)); // err-unauthorized
    });

    it("allows creator to revoke access token", () => {
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "revoke-access",
        [Cl.uint(0)],
        creator1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const tokenData = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "get-access-token",
        [Cl.uint(0)],
        creator1
      );
      
      expect(Cl.unwrap(Cl.unwrap(tokenData.result))["is-active"]).toEqual(Cl.bool(false));
    });

    it("allows contract owner to revoke access token", () => {
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "revoke-access",
        [Cl.uint(0)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents unauthorized user from revoking token", () => {
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "revoke-access",
        [Cl.uint(0)],
        buyer2
      );
      
      expect(result).toBeErr(Cl.uint(304)); // err-unauthorized
    });

    it("checks if user has valid access", () => {
      const hasAccess = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "has-valid-access",
        [Cl.principal(buyer1), Cl.principal(creator1), Cl.uint(1)],
        buyer1
      );
      
      expect(hasAccess.result).toBeOk(Cl.bool(true));
    });

    it("returns false for non-existent access", () => {
      const hasAccess = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "has-valid-access",
        [Cl.principal(buyer2), Cl.principal(creator1), Cl.uint(1)],
        buyer2
      );
      
      expect(hasAccess.result).toBeOk(Cl.bool(false));
    });

    it("retrieves user access token by content", () => {
      const token = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "get-user-access-token",
        [Cl.principal(buyer1), Cl.principal(creator1), Cl.uint(1)],
        buyer1
      );
      
      expect(token.result).toBeOk(Cl.some(Cl.tuple({
        purchaser: Cl.principal(buyer1),
        creator: Cl.principal(creator1),
        "content-id": Cl.uint(1),
        // ... other fields
      })));
    });
  });

  describe("Admin Functions", () => {
    it("allows owner to set platform treasury", () => {
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "set-platform-treasury",
        [Cl.principal(buyer1)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from setting treasury", () => {
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "set-platform-treasury",
        [Cl.principal(buyer1)],
        creator1
      );
      
      expect(result).toBeErr(Cl.uint(300)); // err-owner-only
    });

    it("allows owner to deactivate bundle", () => {
      const contentIds = [Cl.uint(1), Cl.uint(2)];
      
      simnet.callPublicFn(
        "micropayment-gateway",
        "create-bundle",
        [
          Cl.list(contentIds),
          Cl.uint(2000000),
          Cl.uint(1000),
        ],
        creator1
      );
      
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "deactivate-bundle",
        [Cl.principal(creator1), Cl.uint(1)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from deactivating bundle", () => {
      const contentIds = [Cl.uint(1), Cl.uint(2)];
      
      simnet.callPublicFn(
        "micropayment-gateway",
        "create-bundle",
        [
          Cl.list(contentIds),
          Cl.uint(2000000),
          Cl.uint(1000),
        ],
        creator1
      );
      
      const { result } = simnet.callPublicFn(
        "micropayment-gateway",
        "deactivate-bundle",
        [Cl.principal(creator1), Cl.uint(1)],
        buyer1
      );
      
      expect(result).toBeErr(Cl.uint(300)); // err-owner-only
    });
  });

  describe("Read-Only Functions", () => {
    it("returns correct total transactions", () => {
      simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-content",
        [Cl.principal(creator1), Cl.uint(1), Cl.uint(1000000)],
        buyer1
      );
      
      simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-content",
        [Cl.principal(creator1), Cl.uint(2), Cl.uint(2000000)],
        buyer2
      );
      
      const total = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "get-total-transactions",
        [],
        deployer
      );
      
      expect(total.result).toBeOk(Cl.uint(2));
    });

    it("returns correct total volume", () => {
      simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-content",
        [Cl.principal(creator1), Cl.uint(1), Cl.uint(1000000)],
        buyer1
      );
      
      simnet.callPublicFn(
        "micropayment-gateway",
        "purchase-content",
        [Cl.principal(creator1), Cl.uint(2), Cl.uint(2000000)],
        buyer2
      );
      
      const volume = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "get-total-volume",
        [],
        deployer
      );
      
      expect(volume.result).toBeOk(Cl.uint(3000000));
    });

    it("calculates batch discount correctly", () => {
      // Less than threshold - no discount
      let result = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "calculate-batch-price",
        [Cl.uint(5), Cl.uint(1000000)],
        buyer1
      );
      
      expect(result.result).toBeOk(Cl.uint(5000000)); // No discount
      
      // At threshold - 10% discount
      result = simnet.callReadOnlyFn(
        "micropayment-gateway",
        "calculate-batch-price",
        [Cl.uint(10), Cl.uint(1000000)],
        buyer1
      );
      
      expect(result.result).toBeOk(Cl.uint(9000000)); // 10% off
    });
  });
});
