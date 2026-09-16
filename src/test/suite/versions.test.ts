import * as assert from "assert";
import { isAPIUpdateAvailable } from "../../versions";

suite("API update availability", () => {
  test("detects API releases independently of migration releases", () => {
    assert.strictEqual(isAPIUpdateAvailable("1.100.0", "^1.99.0"), true);
    assert.strictEqual(isAPIUpdateAvailable("1.100.1", "^1.100.0"), true);
  });

  test("does not suggest downgrades or updates to the same version", () => {
    assert.strictEqual(isAPIUpdateAvailable("1.100.0", "^1.100.0"), false);
    assert.strictEqual(isAPIUpdateAvailable("1.100.0", "1.101.0"), false);
  });

  test("handles missing versions and unsupported dependency specifications", () => {
    assert.strictEqual(isAPIUpdateAvailable(undefined, "^1.100.0"), false);
    assert.strictEqual(isAPIUpdateAvailable("1.100.0", undefined), false);
    assert.strictEqual(isAPIUpdateAvailable("1.100.0", "latest"), false);
    assert.strictEqual(isAPIUpdateAvailable("invalid", "^1.100.0"), false);
  });
});
