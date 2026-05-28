import "@testing-library/jest-dom";

if (typeof Element !== "undefined") {
  Element.prototype.scrollTo = Element.prototype.scrollTo ?? (() => {});
  Element.prototype.scrollIntoView =
    Element.prototype.scrollIntoView ?? (() => {});
}
