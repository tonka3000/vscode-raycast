import * as assert from "assert";
import { makeCommandFunctionName } from "../../commands/addCommand";

suite("addCommand", () => {
  test("makeCommandFunctionName", () => {
    [
      {
        in: "test",
        should: "Test",
      },
      {
        in: "Test",
        should: "Test",
      },
      {
        in: "A Cmd - With Characters",
        should: "ACmdWithCharacters"
      },
      {
        in: "A ~. Cmd",
        should: "ACmd"
      }
    ].forEach((e) => assert.strictEqual(makeCommandFunctionName(e.in), e.should));
  });
});
