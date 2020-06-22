import jest from "jest";
import textractParser from "./../textractParser";

test("somethihreiohaldjl;a", () => {
  const data = textractParser(data);
  // data["14. EXPORTING CARRIR"] = "Death Star / 10";
  expect(data["14. EXPORTING CARRIR"]).toBe("Death Star / 10");
});
