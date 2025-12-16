import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const creator1 = accounts.get("wallet_1")!;
const creator2 = accounts.get("wallet_2")!;
const user1 = accounts.get("wallet_3")!;
const user2 = accounts.get("wallet_4")!;

/*
  StackStream Creator Registry Contract Tests
  Testing creator registration, verification, content management, and reputation system
*/

describe("Creator Registry Contract", () => {
  describe("Creator Registration", () => {
    it("allows new creator to register with valid parameters", () => {
      const { result } = simnet.callPublicFn(
        "creator-registry",
        "register-creator",
        [
          Cl.stringAscii("creator_one"),
          Cl.stringUtf8("Passionate content creator"),
          Cl.stringUtf8("https://example.com/avatar.jpg"),
        ],
        creator1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      // Verify creator data was stored
      const creatorData = simnet.callReadOnlyFn(
        "creator-registry",
        "get-creator",
        [Cl.principal(creator1)],
        creator1
      );
      
      expect(creatorData.result).toBeOk(Cl.some(Cl.tuple({
        username: Cl.stringAscii("creator_one"),
        bio: Cl.stringUtf8("Passionate content creator"),
        "profile-image-url": Cl.stringUtf8("https://example.com/avatar.jpg"),
        "is-verified": Cl.bool(false),
        "reputation-score": Cl.uint(100),
        "total-content": Cl.uint(0),
        "total-revenue": Cl.uint(0),
        "registered-at": Cl.uint(simnet.blockHeight),
        "verification-stake": Cl.uint(0)
      })));
    });

    it("prevents registration with duplicate username", () => {
      simnet.callPublicFn(
        "creator-registry",
        "register-creator",
        [
          Cl.stringAscii("unique_creator"),
          Cl.stringUtf8("First creator"),
          Cl.stringUtf8("https://example.com/avatar1.jpg"),
        ],
        creator1
      );
      
      const { result } = simnet.callPublicFn(
        "creator-registry",
        "register-creator",
        [
          Cl.stringAscii("unique_creator"),
          Cl.stringUtf8("Second creator"),
          Cl.stringUtf8("https://example.com/avatar2.jpg"),
        ],
        creator2
      );
      
      expect(result).toBeErr(Cl.uint(102)); // err-already-exists
    });

    it("prevents same address from registering twice", () => {
      simnet.callPublicFn(
        "creator-registry",
        "register-creator",
        [
          Cl.stringAscii("first_username"),
          Cl.stringUtf8("Bio"),
          Cl.stringUtf8("https://example.com/avatar.jpg"),
        ],
        creator1
      );
      
      const { result } = simnet.callPublicFn(
        "creator-registry",
        "register-creator",
        [
          Cl.stringAscii("second_username"),
          Cl.stringUtf8("Different bio"),
          Cl.stringUtf8("https://example.com/avatar2.jpg"),
        ],
        creator1
      );
      
      expect(result).toBeErr(Cl.uint(102)); // err-already-exists
    });

    it("rejects username that is too short", () => {
      const { result } = simnet.callPublicFn(
        "creator-registry",
        "register-creator",
        [
          Cl.stringAscii("ab"), // Only 2 characters
          Cl.stringUtf8("Bio"),
          Cl.stringUtf8("https://example.com/avatar.jpg"),
        ],
        creator1
      );
      
      expect(result).toBeErr(Cl.uint(105)); // err-invalid-input
    });

    it("increments total creators count", () => {
      const beforeCount = simnet.callReadOnlyFn(
        "creator-registry",
        "get-total-creators",
        [],
        deployer
      );
      
      simnet.callPublicFn(
        "creator-registry",
        "register-creator",
        [
          Cl.stringAscii("new_creator"),
          Cl.stringUtf8("Bio"),
          Cl.stringUtf8("https://example.com/avatar.jpg"),
        ],
        creator1
      );
      
      const afterCount = simnet.callReadOnlyFn(
        "creator-registry",
        "get-total-creators",
        [],
        deployer
      );
      
      expect(afterCount.result).toBeOk(
        Cl.uint(Cl.unwrapUInt(beforeCount.result) + 1)
      );
    });
  });

  describe("Profile Management", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "creator-registry",
        "register-creator",
        [
          Cl.stringAscii("test_creator"),
          Cl.stringUtf8("Original bio"),
          Cl.stringUtf8("https://example.com/original.jpg"),
        ],
        creator1
      );
    });

    it("allows creator to update profile", () => {
      const { result } = simnet.callPublicFn(
        "creator-registry",
        "update-profile",
        [
          Cl.stringUtf8("Updated bio with new information"),
          Cl.stringUtf8("https://example.com/updated.jpg"),
        ],
        creator1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const creatorData = simnet.callReadOnlyFn(
        "creator-registry",
        "get-creator",
        [Cl.principal(creator1)],
        creator1
      );
      
      const data = Cl.unwrap(creatorData.result);
      expect(Cl.unwrap(data).bio).toEqual(Cl.stringUtf8("Updated bio with new information"));
      expect(Cl.unwrap(data)["profile-image-url"]).toEqual(
        Cl.stringUtf8("https://example.com/updated.jpg")
      );
    });

    it("prevents non-registered user from updating profile", () => {
      const { result } = simnet.callPublicFn(
        "creator-registry",
        "update-profile",
        [
          Cl.stringUtf8("New bio"),
          Cl.stringUtf8("https://example.com/new.jpg"),
        ],
        user1
      );
      
      expect(result).toBeErr(Cl.uint(101)); // err-not-found
    });
  });

  describe("Verification System", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "creator-registry",
        "register-creator",
        [
          Cl.stringAscii("verify_me"),
          Cl.stringUtf8("Bio"),
          Cl.stringUtf8("https://example.com/avatar.jpg"),
        ],
        creator1
      );
    });

    it("allows creator to verify identity by staking", () => {
      const { result } = simnet.callPublicFn(
        "creator-registry",
        "verify-identity",
        [],
        creator1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const creatorData = simnet.callReadOnlyFn(
        "creator-registry",
        "get-creator",
        [Cl.principal(creator1)],
        creator1
      );
      
      const data = Cl.unwrap(creatorData.result);
      expect(Cl.unwrap(data)["is-verified"]).toEqual(Cl.bool(true));
      expect(Cl.unwrap(data)["verification-stake"]).toEqual(Cl.uint(10000000));
      expect(Cl.unwrap(data)["reputation-score"]).toEqual(Cl.uint(600)); // 100 + 500 bonus
    });

    it("mints creator badge NFT upon verification", () => {
      simnet.callPublicFn(
        "creator-registry",
        "verify-identity",
        [],
        creator1
      );
      
      const badgeOwner = simnet.callReadOnlyFn(
        "creator-registry",
        "get-badge-owner",
        [Cl.uint(1)],
        creator1
      );
      
      expect(badgeOwner.result).toBeOk(Cl.some(Cl.principal(creator1)));
    });

    it("prevents double verification", () => {
      simnet.callPublicFn(
        "creator-registry",
        "verify-identity",
        [],
        creator1
      );
      
      const { result } = simnet.callPublicFn(
        "creator-registry",
        "verify-identity",
        [],
        creator1
      );
      
      expect(result).toBeErr(Cl.uint(102)); // err-already-exists
    });

    it("allows refunding verification stake", () => {
      simnet.callPublicFn(
        "creator-registry",
        "verify-identity",
        [],
        creator1
      );
      
      const { result } = simnet.callPublicFn(
        "creator-registry",
        "refund-verification-stake",
        [],
        creator1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const creatorData = simnet.callReadOnlyFn(
        "creator-registry",
        "get-creator",
        [Cl.principal(creator1)],
        creator1
      );
      
      const data = Cl.unwrap(creatorData.result);
      expect(Cl.unwrap(data)["is-verified"]).toEqual(Cl.bool(false));
      expect(Cl.unwrap(data)["verification-stake"]).toEqual(Cl.uint(0));
    });
  });

  describe("Content Management", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "creator-registry",
        "register-creator",
        [
          Cl.stringAscii("content_creator"),
          Cl.stringUtf8("Bio"),
          Cl.stringUtf8("https://example.com/avatar.jpg"),
        ],
        creator1
      );
    });

    it("allows creator to add content metadata", () => {
      const contentHash = new Uint8Array(32).fill(1);
      
      const { result } = simnet.callPublicFn(
        "creator-registry",
        "add-content",
        [
          Cl.stringUtf8("My First Video"),
          Cl.stringUtf8("An amazing video about blockchain technology"),
          Cl.buffer(contentHash),
          Cl.uint(1000000), // 1 STX
        ],
        creator1
      );
      
      expect(result).toBeOk(Cl.uint(1)); // First content ID
      
      const contentData = simnet.callReadOnlyFn(
        "creator-registry",
        "get-content-metadata",
        [Cl.principal(creator1), Cl.uint(1)],
        creator1
      );
      
      const data = Cl.unwrap(contentData.result);
      expect(Cl.unwrap(data).title).toEqual(Cl.stringUtf8("My First Video"));
      expect(Cl.unwrap(data).price).toEqual(Cl.uint(1000000));
      expect(Cl.unwrap(data)["is-active"]).toEqual(Cl.bool(true));
    });

    it("increments reputation when adding content", () => {
      const beforeData = simnet.callReadOnlyFn(
        "creator-registry",
        "get-creator",
        [Cl.principal(creator1)],
        creator1
      );
      const beforeRep = Cl.unwrap(Cl.unwrap(beforeData.result))["reputation-score"];
      
      const contentHash = new Uint8Array(32).fill(1);
      simnet.callPublicFn(
        "creator-registry",
        "add-content",
        [
          Cl.stringUtf8("Title"),
          Cl.stringUtf8("Description"),
          Cl.buffer(contentHash),
          Cl.uint(1000000),
        ],
        creator1
      );
      
      const afterData = simnet.callReadOnlyFn(
        "creator-registry",
        "get-creator",
        [Cl.principal(creator1)],
        creator1
      );
      const afterRep = Cl.unwrap(Cl.unwrap(afterData.result))["reputation-score"];
      
      expect(afterRep).toEqual(Cl.uint(Cl.unwrapUInt(beforeRep) + 10));
    });

    it("allows toggling content status", () => {
      const contentHash = new Uint8Array(32).fill(1);
      simnet.callPublicFn(
        "creator-registry",
        "add-content",
        [
          Cl.stringUtf8("Title"),
          Cl.stringUtf8("Description"),
          Cl.buffer(contentHash),
          Cl.uint(1000000),
        ],
        creator1
      );
      
      const { result } = simnet.callPublicFn(
        "creator-registry",
        "toggle-content-status",
        [Cl.uint(1)],
        creator1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const contentData = simnet.callReadOnlyFn(
        "creator-registry",
        "get-content-metadata",
        [Cl.principal(creator1), Cl.uint(1)],
        creator1
      );
      
      expect(Cl.unwrap(Cl.unwrap(contentData.result))["is-active"]).toEqual(Cl.bool(false));
    });

    it("prevents adding content with zero price", () => {
      const contentHash = new Uint8Array(32).fill(1);
      
      const { result } = simnet.callPublicFn(
        "creator-registry",
        "add-content",
        [
          Cl.stringUtf8("Title"),
          Cl.stringUtf8("Description"),
          Cl.buffer(contentHash),
          Cl.uint(0), // Invalid price
        ],
        creator1
      );
      
      expect(result).toBeErr(Cl.uint(105)); // err-invalid-input
    });

    it("tracks content count per creator", () => {
      const contentHash = new Uint8Array(32).fill(1);
      
      simnet.callPublicFn(
        "creator-registry",
        "add-content",
        [
          Cl.stringUtf8("Content 1"),
          Cl.stringUtf8("Description"),
          Cl.buffer(contentHash),
          Cl.uint(1000000),
        ],
        creator1
      );
      
      simnet.callPublicFn(
        "creator-registry",
        "add-content",
        [
          Cl.stringUtf8("Content 2"),
          Cl.stringUtf8("Description"),
          Cl.buffer(contentHash),
          Cl.uint(2000000),
        ],
        creator1
      );
      
      const count = simnet.callReadOnlyFn(
        "creator-registry",
        "get-creator-content-count",
        [Cl.principal(creator1)],
        creator1
      );
      
      expect(count.result).toBeOk(Cl.uint(2));
    });
  });

  describe("Content Access Recording", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "creator-registry",
        "register-creator",
        [
          Cl.stringAscii("content_creator"),
          Cl.stringUtf8("Bio"),
          Cl.stringUtf8("https://example.com/avatar.jpg"),
        ],
        creator1
      );
      
      const contentHash = new Uint8Array(32).fill(1);
      simnet.callPublicFn(
        "creator-registry",
        "add-content",
        [
          Cl.stringUtf8("Title"),
          Cl.stringUtf8("Description"),
          Cl.buffer(contentHash),
          Cl.uint(1000000),
        ],
        creator1
      );
    });

    it("records content access and updates metrics", () => {
      const { result } = simnet.callPublicFn(
        "creator-registry",
        "record-content-access",
        [
          Cl.principal(creator1),
          Cl.uint(1),
          Cl.uint(850000), // Creator's share
        ],
        user1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const contentData = simnet.callReadOnlyFn(
        "creator-registry",
        "get-content-metadata",
        [Cl.principal(creator1), Cl.uint(1)],
        user1
      );
      
      const data = Cl.unwrap(contentData.result);
      expect(Cl.unwrap(data)["access-count"]).toEqual(Cl.uint(1));
      expect(Cl.unwrap(data).revenue).toEqual(Cl.uint(850000));
    });

    it("updates creator total revenue", () => {
      simnet.callPublicFn(
        "creator-registry",
        "record-content-access",
        [
          Cl.principal(creator1),
          Cl.uint(1),
          Cl.uint(850000),
        ],
        user1
      );
      
      const creatorData = simnet.callReadOnlyFn(
        "creator-registry",
        "get-creator",
        [Cl.principal(creator1)],
        user1
      );
      
      const data = Cl.unwrap(creatorData.result);
      expect(Cl.unwrap(data)["total-revenue"]).toEqual(Cl.uint(850000));
    });
  });

  describe("Username Lookup", () => {
    it("allows looking up creator by username", () => {
      simnet.callPublicFn(
        "creator-registry",
        "register-creator",
        [
          Cl.stringAscii("findme"),
          Cl.stringUtf8("Bio"),
          Cl.stringUtf8("https://example.com/avatar.jpg"),
        ],
        creator1
      );
      
      const result = simnet.callReadOnlyFn(
        "creator-registry",
        "get-creator-by-username",
        [Cl.stringAscii("findme")],
        user1
      );
      
      expect(result.result).toBeOk(Cl.some(Cl.tuple({
        username: Cl.stringAscii("findme"),
        // ... other fields
      })));
    });

    it("returns none for non-existent username", () => {
      const result = simnet.callReadOnlyFn(
        "creator-registry",
        "get-creator-by-username",
        [Cl.stringAscii("nonexistent")],
        user1
      );
      
      expect(result.result).toBeOk(Cl.none());
    });
  });

  describe("Admin Functions", () => {
    it("allows owner to set platform treasury", () => {
      const { result } = simnet.callPublicFn(
        "creator-registry",
        "set-platform-treasury",
        [Cl.principal(user1)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from setting treasury", () => {
      const { result } = simnet.callPublicFn(
        "creator-registry",
        "set-platform-treasury",
        [Cl.principal(user1)],
        creator1
      );
      
      expect(result).toBeErr(Cl.uint(100)); // err-owner-only
    });

    it("allows owner to adjust creator reputation", () => {
      simnet.callPublicFn(
        "creator-registry",
        "register-creator",
        [
          Cl.stringAscii("adjust_rep"),
          Cl.stringUtf8("Bio"),
          Cl.stringUtf8("https://example.com/avatar.jpg"),
        ],
        creator1
      );
      
      const { result } = simnet.callPublicFn(
        "creator-registry",
        "adjust-creator-reputation",
        [Cl.principal(creator1), Cl.uint(5000)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const creatorData = simnet.callReadOnlyFn(
        "creator-registry",
        "get-creator",
        [Cl.principal(creator1)],
        deployer
      );
      
      expect(Cl.unwrap(Cl.unwrap(creatorData.result))["reputation-score"]).toEqual(
        Cl.uint(5000)
      );
    });
  });
});
