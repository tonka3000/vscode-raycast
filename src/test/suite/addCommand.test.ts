import * as assert from "assert";
import { makeCommandFilename, makeCommandFunctionName } from "../../commands/addCommand";

suite("addCommand", () => {
  test("makeCommandFunctionName", () => {
    [
      {
        input: "test",
        should: "Test",
      },
      {
        input: "Test",
        should: "Test",
      },
      {
        input: "A Cmd - With Characters",
        should: "ACmdWithCharacters",
      },
      {
        input: "A ~. Cmd",
        should: "ACmd",
      },
      {
        input: " Test ",
        should: "Test"
      }
    ].forEach(({ input, should }) => assert.strictEqual(makeCommandFunctionName(input), should));

    [
      {
        input: "test",
        not: "test",
      },
    ].forEach(({ input, not }) => assert.notStrictEqual(makeCommandFunctionName(input), not));
  });
  test("makeCommandFilename", () => {
    [
      {
        input: "Test A Command",
        should: "testACommand",
      },
      {
        input: "Test ~ A Command",
        should: "test~ACommand",
      },
      {
        input: "Test - A - Command",
        should: "test-A-Command",
      },
      {
        input: "Test . A - Command",
        should: "test.A-Command",
      },
      {
        input: " Test ",
        should: "test"
      }
    ].forEach(({ input, should }) => assert.strictEqual(makeCommandFilename(input), should));
  });
});
